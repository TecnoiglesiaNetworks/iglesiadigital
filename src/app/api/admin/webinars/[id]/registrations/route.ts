import { NextResponse } from "next/server";
import {
  getWebinarById,
  listRegistrations,
  setRegistrationStatus,
  setRegistrationAttended,
} from "@/lib/webinars-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → registros de un webinar (con datos del lead y su etapa propia).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!getWebinarById(id)) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
  return NextResponse.json({ ok: true, registrations: listRegistrations(id) });
}

// PATCH → cambia la etapa (status) o la asistencia de un registro concreto.
// Body: { leadId, status? , attended? }.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!getWebinarById(id)) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });

  let body: { leadId?: number; status?: string; attended?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  if (!body.leadId) {
    return NextResponse.json({ ok: false, error: "Falta leadId" }, { status: 422 });
  }
  if (typeof body.status === "string") setRegistrationStatus(id, body.leadId, body.status);
  if (typeof body.attended === "boolean") setRegistrationAttended(id, body.leadId, body.attended);
  return NextResponse.json({ ok: true });
}
