import { q } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { ProjectStates } from "@/lib/state";

export async function detectProducts(data: { project_id: string }) {
  const { project_id } = data;

  // MVP: create a couple fake products so UX works
  const existing = await q<any>(`SELECT id FROM products WHERE project_id=$1`, [project_id]);
  if (existing.length === 0) {
    const p1 = "prod_" + uuid();
    const p2 = "prod_" + uuid();
    await q(`INSERT INTO products(id, project_id, name, confidence, evidence, confirmed, locked)
             VALUES ($1,$2,$3,$4,$5,false,false),
                    ($6,$2,$7,$8,$9,false,false)`,
      [p1, project_id, "Knjiga o džungli", 0.92, JSON.stringify(["Mentioned in captions"]),
       p2, "Novi Atlas", 0.73, JSON.stringify(["Appears in posts"])]);
  }

  await q(`UPDATE projects SET state=$1, updated_at=now() WHERE id=$2`,
    [ProjectStates.awaiting_product_confirmation, project_id]);

  return { ok: true };
}
