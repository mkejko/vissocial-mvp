import { q } from "@/lib/db";
import { falGenerateImage } from "@/lib/fal";
import { addWatermarkToImage } from "@/lib/watermark";
import { v4 as uuid } from "uuid";

export async function renderFlux(data: { content_item_id: string; prompt: string; image_urls?: string[]; job_id?: string }) {
  const { content_item_id, prompt, image_urls } = data;
  const renderId = "rnd_" + uuid();

  await q(`INSERT INTO renders(id, content_item_id, kind, status) VALUES ($1,$2,'image','running')`, [renderId, content_item_id]);

  try {
    const out = await falGenerateImage({ prompt, image_urls });
    // MVP: we store the generated URL directly.
    // Free watermarking would require downloading the image and re-uploading; here we only mark intent.
    await q(`UPDATE renders SET status='succeeded', outputs=$1, updated_at=now() WHERE id=$2`,
      [JSON.stringify({ url: out.url }), renderId]);

    const assetId = "asset_" + uuid();
    await q(`INSERT INTO assets(id, project_id, type, source, url, label)
             SELECT $1, cp.project_id, 'image', 'generated', $2, 'render'
             FROM content_items ci JOIN content_packs cp ON ci.content_pack_id=cp.id
             WHERE ci.id=$3`,
      [assetId, out.url, content_item_id]);

    return { url: out.url };
  } catch (e: any) {
    await q(`UPDATE renders SET status='failed', outputs=$1, updated_at=now() WHERE id=$2`,
      [JSON.stringify({ error: e.message }), renderId]);
    throw e;
  }
}
