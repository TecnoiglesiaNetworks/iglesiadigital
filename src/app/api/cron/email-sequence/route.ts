import { NextResponse } from "next/server";
import { processSequence } from "@/lib/email-sequence";
import { processWebinar } from "@/lib/webinar-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Procesa, en cada corrida del cron, DOS cosas:
//  1) La secuencia de emails del diagnóstico (leads no pagados).
//  2) Los recordatorios + secuencia post-evento del WEBINAR.
// Así la misma tarea programada de Coolify (cada 15 min) atiende ambos flujos,
// sin necesidad de configurar un segundo cron. Si defines CRON_SECRET, hay que
// enviarlo como ?key= o header x-cron-key.
async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(req.url);
    const key = url.searchParams.get("key") || req.headers.get("x-cron-key");
    if (key !== secret) {
      return NextResponse.json({ ok: false, error: "no autorizado" }, { status: 401 });
    }
  }
  try {
    const seq = await processSequence();
    // El webinar no debe tumbar el cron del diagnóstico si algo falla.
    let webinar = { reminders: 0, sequence: 0, errors: 0 };
    try {
      webinar = await processWebinar();
    } catch (e) {
      console.error("[cron] error procesando el webinar:", e);
    }
    return NextResponse.json({ ok: true, ...seq, webinar });
  } catch (e: any) {
    // Siempre respondemos JSON chico (evita páginas de error grandes que el
    // servicio de cron marca como "salida demasiado grande").
    console.error("[cron] error procesando la secuencia:", e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 200 });
  }
}

export async function GET(req: Request) {
  return run(req);
}
export async function POST(req: Request) {
  return run(req);
}
