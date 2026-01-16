"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardDesc, CardTitle } from "@/ui/Card";
import { Badge } from "@/ui/Badge";

function renderUrl(latest_render: any): string | null {
  try {
    if (!latest_render) return null;
    const obj = typeof latest_render === "string" ? JSON.parse(latest_render) : latest_render;
    return obj?.url ?? null;
  } catch {
    return null;
  }
}

export default function ItemPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(true);
  const [captionLong, setCaptionLong] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [publishMode, setPublishMode] = useState<"export_only"|"in_app_schedule"|"auto_publish">("export_only");

  async function load() {
    const res = await fetch(`/api/projects?item_id=${params.id}`);
    const data = await res.json();
    setItem(data.item);
    setCaptionLong(data.item?.caption?.long ?? "");
    setPublishMode(data.item?.publish_mode ?? "export_only");
    setScheduledAt(data.item?.scheduled_at ? new Date(data.item.scheduled_at).toISOString().slice(0,16) : "");
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [params.id]);

  async function regen() {
    await fetch("/api/easy/render-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_item_id: params.id, action: "regen_background", instruction })
    });
    alert("Render enqueued.");
  }

  async function save() {
    const res = await fetch("/api/item", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: params.id,
        caption_long: captionLong,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        publish_mode: publishMode
      })
    });
    if (!res.ok) return alert("Save failed");
    await load();
    alert("Saved.");
  }

  async function approveToggle() {
    const next = item?.status === "approved" ? "draft" : "approved";
    const res = await fetch("/api/item", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: params.id, status: next })
    });
    if (!res.ok) return alert("Update failed");
    await load();
  }

  async function setPublishStatus(next: "scheduled"|"draft") {
    const res = await fetch("/api/item", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: params.id, publish_status: next })
    });
    if (!res.ok) return alert("Update failed");
    await load();
  }

  if (loading) return <div className="text-sm text-zinc-600">Učitavam…</div>;
  if (!item) return <div className="text-sm text-zinc-600">Nije pronađeno.</div>;

  const thumb = renderUrl(item.latest_render);

  return (
    <main className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Day {item.day}: {item.topic}</CardTitle>
            <CardDesc>Uredi caption, status, schedule i regeneriraj vizual.</CardDesc>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={item.status === "approved" ? "good":"neutral"}>{item.status}</Badge>
              <Badge tone={item.publish_status === "scheduled" ? "info" : item.publish_status === "published" ? "good" : "neutral"}>
                {item.publish_status ?? "draft"}
              </Badge>
            </div>
          </div>

          <div className="h-24 w-24 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">rendering…</div>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={approveToggle}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              {item.status === "approved" ? "Unapprove" : "Approve"}
            </button>

            <button
              onClick={() => setPublishStatus(item.publish_status === "scheduled" ? "draft" : "scheduled")}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
              title="MVP: status flag. Real scheduling/publishing comes later."
            >
              {item.publish_status === "scheduled" ? "Unschedule" : "Mark scheduled"}
            </button>
          </div>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Caption (long)</span>
            <textarea
              value={captionLong}
              onChange={(e)=>setCaptionLong(e.target.value)}
              className="min-h-[140px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-zinc-700">Publish mode</span>
              <select
                value={publishMode}
                onChange={(e)=>setPublishMode(e.target.value as any)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              >
                <option value="export_only">Export only</option>
                <option value="in_app_schedule">Schedule in app</option>
                <option value="auto_publish">Auto post</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-zinc-700">Scheduled at (optional)</span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e)=>setScheduledAt(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>

          <button onClick={save} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900">
            Save changes
          </button>

          <div className="h-px bg-zinc-200" />

          <label className="grid gap-1">
            <span className="text-xs font-medium text-zinc-700">Regenerate instruction (background)</span>
            <input
              value={instruction}
              onChange={(e)=>setInstruction(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              placeholder="Cleaner studio background, softer light…"
            />
          </label>

          <button onClick={regen} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Regenerate background
          </button>
        </div>
      </Card>
    </main>
  );
}
