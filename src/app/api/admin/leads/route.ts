import { NextResponse } from "next/server";
import { listLeads, upsertLead } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/admin/leads → lista completa (para refrescar el tablero sin recargar).
export async function GET() {
  return NextResponse.json({ ok: true, leads: listLeads() });
}

// POST /api/admin/leads → alta manual de un lead desde el panel.
export async function POST(req: Request) {
  let body: { name?: string; email?: string; church?: string; whatsapp?: string; city?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ ok: false, error: "Faltan nombre o correo" }, { status: 422 });
  }
  const lead = upsertLead({
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    church: body.church?.trim(),
    whatsapp: body.whatsapp?.trim(),
    city: body.city?.trim(),
    source: "manual",
  });
  return NextResponse.json({ ok: true, lead });
}
