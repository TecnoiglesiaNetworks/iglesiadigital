import { NextResponse } from "next/server";
import { eventTypeFilter, verifyWebhookSignature } from "@/lib/calendly";
import { markScheduledByEmail } from "@/lib/db";

export const runtime = "nodejs";

// Recibe invitee.created / invitee.canceled desde Calendly y actualiza el lead.
// Es una ruta PÚBLICA (Calendly la llama), protegida por firma HMAC.
export async function POST(req: Request) {
  const raw = await req.text();
  const ok = await verifyWebhookSignature(raw, req.headers.get("calendly-webhook-signature"));
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
  }

  let payload: {
    event?: string;
    payload?: {
      email?: string;
      scheduled_event?: { uri?: string; start_time?: string; event_type?: string };
    };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const email = payload.payload?.email?.toLowerCase();
  const ev = payload.payload?.scheduled_event;
  if (!email) return NextResponse.json({ ok: true, note: "sin email" });

  // Solo procesamos la programación configurada (ej. "Asesoría Iglesia Digital").
  const typeFilter = eventTypeFilter();
  if (typeFilter && ev?.event_type && ev.event_type !== typeFilter) {
    return NextResponse.json({ ok: true, note: "otro tipo de evento, ignorado" });
  }

  const canceled = payload.event === "invitee.canceled";
  markScheduledByEmail(email, ev?.start_time ?? null, ev?.uri ?? null, canceled);

  return NextResponse.json({ ok: true });
}
