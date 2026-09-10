import { NextResponse } from "next/server";
import { getActiveWebinar } from "@/lib/webinars-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Datos públicos del webinar activo, para el cintillo del home. Sin caché para
   que el contador refleje siempre la fecha vigente (editable desde /admin). */
export async function GET() {
  const w = getActiveWebinar();
  const headers = { "Cache-Control": "no-store" };
  if (!w) return NextResponse.json({ active: false }, { headers });
  return NextResponse.json(
    { active: true, slug: w.slug, title: w.title, startsAt: w.starts_at },
    { headers }
  );
}
