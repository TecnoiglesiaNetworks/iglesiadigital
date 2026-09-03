import { NextResponse } from "next/server";
import {
  getWebinarById,
  countInviteEligible,
  nextInviteBatch,
  markInvitedToWebinar,
} from "@/lib/webinars-db";
import { configForWebinar } from "@/lib/webinar-config";
import { sendInviteBatch } from "@/lib/webinar-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → cuántos leads se pueden invitar a ESTE webinar (no registrados / no
// invitados / no dados de baja).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!getWebinarById(id)) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
  return NextResponse.json({ ok: true, eligible: countInviteEligible(id) });
}

// POST → envía la invitación de ESTE webinar a un lote y los marca invitados.
// Se puede llamar varias veces hasta que "remaining" llegue a 0.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const webinar = getWebinarById(id);
  if (!webinar) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });

  let body: { batchSize?: number } = {};
  try {
    body = await req.json();
  } catch {
    // sin cuerpo → lote por defecto
  }
  const batch = Math.min(Math.max(body.batchSize ?? 60, 1), 200);
  const cfg = configForWebinar(webinar);

  try {
    const leads = nextInviteBatch(id, batch);
    const res = await sendInviteBatch(cfg, leads, (leadId) => markInvitedToWebinar(id, leadId));
    return NextResponse.json({ ok: true, ...res, remaining: countInviteEligible(id) });
  } catch (e: any) {
    console.error("[invite] error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 200 });
  }
}
