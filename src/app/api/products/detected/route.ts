import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const project_id = url.searchParams.get("project_id");
  if (!project_id) return NextResponse.json({ error: "project_id required" }, { status: 400 });

  const project = (await q<any>(`SELECT id, state FROM projects WHERE id=$1`, [project_id]))[0] ?? null;
  const products = await q<any>(`SELECT * FROM products WHERE project_id=$1 ORDER BY confidence DESC NULLS LAST`, [project_id]);

  return NextResponse.json({ project, products });
}
