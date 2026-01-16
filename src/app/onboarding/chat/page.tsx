"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatOnboarding } from "@/ui/ChatOnboarding";

export default function ChatPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const forceTypeSelect = sp.get("force_type_select") === "1";

  const [suggested, setSuggested] = useState<{ type: any; confidence: number } | null>(null);

  useEffect(() => {
    const project_id = localStorage.getItem("project_id");
    if (!project_id) return;
    (async () => {
      const res = await fetch(`/api/projects?project_id=${project_id}`);
      const data = await res.json();
      setSuggested(data?.suggested_type ?? null);
    })();
  }, []);

  async function onComplete(payload: any) {
    const project_id = localStorage.getItem("project_id");
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id, onboarding: payload })
    });

    // Route based on type
    if (payload.accountType === "product_brand") router.push("/onboarding/products");
    else router.push("/onboarding/generate");
  }

  return (
    <main className="space-y-4">
      <ChatOnboarding initialSuggestedType={suggested} forceTypeSelect={forceTypeSelect} onComplete={onComplete} />
    </main>
  );
}
