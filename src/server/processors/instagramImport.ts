import { q } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { ProjectStates } from "@/lib/state";

export async function instagramImport(data: { project_id: string; posts_limit: number }) {
  const { project_id } = data;

  await q(`UPDATE projects SET state=$1, updated_at=now() WHERE id=$2`, [ProjectStates.importing_media, project_id]);

  // MVP placeholder analysis (replace with real ingest + LLM digest)
  const fakeProfile = {
    usp: "Profil gradi osobni identitet kroz konzistentnu estetiku i autentičan stil. Potencijal za jači storytelling i engagement je velik.",
    recommendation: "U idućem mjesecu fokus na 3–4 objave tjedno + Stories (ankete, pitanja, behind-the-scenes).",
    account_type_suggestion: { type: "personal_lifestyle", confidence: 0.78 }
  };

  await q(`INSERT INTO brand_profiles(project_id, language, profile)
           VALUES ($1,'hr',$2)
           ON CONFLICT (project_id) DO UPDATE SET profile=$2`, [project_id, JSON.stringify(fakeProfile)]);

  // Store one placeholder asset
  const a1 = "asset_" + uuid();
  await q(`INSERT INTO assets(id, project_id, type, source, url, label)
           VALUES ($1,$2,'image','instagram',$3,'ig_sample')`,
    [a1, project_id, "https://picsum.photos/seed/vissocial1/1200/1200"]);

  await q(`UPDATE projects SET state=$1, ig_connected=true, updated_at=now() WHERE id=$2`,
    [ProjectStates.detecting_products, project_id]);

  return { ok: true };
}
