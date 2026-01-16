"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDesc, CardTitle } from "@/ui/Card";
import { Badge } from "@/ui/Badge";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const project_id = localStorage.getItem("project_id");
    if (!project_id) return;
    (async () => {
      const res = await fetch(`/api/products/detected?project_id=${project_id}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setLoading(false);
    })();
  }, []);

  const selectedIds = useMemo(() => Object.entries(selected).filter(([,v])=>v).map(([id])=>id), [selected]);

  async function confirm() {
    const project_id = localStorage.getItem("project_id");
    await fetch("/api/products/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id, confirm_ids: selectedIds, remove_ids: [] })
    });
    router.push("/onboarding/generate");
  }

  return (
    <main className="space-y-4">
      <Card>
        <CardTitle>Potvrdi proizvode</CardTitle>
        <CardDesc>Odaberi proizvode koje želiš najviše istaknuti u planu.</CardDesc>

        {loading ? (
          <div className="mt-6 text-sm text-zinc-600">Učitavam…</div>
        ) : (
          <div className="mt-5 grid gap-3">
            {products.length === 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                Nismo našli proizvode (ili je content-based profil). Možeš nastaviti bez proizvoda.
              </div>
            )}
            {products.map((p) => (
              <label key={p.id} className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={!!selected[p.id]}
                    onChange={(e)=>setSelected(s=>({ ...s, [p.id]: e.target.checked }))}
                  />
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="mt-1 text-xs text-zinc-600">
                      Confidence: {p.confidence ?? "—"}
                    </div>
                  </div>
                </div>
                <Badge tone="info">Detected</Badge>
              </label>
            ))}

            <div className="mt-2 flex gap-2">
              <button
                onClick={confirm}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirm & Continue
              </button>
              <button
                onClick={() => router.push("/onboarding/generate")}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
