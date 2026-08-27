import { NextResponse } from "next/server";
import { processSequence } from "@/lib/email-sequence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Procesa los correos de la secuencia que ya tocan. Lo llama el temporizador
// interno, pero también se puede invocar por cron externo / Coolify Scheduled
// Task. Si defines CRON_SECRET, hay que enviarlo como ?key= o header x-cron-key.
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
    const res = await processSequence();
    return NextResponse.json({ ok: true, ...res });
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
