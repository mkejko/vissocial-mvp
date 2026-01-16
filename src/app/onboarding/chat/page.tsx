// app/onboarding/chat/page.tsx
import { Suspense } from "react";
import ChatClient from "./ChatClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading chat…</div>}>
      <ChatClient />
    </Suspense>
  );
}
