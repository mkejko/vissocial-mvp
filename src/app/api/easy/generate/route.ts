import { NextResponse } from "next/server";
import { qLLM } from "@/lib/jobs";
import { q } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const body = await req.json();
  const { project_id, month, goals, frequency } = body;
  if (!project_id || !month) return NextResponse.json({ error: "project_id and month required" }, { status: 400 });

  const job_id = "job_" + uuid();
  await qLLM.add("plan.generate", { project_id, month, goals: goals ?? [], frequency: frequency ?? "5_per_week", job_id });

  await q(`INSERT INTO jobs(id, project_id, type, status, input) VALUES ($1,$2,'plan.generate','queued',$3)`,
    [job_id, project_id, JSON.stringify(body)]);

  return NextResponse.json({ job_id }, { status: 202 });
}
