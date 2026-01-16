import { q } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { ProjectStates } from "@/lib/state";
import { addWatermarkToCaption } from "@/lib/watermark";
import { qRender } from "@/lib/jobs";

function buildPrompt(visualBrief: any) {
  const scene = visualBrief?.scene_description ?? "Clean studio background, soft light, premium composition.";
  const text = visualBrief?.on_screen_text ? `On-screen text: "${visualBrief.on_screen_text}".` : "";
  return `Photorealistic instagram-ready marketing image. ${scene} ${text}`.trim();
}

export async function generatePlan(data: { project_id: string; month: string; goals: string[]; frequency: string; job_id?: string }) {
  const { project_id, month, goals, frequency, job_id } = data;

  if (job_id) await q(`UPDATE jobs SET status='running', progress=0.05, updated_at=now() WHERE id=$1`, [job_id]);

  await q(`UPDATE projects SET state=$1, plan_month=$2, updated_at=now() WHERE id=$3`,
    [ProjectStates.generating_plan, month, project_id]);

  const project = (await q<any>(`SELECT plan_type FROM projects WHERE id=$1`, [project_id]))[0];

  const packId = "pack_" + uuid();
  await q(`INSERT INTO content_packs(id, project_id, month, goals, frequency)
           VALUES ($1,$2,$3,$4,$5)`, [packId, project_id, month, JSON.stringify(goals ?? []), frequency ?? "5_per_week"]);

  // MVP: 12 items
  const sample = Array.from({ length: 12 }).map((_, i) => ({
    day: 2 + i * 2,
    format: i % 3 === 0 ? "reel" : (i % 3 === 1 ? "carousel" : "feed"),
    topic: `Tema ${i + 1}`,
    caption: {
      short: `Kratki hook ${i + 1}`,
      long: `Dulji caption ${i + 1}. Ovo je primjer teksta koji može biti personaliziran i sadržavati CTA.`,
      cta: "Link u bio."
    },
    visual_brief: {
      product_locked: false,
      scene_description: "Clean studio background, soft light, premium composition.",
      on_screen_text: `Objava ${i + 1}`
    }
  }));

  if (job_id) await q(`UPDATE jobs SET progress=0.35, updated_at=now() WHERE id=$1`, [job_id]);

  const itemIds: string[] = [];
  for (const it of sample) {
    const itemId = "item_" + uuid();
    const longCaption = project?.plan_type === "free" ? addWatermarkToCaption(it.caption.long) : it.caption.long;

    await q(`INSERT INTO content_items(id, content_pack_id, day, format, topic, visual_brief, caption, status, publish_status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,'draft','draft')`,
      [itemId, packId, it.day, it.format, it.topic, JSON.stringify(it.visual_brief), JSON.stringify({ ...it.caption, long: longCaption })]);

    itemIds.push(itemId);
  }

  if (job_id) await q(`UPDATE jobs SET progress=0.65, updated_at=now() WHERE id=$1`, [job_id]);

  // Auto-enqueue renders for preview
  let idx = 0;
  for (const itemId of itemIds) {
    const itemRow = (await q<any>(`SELECT visual_brief FROM content_items WHERE id=$1`, [itemId]))[0];
	const ATLAS_PROMPT =
  "Vertical 4:5 Instagram ad, premium product photography. A realistic hardcover book titled 'ATLAS' (clean modern typography, cover clearly readable, minimal world-map graphic). Place the book in a beautiful travel location with cinematic light (vary: pyramids, London, Caribbean beach, Tokyo neon, Alps cabin, Santorini, NYC rooftop). Optional person holding/looking at the book. Sharp focus on the book, background softly blurred. No watermark, no extra text, no logos, no distorted letters.";
	const prompt = ATLAS_PROMPT;
    //const prompt = buildPrompt(itemRow?.visual_brief ?? {});
    const rjob = "job_" + uuid();

    await q(`INSERT INTO jobs(id, project_id, type, status, input)
             VALUES ($1,$2,'render.flux','queued',$3)`,
      [rjob, project_id, JSON.stringify({ content_item_id: itemId, prompt, source: "auto_preview" })]);

    await qRender.add("render.flux", { content_item_id: itemId, prompt, job_id: rjob });

    idx += 1;
    if (job_id && idx % 3 == 0) {
      const prog = 0.65 + Math.min(0.25, (idx / itemIds.length) * 0.25);
      await q(`UPDATE jobs SET progress=$1, updated_at=now() WHERE id=$2`, [prog, job_id]);
    }
  }

  await q(`UPDATE projects SET state=$1, updated_at=now() WHERE id=$2`,
    [ProjectStates.ready_to_review, project_id]);

  if (job_id) {
    await q(`UPDATE jobs SET status='succeeded', progress=1.0, result=$1, updated_at=now() WHERE id=$2`,
      [JSON.stringify({ content_pack_id: packId, items: itemIds.length, renders_queued: itemIds.length }), job_id]);
  }

  return { content_pack_id: packId };
}
