import { NextResponse } from "next/server";
import { qExport } from "@/lib/jobs";
import { q } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const body = await req.json();
  const { content_pack_id, approved_only } = body;
  if (!content_pack_id) return NextResponse.json({ error: "content_pack_id required" }, { status: 400 });

  const job_id = "job_" + uuid();
  await qExport.add("export.pack", { content_pack_id, approved_only: !!approved_only, job_id });

  await q(`INSERT INTO jobs(id, project_id, type, status, input)
           SELECT $1, project_id, 'export.pack', 'queued', $2
           FROM content_packs WHERE id=$3`,
    [job_id, JSON.stringify(body), content_pack_id]);

  return NextResponse.json({ job_id }, { status: 202 });
}
