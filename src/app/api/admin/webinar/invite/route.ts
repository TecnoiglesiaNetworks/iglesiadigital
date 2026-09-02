import { NextResponse } from "next/server";
import { countInviteEligible } from "@/lib/db";
import { sendInviteBatch } from "@/lib/webinar-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → cuántos leads del diagnóstico se pueden invitar (aún no invitados / no
// registrados / no dados de baja).
export async function GET() {
  return NextResponse.json({ ok: true, eligible: countInviteEligible() });
}

// POST → envía la invitación a un lote y los marca como invitados.
// Se puede llamar varias veces hasta que "remaining" llegue a 0.
export async function POST(req: Request) {
  let body: { batchSize?: number } = {};
  try {
    body = await req.json();
  } catch {
    // sin cuerpo → lote por defecto
  }
  const batch = Math.min(Math.max(body.batchSize ?? 60, 1), 200);
  try {
    const res = await sendInviteBatch(batch);
    return NextResponse.json({ ok: true, ...res });
  } catch (e: any) {
    console.error("[invite] error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 200 });
  }
}
