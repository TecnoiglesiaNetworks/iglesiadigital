import { NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";
import { WEBINAR } from "@/lib/webinar";
import { resolveWebinarConfig } from "@/lib/webinar-config";

export const runtime = "nodejs";

// Convierte un ISO con offset a "YYYY-MM-DDTHH:MM" en hora CDMX (para el input
// datetime-local del admin).
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

// GET → ajustes del webinar (link de YouTube, nombre y fecha/hora).
export async function GET() {
  const startsAt = getSetting("webinar_starts_at") || WEBINAR.startsAt;
  const cfg = resolveWebinarConfig();
  return NextResponse.json({
    ok: true,
    youtubeUrl: getSetting("webinar_youtube_url") || "",
    title: getSetting("webinar_title") || WEBINAR.title,
    subtitle: getSetting("webinar_subtitle") || WEBINAR.subtitle,
    startsAtLocal: toLocalInput(startsAt), // para el input datetime-local
    dateLabel: cfg.dateLabel,
    timeLabel: cfg.timeLabel,
  });
}

// POST → guarda cualquier subconjunto: { youtubeUrl?, title?, subtitle?, startsAtLocal? }.
export async function POST(req: Request) {
  let body: { youtubeUrl?: string; title?: string; subtitle?: string; startsAtLocal?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  if (body.youtubeUrl !== undefined) setSetting("webinar_youtube_url", body.youtubeUrl.trim());
  if (body.title !== undefined) setSetting("webinar_title", body.title.trim());
  if (body.subtitle !== undefined) setSetting("webinar_subtitle", body.subtitle.trim());
  if (body.startsAtLocal !== undefined && body.startsAtLocal.trim()) {
    // El valor viene sin zona (hora CDMX). Lo guardamos con offset -06:00.
    const v = body.startsAtLocal.trim(); // "2026-09-08T20:00"
    setSetting("webinar_starts_at", `${v}:00-06:00`);
  }

  const cfg = resolveWebinarConfig();
  return NextResponse.json({
    ok: true,
    youtubeUrl: cfg.youtubeUrl,
    title: cfg.title,
    subtitle: cfg.subtitle,
    startsAtLocal: toLocalInput(cfg.startsAt),
    dateLabel: cfg.dateLabel,
    timeLabel: cfg.timeLabel,
  });
}
