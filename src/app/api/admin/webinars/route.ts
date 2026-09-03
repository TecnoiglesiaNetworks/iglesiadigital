import { NextResponse } from "next/server";
import { listWebinars, createWebinar } from "@/lib/webinars-db";
import { dateLabelFor, timeLabelFor } from "@/lib/webinar-config";
import { localInputToIso, toLocalInput } from "@/lib/webinar-time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → lista de webinars con su conteo de registros y etiquetas legibles.
export async function GET() {
  const items = listWebinars().map((w) => ({
    ...w,
    startsAtLocal: toLocalInput(w.starts_at),
    dateLabel: dateLabelFor(w.starts_at),
    timeLabel: timeLabelFor(w.starts_at),
  }));
  return NextResponse.json({ ok: true, webinars: items });
}

// POST → crea un webinar nuevo. Body: { title, subtitle?, startsAtLocal, youtubeUrl?, whatsappGroupUrl? }.
export async function POST(req: Request) {
  let body: {
    title?: string;
    subtitle?: string;
    startsAtLocal?: string;
    youtubeUrl?: string;
    whatsappGroupUrl?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ ok: false, error: "Falta el nombre del webinar" }, { status: 422 });
  }
  if (!body.startsAtLocal?.trim()) {
    return NextResponse.json({ ok: false, error: "Falta la fecha y hora" }, { status: 422 });
  }
  const w = createWebinar({
    title: body.title,
    subtitle: body.subtitle,
    startsAt: localInputToIso(body.startsAtLocal),
    youtubeUrl: body.youtubeUrl,
    whatsappGroupUrl: body.whatsappGroupUrl,
  });
  return NextResponse.json({ ok: true, webinar: w });
}
