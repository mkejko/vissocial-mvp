import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { ProjectStates } from "@/lib/state";

export async function POST(req: Request) {
  const body = await req.json();
  const { project_id, confirm_ids = [], remove_ids = [] } = body;

  if (!project_id) return NextResponse.json({ error: "project_id required" }, { status: 400 });

  if (remove_ids.length) {
    await q(`DELETE FROM products WHERE project_id=$1 AND id = ANY($2)`, [project_id, remove_ids]);
  }

  if (confirm_ids.length) {
    await q(`UPDATE products SET confirmed=true, locked=true WHERE project_id=$1 AND id = ANY($2)`, [project_id, confirm_ids]);
  }

  await q(`UPDATE projects SET state=$1, updated_at=now() WHERE id=$2`,
    [ProjectStates.ready_for_plan, project_id]);

  const confirmed = await q<any>(`SELECT id, name FROM products WHERE project_id=$1 AND confirmed=true`, [project_id]);
  return NextResponse.json({ ok: true, confirmed });
}
