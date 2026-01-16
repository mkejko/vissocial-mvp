import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Vissocial MVP</h1>
      <p className="text-zinc-600">
        Instagram-first generator: onboarding → monthly plan → renders → calendar → export/schedule.
      </p>
      <div className="flex gap-3">
        <Link className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white" href="/onboarding/connect">
          Start onboarding
        </Link>
        <Link className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900" href="/calendar">
          Open calendar
        </Link>
      </div>
    </main>
  );
}
