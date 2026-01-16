import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { qLLM } from "@/lib/jobs";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const body = await req.json();
  const { project_id } = body;
  if (!project_id) return NextResponse.json({ error: "project_id required" }, { status: 400 });

  const project = (await q<any>(`SELECT id, plan_type FROM projects WHERE id=$1`, [project_id]))[0];
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  if (project.plan_type !== "pro") return NextResponse.json({ error: "pro_required" }, { status: 403 });

  const pack = (await q<any>(`SELECT * FROM content_packs WHERE project_id=$1 ORDER BY created_at DESC LIMIT 1`, [project_id]))[0];
  if (!pack) return NextResponse.json({ error: "no_pack" }, { status: 400 });

  const bp = (await q<any>(`SELECT profile FROM brand_profiles WHERE project_id=$1`, [project_id]))[0]?.profile ?? {};
  const onboarding = bp?.onboarding ?? {};
  const goals = onboarding?.goal ? [onboarding.goal] : (pack.goals ?? []);
  const frequency = pack.frequency ?? "5_per_week";
  const month = pack.month;

  await q(`DELETE FROM content_packs WHERE id=$1`, [pack.id]);

  const job_id = "job_" + uuid();
  await q(`INSERT INTO jobs(id, project_id, type, status, input) VALUES ($1,$2,'plan.generate','queued',$3)`,
    [job_id, project_id, JSON.stringify({ project_id, month, goals, frequency, source: "regen_month" })]);

  await qLLM.add("plan.generate", { project_id, month, goals, frequency, job_id });

  return NextResponse.json({ ok: true, job_id }, { status: 202 });
}
