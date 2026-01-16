"use client";
import { useEffect, useState } from "react";
import { Card, CardDesc, CardTitle } from "@/ui/Card";

export default function ExportPage() {
  const [approvedOnly, setApprovedOnly] = useState(true);
  const [contentPackId, setContentPackId] = useState<string | null>(null);

  useEffect(() => {
    const project_id = localStorage.getItem("project_id");
    if (!project_id) return;
    (async () => {
      const res = await fetch(`/api/projects?project_id=${project_id}&include=calendar`);
      const data = await res.json();
      setContentPackId(data.content_pack?.id ?? null);
    })();
  }, []);

  async function run() {
    if (!contentPackId) return alert("No pack.");
    const res = await fetch("/api/easy/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_pack_id: contentPackId, approved_only: approvedOnly })
    });
    const data = await res.json();
    alert(`Export enqueued. job_id=${data.job_id}`);
  }

  return (
    <main className="space-y-4">
      <Card>
        <CardTitle>Export</CardTitle>
        <CardDesc>CSV + ZIP za Buffer/Hootsuite i druge alate.</CardDesc>

        <div className="mt-5 grid gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={approvedOnly} onChange={(e)=>setApprovedOnly(e.target.checked)} />
            Approved only
          </label>

          <button onClick={run} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Export
          </button>

          <div className="text-xs text-zinc-500">
            MVP: export ZIP se vraća kao data URL (kasnije upload u S3/MinIO i pravi download link).
          </div>
        </div>
      </Card>
    </main>
  );
}
