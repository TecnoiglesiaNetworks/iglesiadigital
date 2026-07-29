import { NextResponse } from "next/server";
import { deleteLead, getLead, updateLead } from "@/lib/db";

export const runtime = "nodejs";

// PATCH /api/admin/leads/:id → mover de columna, cambiar temperatura, notas, etc.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }
  if (!getLead(id)) {
    return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const lead = updateLead(id, body);
  return NextResponse.json({ ok: true, lead });
}

// DELETE /api/admin/leads/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }
  deleteLead(id);
  return NextResponse.json({ ok: true });
}
