import { NextResponse } from "next/server";
import { fetchRecentBookings } from "@/lib/calendly";
import { markScheduledByEmail } from "@/lib/db";

export const runtime = "nodejs";

// POST /api/admin/calendly-sync → backfill: consulta las citas recientes en
// Calendly y marca los leads que ya agendaron (por email). Útil si el webhook
// no estaba activo cuando agendaron.
export async function POST() {
  try {
    const bookings = await fetchRecentBookings(90);
    let matched = 0;
    for (const b of bookings) {
      const lead = markScheduledByEmail(b.email, b.startTime, b.uri, b.canceled);
      if (lead) matched++;
    }
    return NextResponse.json({ ok: true, checked: bookings.length, matched });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
