import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { qIngest, qLLM } from "@/lib/jobs";
import { ProjectStates } from "@/lib/state";

export async function POST(req: Request) {
  const body = await req.json();
  const project_id = "proj_" + uuid();

  await q(`INSERT INTO projects(id, name, ig_handle, ig_connected, state, plan_type)
           VALUES ($1,$2,$3,false,$4,$5)`,
    [project_id, body.brand_name ?? "Brand", body.ig_handle, ProjectStates.instagram_connected, body.plan_type ?? "free"]);

  // Jobs (MVP stubs)
  await qIngest.add("instagram.import", { project_id, posts_limit: body?.import?.posts_limit ?? 40 });
  await qIngest.add("website.crawl", { project_id });
  await qLLM.add("products.detect", { project_id });

  return NextResponse.json({ project_id, next_step: "confirm_products" }, { status: 202 });
}
