"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardDesc, CardTitle } from "@/ui/Card";
import { Badge } from "@/ui/Badge";

function thumbFromRender(latest_render: any): string | null {
  try {
    if (!latest_render) return null;
    const obj = typeof latest_render === "string" ? JSON.parse(latest_render) : latest_render;
    return obj?.url ?? obj?.images?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

export default function CalendarPage() {
  const [pack, setPack] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [planType, setPlanType] = useState<"free"|"pro">("free");
  const [job, setJob] = useState<any>(null);

  const project_id = typeof window !== "undefined" ? localStorage.getItem("project_id") : null;

  async function refresh() {
    if (!project_id) return;
    const res = await fetch(`/api/projects?project_id=${project_id}&include=calendar`);
    const data = await res.json();
    setPack(data.content_pack ?? null);
    setItems(data.items ?? []);
  }

  async function pollJob() {
    const jid = typeof window !== "undefined" ? localStorage.getItem("last_generate_job") : null;
    if (!jid) return;
    const res = await fetch(`/api/jobs/${jid}`);
    const data = await res.json();
    if (!data?.error) setJob(data);
  }

  useEffect(() => {
    setPlanType((localStorage.getItem("plan_type") as any) || "free");
    refresh();
    pollJob();
    const t = setInterval(() => { refresh(); pollJob(); }, 2500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function regenMonth() {
    if (!project_id) return;
    const ok = window.confirm("Ovo će regenerirati cijeli mjesec i zamijeniti sve objave. Nastaviti?");
    if (!ok) return;

    const res = await fetch("/api/easy/regenerate-month", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id })
    });

    if (res.status === 403) return alert("Ova opcija je dostupna samo u Pro verziji.");
    const data = await res.json();
    if (data?.job_id) {
      localStorage.setItem("last_generate_job", data.job_id);
      await pollJob();
    }
  }

  const regenDisabled = planType !== "pro";

  return (
    <main className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Kalendar</CardTitle>
            <CardDesc>{pack ? `Plan: ${pack.month}` : "Nema plana još."}</CardDesc>
            {job && (
              <div className="mt-2 text-xs text-zinc-600">
                Zadnji job: <b>{job.type}</b> — <b>{job.status}</b>
                {job.progress !== null && job.progress !== undefined ? ` (${Math.round((job.progress ?? 0) * 100)}%)` : ""}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={planType === "pro" ? "good" : "neutral"}>{planType.toUpperCase()}</Badge>
            <button
              disabled={regenDisabled}
              title={regenDisabled ? "Dostupno u Pro verziji" : "Regeneriraj cijeli mjesec"}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
              onClick={regenMonth}
            >
              🔁 Regeneriraj mjesec
            </button>
            <Link className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white" href="/export">
              Export
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {items.map((it) => {
            const thumb = thumbFromRender(it.latest_render);
            return (
              <Link key={it.id} href={`/item/${it.id}`} className="rounded-2xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Day {it.day}: {it.topic}</div>
                    <div className="mt-1 text-xs text-zinc-600">Format: {it.format}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={it.status === "approved" ? "good" : "neutral"}>{it.status}</Badge>
                      <Badge tone={it.publish_status === "scheduled" ? "info" : it.publish_status === "published" ? "good" : "neutral"}>
                        {it.publish_status ?? "draft"}
                      </Badge>
                      {it.scheduled_at ? <Badge tone="warn">scheduled</Badge> : null}
                    </div>
                  </div>

                  <div className="h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                        rendering…
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
          {items.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
              Nema generiranih objava. Idi na onboarding → generate.
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          Nakon generacije plana automatski enqueuamo preview render za sve objave (Flux).
        </div>
      </Card>
    </main>
  );
}
