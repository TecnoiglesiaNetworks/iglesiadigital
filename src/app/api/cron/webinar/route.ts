import { NextResponse } from "next/server";
import { processWebinar } from "@/lib/webinar-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Procesa los recordatorios anclados al evento y la secuencia de venta
// post-evento del webinar. Igual que el cron del diagnóstico: se puede llamar
// por cron externo / Coolify Scheduled Task. Si defines CRON_SECRET, hay que
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
    const res = await processWebinar();
    return NextResponse.json({ ok: true, ...res });
  } catch (e: any) {
    console.error("[cron] error procesando el webinar:", e);
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 200 });
  }
}

export async function GET(req: Request) {
  return run(req);
}
export async function POST(req: Request) {
  return run(req);
}
