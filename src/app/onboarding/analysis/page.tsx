"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDesc, CardTitle } from "@/ui/Card";

export default function Analysis() {
  const [loading, setLoading] = useState(true);
  const [usp, setUsp] = useState<string>("");
  const [rec, setRec] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const project_id = localStorage.getItem("project_id");
    if (!project_id) return;
    (async () => {
      // For MVP, products/detected also implies jobs ran; analysis copy is stored in brand_profiles but stubbed in import.
      const res = await fetch(`/api/projects?project_id=${project_id}`);
      const data = await res.json();
      setUsp(data?.brand_profile?.usp ?? "Profil gradi vizualno konzistentan identitet…");
      setRec(data?.brand_profile?.recommendation ?? "Preporuka: fokus na engagement kroz mix formata…");
      setLoading(false);
    })();
  }, []);

  return (
    <main className="space-y-4">
      <Card>
        <CardTitle>Analiza profila</CardTitle>
        <CardDesc>Brzi sažetak stila i preporuka za sljedeći mjesec.</CardDesc>

        {loading ? (
          <div className="mt-6 animate-pulse text-sm text-zinc-600">Analiziram profil…</div>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <div className="text-xs font-semibold text-zinc-500">USP ANALIZA</div>
              <p className="mt-2 text-sm leading-6 text-zinc-800">{usp}</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-500">PREPORUKA</div>
              <p className="mt-2 text-sm leading-6 text-zinc-800">{rec}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/onboarding/chat")}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Zvuči dobro → Nastavimo
              </button>
              <button
                onClick={() => router.push("/onboarding/chat?force_type_select=1")}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
              >
                Ovo nije točno
              </button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
