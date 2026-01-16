import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { ProjectStates } from "@/lib/state";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const project_id = url.searchParams.get("project_id");
  const item_id = url.searchParams.get("item_id");
  const include = url.searchParams.get("include");

  if (item_id) {
    const row = await q<any>(`
      SELECT ci.id, ci.day, ci.topic, ci.format, ci.caption, ci.status, ci.publish_status, ci.publish_mode, ci.scheduled_at,
             r.outputs AS latest_render
      FROM content_items ci
      LEFT JOIN LATERAL (
        SELECT outputs
        FROM renders
        WHERE content_item_id = ci.id AND status='succeeded'
        ORDER BY updated_at DESC
        LIMIT 1
      ) r ON true
      WHERE ci.id=$1
    `, [item_id]);
    return NextResponse.json({ item: row[0] ?? null });
  }

  if (!project_id) return NextResponse.json({ error: "project_id required" }, { status: 400 });

  const project = (await q<any>(`SELECT * FROM projects WHERE id=$1`, [project_id]))[0];
  const bp = (await q<any>(`SELECT profile FROM brand_profiles WHERE project_id=$1`, [project_id]))[0]?.profile ?? null;

  const suggested_type = bp?.account_type_suggestion
    ? { type: bp.account_type_suggestion.type, confidence: bp.account_type_suggestion.confidence ?? 0.7 }
    : null;

  let content_pack = null;
  let items: any[] = [];

  if (include === "calendar") {
    content_pack = (await q<any>(
      `SELECT * FROM content_packs WHERE project_id=$1 ORDER BY created_at DESC LIMIT 1`, [project_id]
    ))[0] ?? null;

    if (content_pack) {
      items = await q<any>(`
        SELECT ci.id, ci.day, ci.topic, ci.format, ci.status, ci.publish_status, ci.scheduled_at,
               r.outputs AS latest_render
        FROM content_items ci
        LEFT JOIN LATERAL (
          SELECT outputs
          FROM renders
          WHERE content_item_id = ci.id AND status='succeeded'
          ORDER BY updated_at DESC
          LIMIT 1
        ) r ON true
        WHERE ci.content_pack_id=$1
        ORDER BY ci.day
      `, [content_pack.id]);
    }
  }

  return NextResponse.json({
    project,
    brand_profile: bp,
    suggested_type,
    content_pack,
    items
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { project_id, onboarding } = body;
  if (!project_id) return NextResponse.json({ error: "project_id required" }, { status: 400 });

  await q(`UPDATE projects SET state=$1, plan_month=$2, updated_at=now() WHERE id=$3`,
    [ProjectStates.ready_for_plan, onboarding?.month ?? null, project_id]);

  await q(`INSERT INTO brand_profiles(project_id, language, profile)
           VALUES ($1,'hr',$2)
           ON CONFLICT (project_id) DO UPDATE SET profile = COALESCE(brand_profiles.profile,'{}'::jsonb) || $2`,
    [project_id, JSON.stringify({ onboarding })]);

  return NextResponse.json({ ok: true });
}
