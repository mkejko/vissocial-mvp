"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDesc, CardTitle } from "@/ui/Card";

export default function Connect() {
  const [handle, setHandle] = useState("");
  const [brand, setBrand] = useState("");
  const [planType, setPlanType] = useState<"free"|"pro">("free");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function start() {
    setLoading(true);
    const res = await fetch("/api/easy/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_name: brand || handle,
        ig_handle: handle.replace("@",""),
        plan_type: planType,
        import: { posts_limit: 40 },
        website: { mode: "auto" }
      })
    });
    const data = await res.json();
    localStorage.setItem("project_id", data.project_id);
    localStorage.setItem("plan_type", planType);
    router.push("/onboarding/analysis");
  }

  return (
    <main className="space-y-4">
      <Card>
        <CardTitle>Poveži Instagram</CardTitle>
        <CardDesc>
          Analizirat ćemo tvoj profil kako bismo razumjeli stil i sadržaj. Ništa se neće objaviti bez tvog odobrenja.
        </CardDesc>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Brand name</span>
            <input className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Skolska Knjiga"
              value={brand}
              onChange={(e)=>setBrand(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Instagram handle</span>
            <input className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="@skolskaknjiga"
              value={handle}
              onChange={(e)=>setHandle(e.target.value)}
            />
          </label>

          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-700">Plan</span>
            <button onClick={()=>setPlanType("free")}
              className={`rounded-full px-3 py-1 text-xs font-medium ${planType==="free" ? "bg-zinc-900 text-white":"bg-zinc-100 text-zinc-700"}`}>
              Free
            </button>
            <button onClick={()=>setPlanType("pro")}
              className={`rounded-full px-3 py-1 text-xs font-medium ${planType==="pro" ? "bg-zinc-900 text-white":"bg-zinc-100 text-zinc-700"}`}>
              Pro
            </button>
          </div>

          <button disabled={loading || !handle.trim()}
            onClick={start}
            className="mt-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Connecting…" : "Connect & Analyze"}
          </button>

          <div className="text-xs text-zinc-500">
            Ovo je MVP: Instagram OAuth je stub. U produkciji ovdje ide Meta login.
          </div>
        </div>
      </Card>
    </main>
  );
}
