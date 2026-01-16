import { Worker } from "bullmq";
import { config } from "@/lib/config";
import { q } from "@/lib/db";
import { instagramImport } from "./processors/instagramImport";
import { websiteCrawl } from "./processors/websiteCrawl";
import { detectProducts } from "./processors/detectProducts";
import { generatePlan } from "./processors/generatePlan";
import { renderFlux } from "./processors/renderFlux";
import { exportPack } from "./processors/exportPack";

const connection = { url: config.redisUrl };

async function markJob(job_id: string | undefined, patch: { status?: string; progress?: number; result?: any; error?: any }) {
  if (!job_id) return;
  const sets: string[] = [];
  const params: any[] = [];
  let i = 1;

  if (patch.status) { sets.push(`status=$${i++}`); params.push(patch.status); }
  if (patch.progress !== undefined) { sets.push(`progress=$${i++}`); params.push(patch.progress); }
  if (patch.result !== undefined) { sets.push(`result=$${i++}`); params.push(JSON.stringify(patch.result)); }
  if (patch.error !== undefined) { sets.push(`error=$${i++}`); params.push(JSON.stringify(patch.error)); }

  sets.push(`updated_at=now()`);
  params.push(job_id);
  await q(`UPDATE jobs SET ${sets.join(", ")} WHERE id=$${i}`, params);
}

new Worker("q_ingest", async (job) => {
  const job_id = job.data?.job_id;
  await markJob(job_id, { status: "running", progress: 0.05 });
  try {
    if (job.name === "instagram.import") {
      const res = await instagramImport(job.data);
      await markJob(job_id, { status: "succeeded", progress: 1, result: res });
      return res;
    }
    if (job.name === "website.crawl") {
      const res = await websiteCrawl(job.data);
      await markJob(job_id, { status: "succeeded", progress: 1, result: res });
      return res;
    }
    throw new Error("Unknown ingest job: " + job.name);
  } catch (e: any) {
    await markJob(job_id, { status: "failed", error: { message: e?.message ?? "unknown_error" } });
    throw e;
  }
}, { connection });

new Worker("q_llm", async (job) => {
  const job_id = job.data?.job_id;
  await markJob(job_id, { status: "running", progress: 0.05 });
  try {
    if (job.name === "products.detect") {
      const res = await detectProducts(job.data);
      await markJob(job_id, { status: "succeeded", progress: 1, result: res });
      return res;
    }
    if (job.name === "plan.generate") {
      const res = await generatePlan(job.data);
      await markJob(job_id, { status: "succeeded", progress: 1, result: res });
      return res;
    }
    throw new Error("Unknown llm job: " + job.name);
  } catch (e: any) {
    await markJob(job_id, { status: "failed", error: { message: e?.message ?? "unknown_error" } });
    throw e;
  }
}, { connection });

new Worker("q_render", async (job) => {
  const job_id = job.data?.job_id;
  await markJob(job_id, { status: "running", progress: 0.05 });
  try {
    if (job.name === "render.flux") {
      const res = await renderFlux(job.data);
      await markJob(job_id, { status: "succeeded", progress: 1, result: res });
      return res;
    }
    throw new Error("Unknown render job: " + job.name);
  } catch (e: any) {
    await markJob(job_id, { status: "failed", error: { message: e?.message ?? "unknown_error" } });
    throw e;
  }
}, { connection });

new Worker("q_export", async (job) => {
  const job_id = job.data?.job_id;
  await markJob(job_id, { status: "running", progress: 0.05 });
  try {
    if (job.name === "export.pack") {
      const res = await exportPack(job.data);
      await markJob(job_id, { status: "succeeded", progress: 1, result: res });
      return res;
    }
    throw new Error("Unknown export job: " + job.name);
  } catch (e: any) {
    await markJob(job_id, { status: "failed", error: { message: e?.message ?? "unknown_error" } });
    throw e;
  }
}, { connection });

console.log("Workers running…");
