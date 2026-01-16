export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-base font-semibold">{children}</div>;
}

export function CardDesc({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 text-sm text-zinc-600">{children}</div>;
}
