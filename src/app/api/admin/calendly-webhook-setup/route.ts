import { NextResponse } from "next/server";
import { createWebhookSubscription } from "@/lib/calendly";

export const runtime = "nodejs";

// POST /api/admin/calendly-webhook-setup → registra (una sola vez) la suscripción
// al webhook para que Calendly avise cuando alguien agenda o cancela.
// Necesita CALENDLY_TOKEN, CALENDLY_WEBHOOK_SIGNING_KEY y una URL pública.
export async function POST(req: Request) {
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!signingKey) {
    return NextResponse.json(
      { ok: false, error: "Falta CALENDLY_WEBHOOK_SIGNING_KEY" },
      { status: 400 }
    );
  }
  // La URL pública del sitio: por env o inferida del request.
  const base = process.env.PUBLIC_BASE_URL || new URL(req.url).origin;
  const callbackUrl = `${base}/api/calendly/webhook`;
  try {
    const sub = await createWebhookSubscription(callbackUrl, signingKey);
    return NextResponse.json({ ok: true, callbackUrl, subscription: sub });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
