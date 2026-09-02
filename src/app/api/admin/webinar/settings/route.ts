import { NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";

export const runtime = "nodejs";

// GET → ajustes del webinar (link de YouTube).
export async function GET() {
  return NextResponse.json({ ok: true, youtubeUrl: getSetting("webinar_youtube_url") || "" });
}

// POST { youtubeUrl } → guarda el link de YouTube del evento.
export async function POST(req: Request) {
  let body: { youtubeUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const url = (body.youtubeUrl || "").trim();
  setSetting("webinar_youtube_url", url);
  return NextResponse.json({ ok: true, youtubeUrl: url });
}
