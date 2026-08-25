import { NextResponse } from "next/server";
import { sequenceStats, setTemplate, resetTemplate } from "@/lib/db";
import { previewSteps } from "@/lib/email-sequence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → vista general de la secuencia: pasos (con texto editable + preview) + stats.
export async function GET() {
  return NextResponse.json({
    ok: true,
    steps: previewSteps(),
    stats: sequenceStats(),
  });
}

// POST → guarda o restaura el texto de un correo.
//   { step, subject, body }  → guarda la edición
//   { step, reset: true }    → vuelve al texto por defecto
export async function POST(req: Request) {
  let body: { step?: number; subject?: string; body?: string; reset?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const step = Number(body.step);
  if (!Number.isInteger(step) || step < 0) {
    return NextResponse.json({ ok: false, error: "Paso inválido" }, { status: 400 });
  }

  if (body.reset) {
    resetTemplate(step);
  } else {
    const subject = (body.subject || "").trim();
    const text = (body.body || "").trim();
    if (!subject || !text) {
      return NextResponse.json({ ok: false, error: "El asunto y el texto son obligatorios" }, { status: 422 });
    }
    setTemplate(step, subject, text);
  }

  return NextResponse.json({ ok: true, steps: previewSteps(), stats: sequenceStats() });
}
