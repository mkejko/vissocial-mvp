"use client";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Card } from "@/ui/Card";
import { Badge } from "@/ui/Badge";

type AccountType = "product_brand" | "personal_lifestyle" | "character" | "content_media";

function StepBubble({ role, children }: { role: "assistant" | "user"; children: React.ReactNode }) {
  const base = role === "assistant"
    ? "bg-zinc-100 text-zinc-900"
    : "bg-zinc-900 text-white ml-auto";
  return <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${base}`}>{children}</div>;
}

export function ChatOnboarding({
  initialSuggestedType,
  forceTypeSelect,
  onComplete
}: {
  initialSuggestedType: { type: AccountType; confidence: number } | null;
  forceTypeSelect?: boolean;
  onComplete: (payload: any) => void;
}) {
  const now = dayjs();
  const defaultMonth = now.date() >= 20 ? now.add(1, "month").format("YYYY-MM") : now.format("YYYY-MM");

  const [goal, setGoal] = useState<string | null>(null);
  const [hasPlanned, setHasPlanned] = useState<boolean | null>(null);
  const [month, setMonth] = useState(defaultMonth);
  const [accountType, setAccountType] = useState<AccountType | null>(forceTypeSelect ? null : (initialSuggestedType?.type ?? null));
  const [typeConfirmed, setTypeConfirmed] = useState(false);
  const [branchChoice, setBranchChoice] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  const suggested = initialSuggestedType;

  const canProceed = useMemo(() => {
    return !!goal && hasPlanned !== null && !!month && !!accountType && typeConfirmed && !!branchChoice && !!focus;
  }, [goal, hasPlanned, month, accountType, typeConfirmed, branchChoice, focus]);

  function complete() {
    onComplete({ goal, hasPlanned, month, accountType, branchChoice, focus });
  }

  const typeLabel: Record<AccountType, string> = {
    product_brand: "Product brand",
    personal_lifestyle: "Osobni / lifestyle profil",
    character: "Character-based profil",
    content_media: "Content / media stranica"
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">Onboarding (chat)</div>
        <Badge tone="info">Month-based</Badge>
      </div>

      <div className="mt-5 space-y-3">
        <StepBubble role="assistant">
          Bok! 😊 Sad ću ti postaviti nekoliko kratkih pitanja kako bismo složili mjesečni plan sadržaja.
        </StepBubble>

        <StepBubble role="assistant">
          Što želiš postići s profilom u idućem mjesecu?
        </StepBubble>

        <div className="flex flex-wrap gap-2">
          {[
            "Više engagementa",
            "Izgradnju brenda",
            "Promociju proizvoda/usluga",
            "Kombinaciju svega"
          ].map((x) => (
            <button
              key={x}
              onClick={() => setGoal(x)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                goal === x ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
              }`}
            >
              {x}
            </button>
          ))}
        </div>

        {goal && <StepBubble role="user">{goal}</StepBubble>}

        {goal && (
          <>
            <StepBubble role="assistant">
              Imaš li već neke objave ili ideje koje planiraš objaviti idući mjesec?
            </StepBubble>
            <div className="flex gap-2">
              <button
                onClick={() => setHasPlanned(true)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  hasPlanned === true ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                }`}
              >
                Da
              </button>
              <button
                onClick={() => setHasPlanned(false)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  hasPlanned === false ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                }`}
              >
                Ne, krenimo od nule
              </button>
            </div>

            {hasPlanned !== null && <StepBubble role="user">{hasPlanned ? "Da" : "Ne"}</StepBubble>}
          </>
        )}

        {hasPlanned === true && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Dodaj planirane objave (opcionalno)</div>
            <div className="mt-1 text-xs text-zinc-600">
              Uploadaj fotke/videe i (opcionalno) captione. Ne objavljujemo ih — koristimo ih kao signal preferencija.
            </div>
            <div className="mt-3 grid gap-2">
              <input type="file" multiple className="text-xs" />
              <textarea
                placeholder="Caption (opcionalno)"
                className="min-h-[80px] rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
              <div className="text-xs text-zinc-500">MVP: upload nije spojen na backend (dodaje se kasnije).</div>
            </div>
          </div>
        )}

        {hasPlanned !== null && (
          <>
            <StepBubble role="assistant">Za koji mjesec pripremamo sadržaj?</StepBubble>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              >
                <option value={now.format("YYYY-MM")}>Ovaj mjesec ({now.format("YYYY-MM")})</option>
                <option value={now.add(1, "month").format("YYYY-MM")}>
                  Sljedeći mjesec ({now.add(1, "month").format("YYYY-MM")})
                </option>
              </select>
              {now.date() >= 20 && <Badge tone="warn">Preporučeno: sljedeći mjesec</Badge>}
            </div>
            <StepBubble role="user">{month}</StepBubble>
          </>
        )}

        {month && (
          <>
            <StepBubble role="assistant">
              Na temelju profila i odgovora, čini se da je ovo:{" "}
              <b>{accountType ? typeLabel[accountType] : "—"}</b>{" "}
              {suggested && !forceTypeSelect ? (
                <span className="text-xs text-zinc-600">({Math.round(suggested.confidence * 100)}% sigurno)</span>
              ) : null}
              <div className="mt-2 text-xs text-zinc-600">
                Molim potvrdi ili promijeni tip profila (ovo utječe na onboarding).
              </div>
            </StepBubble>

            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(typeLabel) as AccountType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setAccountType(t); setTypeConfirmed(false); }}
                  className={`rounded-2xl border px-4 py-3 text-left ${
                    accountType === t ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <div className="text-sm font-semibold">{typeLabel[t]}</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    {t === "product_brand" && "Proizvodi, logo, realistični prikaz."}
                    {t === "personal_lifestyle" && "Osobni stil, storytelling, engagement."}
                    {t === "character" && "Lik/mascota, konzistentan identitet."}
                    {t === "content_media" && "Edukacija, news, teme i stil."}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                disabled={!accountType}
                onClick={() => setTypeConfirmed(true)}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Točno
              </button>
              <button
                onClick={() => { setAccountType(null); setTypeConfirmed(false); }}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
              >
                Promijeni
              </button>
            </div>

            {typeConfirmed && accountType && <StepBubble role="user">Tip profila potvrđen: {typeLabel[accountType]}</StepBubble>}
          </>
        )}

        {typeConfirmed && accountType && (
          <>
            <StepBubble role="assistant">
              Još jedno pitanje: kako želiš da sadržaj izgleda?
            </StepBubble>

            <div className="flex flex-wrap gap-2">
              {(accountType === "product_brand" ? [
                "Promocija hero proizvoda",
                "Edukacija o proizvodu",
                "Testimonial/UGC stil",
                "Mix"
              ] : accountType === "personal_lifestyle" ? [
                "Više osobnih priča",
                "Outfit/lifestyle inspiracija",
                "Interakcija (ankete/pitanja)",
                "Mix"
              ] : accountType === "character" ? [
                "Isti izgled (konzistentno)",
                "Više varijacija scenarija",
                "Edukacija kroz lika",
                "Mix"
              ] : [
                "Trendovi + ideje",
                "Strogo u stilu profila",
                "Više edukacije",
                "Mix"
              ]).map((x)=>(
                <button
                  key={x}
                  onClick={()=>setBranchChoice(x)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    branchChoice === x ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                  }`}
                >
                  {x}
                </button>
              ))}
            </div>

            {branchChoice && <StepBubble role="user">{branchChoice}</StepBubble>}
          </>
        )}

        {branchChoice && (
          <>
            <StepBubble role="assistant">Na što se najviše fokusiramo u tom mjesecu?</StepBubble>
            <div className="flex flex-wrap gap-2">
              {["Engagement", "Rast profila", "Promocija", "Autoritet / storytelling"].map((x)=>(
                <button
                  key={x}
                  onClick={()=>setFocus(x)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    focus === x ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                  }`}
                >
                  {x}
                </button>
              ))}
            </div>
            {focus && <StepBubble role="user">{focus}</StepBubble>}
          </>
        )}

        <div className="pt-2">
          <button
            disabled={!canProceed}
            onClick={complete}
            className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Nastavi → Potvrda proizvoda / Generacija
          </button>
          <div className="mt-2 text-xs text-zinc-500">
            Sljedeći korak ovisi o tipu profila (product → proizvodi; ostalo → odmah generacija).
          </div>
        </div>
      </div>
    </Card>
  );
}
