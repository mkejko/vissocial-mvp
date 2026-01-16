import { NextResponse } from "next/server";
import { qRender } from "@/lib/jobs";
import { q } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const body = await req.json();
  const { content_item_id, instruction } = body;
  if (!content_item_id) return NextResponse.json({ error: "content_item_id required" }, { status: 400 });

  const item = await q<any>(`SELECT visual_brief FROM content_items WHERE id=$1`, [content_item_id]);
  const vb = item[0]?.visual_brief ?? {};
  const prompt = `Photorealistic instagram marketing image. ${vb.scene_description ?? ""} ${instruction ?? ""}`.trim();

  const job_id = "job_" + uuid();
  await qRender.add("render.flux", { content_item_id, prompt, job_id });

  await q(`INSERT INTO jobs(id, project_id, type, status, input)
           SELECT $1, cp.project_id, 'render.flux', 'queued', $2
           FROM content_items ci JOIN content_packs cp ON ci.content_pack_id=cp.id
           WHERE ci.id=$3`,
    [job_id, JSON.stringify(body), content_item_id]);

  return NextResponse.json({ job_id }, { status: 202 });
}
