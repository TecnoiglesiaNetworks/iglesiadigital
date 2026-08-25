import { NextResponse } from "next/server";
import { sequenceStats } from "@/lib/db";
import { previewSteps } from "@/lib/email-sequence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → vista general de la secuencia: pasos (con preview) + estadísticas de envío.
export async function GET() {
  return NextResponse.json({
    ok: true,
    steps: previewSteps(),
    stats: sequenceStats(),
  });
}
