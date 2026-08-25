import { NextResponse } from "next/server";
import { getLead, setSequence, getEmailLog } from "@/lib/db";
import { processSequence, SEQUENCE } from "@/lib/email-sequence";

export const runtime = "nodejs";

// GET → historial de correos enviados a este lead.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || !getLead(id)) {
    return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, log: getEmailLog(id), total: SEQUENCE.length });
}

// POST { action } → controla la secuencia: pause | resume | stop | restart | send-now.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const lead = Number.isInteger(id) ? getLead(id) : undefined;
  if (!lead) {
    return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
  }
  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const now = new Date().toISOString();

  switch (body.action) {
    case "pause":
      setSequence(id, { status: "paused" });
      break;
    case "resume":
      setSequence(id, { status: "active", next_at: now });
      break;
    case "stop":
      setSequence(id, { status: "stopped", next_at: null });
      break;
    case "restart":
      setSequence(id, { status: "active", step: 0, next_at: now });
      break;
    case "send-now":
      setSequence(id, { status: "active", next_at: now });
      await processSequence();
      break;
    default:
      return NextResponse.json({ ok: false, error: "Acción inválida" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    lead: getLead(id),
    log: getEmailLog(id),
    total: SEQUENCE.length,
  });
}
