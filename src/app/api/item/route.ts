import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export async function PATCH(req: Request) {
  const body = await req.json();
  const { item_id, status, caption_long, scheduled_at, publish_mode, publish_status } = body;
  if (!item_id) return NextResponse.json({ error: "item_id required" }, { status: 400 });

  const sets: string[] = [];
  const params: any[] = [];
  let i = 1;

  if (status) { sets.push(`status=$${i++}`); params.push(status); }
  if (caption_long !== undefined) {
    sets.push(`caption = jsonb_set(caption, '{long}', to_jsonb($${i++}::text), true)`);
    params.push(caption_long);
  }
  if (scheduled_at !== undefined) { sets.push(`scheduled_at=$${i++}`); params.push(scheduled_at); }
  if (publish_mode) { sets.push(`publish_mode=$${i++}`); params.push(publish_mode); }
  if (publish_status) { sets.push(`publish_status=$${i++}`); params.push(publish_status); }

  if (!sets.length) return NextResponse.json({ error: "no_changes" }, { status: 400 });

  params.push(item_id);
  await q(`UPDATE content_items SET ${sets.join(", ")} WHERE id=$${i}`, params);

  const row = await q<any>(`SELECT id, day, topic, format, caption, status, publish_status, publish_mode, scheduled_at FROM content_items WHERE id=$1`, [item_id]);
  return NextResponse.json({ ok: true, item: row[0] ?? null });
}
