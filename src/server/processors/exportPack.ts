import { q } from "@/lib/db";
import JSZip from "jszip";
import { stringify } from "csv-stringify/sync";
import { v4 as uuid } from "uuid";

const README = `# Import
\nOvaj ZIP sadrži:
- schedule_export.csv (plan)
- posts/<item_id>/caption.txt
- posts/<item_id>/media_1.jpg (ako je render uspio)
\nZa Buffer/Hootsuite import: koristi CSV + media folder (ručno attach ili kroz njihov upload flow).
\n`;

function extractUrl(latest_render: any): string | null {
  try {
    if (!latest_render) return null;
    const obj = typeof latest_render === "string" ? JSON.parse(latest_render) : latest_render;
    return obj?.url ?? null;
  } catch {
    return null;
  }
}

export async function exportPack(data: { content_pack_id: string; approved_only: boolean; job_id?: string }) {
  const { content_pack_id, approved_only, job_id } = data;

  const items = await q<any>(`
    SELECT ci.id, ci.day, ci.format, ci.topic, ci.caption, ci.status,
           r.outputs AS latest_render
    FROM content_items ci
    LEFT JOIN LATERAL (
      SELECT outputs
      FROM renders
      WHERE content_item_id = ci.id AND status='succeeded'
      ORDER BY updated_at DESC
      LIMIT 1
    ) r ON true
    WHERE ci.content_pack_id=$1 ${approved_only ? "AND ci.status='approved'" : ""}
    ORDER BY ci.day
  `, [content_pack_id]);

  const rows = items.map((it: any) => ({
    day: it.day,
    format: it.format,
    topic: it.topic,
    caption: it.caption?.long ?? it.caption?.short ?? "",
    media_path: `posts/${it.id}/media_1.jpg`
  }));

  const csv = stringify(rows, { header: true });

  const zip = new JSZip();
  zip.file("schedule_export.csv", csv);
  zip.file("README_IMPORT.md", README);

  // Add per-item folders with caption + media if available
  for (const it of items) {
    const folder = zip.folder(`posts/${it.id}`)!;
    const cap = it.caption?.long ?? it.caption?.short ?? "";
    folder.file("caption.txt", cap);

    const url = extractUrl(it.latest_render);
    if (!url) continue;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      folder.file("media_1.jpg", buf);
    } catch {
      // ignore download errors for MVP
    }
  }

  const zipBuf = await zip.generateAsync({ type: "nodebuffer" });
  const exportId = "exp_" + uuid();
  const fakeUrl = `data:application/zip;base64,${zipBuf.toString("base64")}`;

  // Optionally write back job result for convenience (worker also does)
  if (job_id) {
    await q(`UPDATE jobs SET result=$1, updated_at=now() WHERE id=$2`, [JSON.stringify({ export_id: exportId }), job_id]);
  }

  return { export_id: exportId, bundle_url: fakeUrl };
}
