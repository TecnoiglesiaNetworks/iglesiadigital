import { NextResponse } from "next/server";
import { getWebinarById, listRegistrations, type RegLead } from "@/lib/webinars-db";
import { configForWebinar } from "@/lib/webinar-config";
import { sendRescheduleBatch } from "@/lib/webinar-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Registrados que deben recibir el aviso: no dados de baja, no clientes/pagados,
// ni marcados como perdidos.
function eligible(r: RegLead): boolean {
  return !r.unsubscribed && !r.paid && !["cliente", "perdido"].includes(r.reg_status);
}

// GET → cuántos registrados pueden recibir el aviso de cambio de fecha.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!getWebinarById(id)) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
  return NextResponse.json({ ok: true, eligible: listRegistrations(id).filter(eligible).length });
}

// POST → envía el aviso de cambio de fecha a todos los registrados elegibles.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const webinar = getWebinarById(id);
  if (!webinar) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });

  const cfg = configForWebinar(webinar);
  const leads = listRegistrations(id).filter(eligible);

  try {
    const res = await sendRescheduleBatch(cfg, leads);
    return NextResponse.json({ ok: true, ...res });
  } catch (e: any) {
    console.error("[reschedule] error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 200 });
  }
}
