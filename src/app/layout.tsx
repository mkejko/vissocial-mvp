import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vissocial MVP",
  description: "Instagram-first social content generator MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-zinc-900" />
              <div>
                <div className="text-sm font-semibold">Vissocial</div>
                <div className="text-xs text-zinc-500">MVP</div>
              </div>
            </div>
            <a className="text-sm text-zinc-600 hover:text-zinc-900" href="/onboarding/connect">
              Onboarding
            </a>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
