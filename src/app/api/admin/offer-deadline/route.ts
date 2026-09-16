import { NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";
import { getOfferDeadline, DEFAULT_OFFER_DEADLINE, OFFER_DEADLINE_KEY } from "@/lib/offer";
import { toLocalInput, localInputToIso } from "@/lib/webinar-time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → fecha límite actual (ISO y en formato datetime-local CDMX para el input).
export async function GET() {
  const iso = getOfferDeadline();
  return NextResponse.json({
    ok: true,
    deadline: iso,
    deadlineLocal: toLocalInput(iso),
    isDefault: !getSetting(OFFER_DEADLINE_KEY),
    defaultLocal: toLocalInput(DEFAULT_OFFER_DEADLINE),
  });
}

// POST { deadlineLocal } → guarda la fecha (hora CDMX). { reset:true } → vuelve al
// valor por defecto.
export async function POST(req: Request) {
  let body: { deadlineLocal?: string; reset?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  if (body.reset) {
    setSetting(OFFER_DEADLINE_KEY, "");
  } else {
    const local = (body.deadlineLocal || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) {
      return NextResponse.json({ ok: false, error: "Fecha inválida" }, { status: 422 });
    }
    setSetting(OFFER_DEADLINE_KEY, localInputToIso(local));
  }

  const iso = getOfferDeadline();
  return NextResponse.json({ ok: true, deadline: iso, deadlineLocal: toLocalInput(iso), isDefault: !getSetting(OFFER_DEADLINE_KEY) });
}
