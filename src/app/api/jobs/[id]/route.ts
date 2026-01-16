import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const rows = await q<any>(`SELECT * FROM jobs WHERE id=$1`, [params.id]);
  if (!rows.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
