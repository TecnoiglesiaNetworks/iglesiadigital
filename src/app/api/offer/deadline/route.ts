import { NextResponse } from "next/server";
import { getOfferDeadline } from "@/lib/offer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Público: la fecha límite de la oferta para la cuenta regresiva del front.
export async function GET() {
  return NextResponse.json({ ok: true, deadline: getOfferDeadline() });
}
