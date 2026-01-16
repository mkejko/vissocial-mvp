"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Card, CardDesc, CardTitle } from "@/ui/Card";
import { Badge } from "@/ui/Badge";

export default function Generate() {
  const router = useRouter();
  const [month, setMonth] = useState("");
  const [planType, setPlanType] = useState<"free"|"pro">("free");

  useEffect(() => {
    const now = dayjs();
    const defaultMonth = now.date() >= 20 ? now.add(1, "month").format("YYYY-MM") : now.format("YYYY-MM");
    setMonth(localStorage.getItem("plan_month") || defaultMonth);
    setPlanType((localStorage.getItem("plan_type") as any) || "free");
  }, []);

  async function run() {
    const project_id = localStorage.getItem("project_id");
    if (!project_id) return;
    const res = await fetch("/api/easy/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id, month, goals: ["growth"], frequency: "5_per_week" })
    });
    const data = await res.json();
    localStorage.setItem("last_generate_job", data.job_id);
    router.push("/calendar");
  }

  return (
    <main className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Generiraj mjesečni plan</CardTitle>
            <CardDesc>Plan je baziran na kalendarskom mjesecu.</CardDesc>
          </div>
          <Badge tone={planType==="pro" ? "good":"neutral"}>{planType.toUpperCase()}</Badge>
        </div>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Mjesec (YYYY-MM)</span>
            <input
              value={month}
              onChange={(e)=>setMonth(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            />
          </label>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <div className="font-semibold">Free vs Pro</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              <li><b>Free</b>: watermark na vizualima + footer u captionu; regeneracija po postovima.</li>
              <li><b>Pro</b>: bez watermarka; auto-post/scheduling; regeneracija cijelog mjeseca.</li>
            </ul>
          </div>

          <button onClick={run} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Generate plan
          </button>
        </div>
      </Card>
    </main>
  );
}
