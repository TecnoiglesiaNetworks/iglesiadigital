import { NextResponse } from "next/server";
import { setWebinarTemplate, resetWebinarTemplate } from "@/lib/db";
import { REMINDERS, POST_SEQUENCE, webinarPreview } from "@/lib/webinar-emails";

export const runtime = "nodejs";

// Lista de todos los correos del webinar con su texto (editado o por defecto) y
// la vista previa renderizada, agrupados en "recordatorios" y "secuencia".
function buildList() {
  const map = (t: { key: string; label: string; whenLabel: string }) => {
    const p = webinarPreview(t.key);
    return {
      key: t.key,
      label: t.label,
      whenLabel: t.whenLabel,
      subjectRaw: p.subjectRaw,
      bodyRaw: p.bodyRaw,
      subjectPreview: p.subjectPreview,
      html: p.html,
      edited: p.edited,
    };
  };
  return {
    reminders: REMINDERS.map(map),
    sequence: POST_SEQUENCE.map(map),
  };
}

export async function GET() {
  return NextResponse.json({ ok: true, ...buildList() });
}

// POST { key, subject, body } → guarda un override. Sin subject/body → reset.
export async function POST(req: Request) {
  let body: { key?: string; subject?: string; body?: string; reset?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const key = (body.key || "").trim();
  const valid = [...REMINDERS, ...POST_SEQUENCE].some((t) => t.key === key);
  if (!valid) return NextResponse.json({ ok: false, error: "Clave inválida" }, { status: 422 });

  if (body.reset) {
    resetWebinarTemplate(key);
  } else {
    if (!body.subject?.trim() || !body.body?.trim()) {
      return NextResponse.json({ ok: false, error: "Faltan asunto o cuerpo" }, { status: 422 });
    }
    setWebinarTemplate(key, body.subject.trim(), body.body.trim());
  }
  return NextResponse.json({ ok: true, ...buildList() });
}
