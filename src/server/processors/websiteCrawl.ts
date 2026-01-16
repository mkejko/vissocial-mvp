import { q } from "@/lib/db";

export async function websiteCrawl(data: { project_id: string }) {
  await q(`UPDATE projects SET website_url=$1, updated_at=now() WHERE id=$2`, ["https://example.com", data.project_id]);
  return { ok: true };
}
