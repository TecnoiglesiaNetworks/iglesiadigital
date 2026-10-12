import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Exportación de SOLO LECTURA de los contactos para el mail marketing central
// (descubre.tecnoiglesia.com → Mail marketing). Protegida con
// CONTACTS_EXPORT_TOKEN (Authorization: Bearer …). No modifica nada.

function authorized(req: NextRequest) {
  const token = process.env.CONTACTS_EXPORT_TOKEN || "";
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !got) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Row = {
  email: string;
  name: string;
  church: string | null;
  whatsapp: string | null;
  city: string | null;
  source: string;
  status: string;
  temperature: string;
  paid: number;
  unsubscribed: number;
  created_at: string;
  webinars: number;
  attended: number;
};

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  const rows = db
    .prepare(
      `SELECT l.email, l.name, l.church, l.whatsapp, l.city, l.source, l.status, l.temperature,
              l.paid, l.unsubscribed, l.created_at,
              (SELECT COUNT(*) FROM webinar_registrations r WHERE r.lead_id = l.id) + l.wb_registered AS webinars,
              (SELECT COUNT(*) FROM webinar_registrations r WHERE r.lead_id = l.id AND r.attended = 1) + l.wb_attended AS attended
       FROM leads l`,
    )
    .all() as Row[];

  const contacts = rows.map((r) => {
    const tags = [`id:fuente:${r.source || "quiz"}`, `id:etapa:${r.status || "nuevo"}`, `id:temperatura:${r.temperature || "tibio"}`];
    if (r.paid) tags.push("id:compro");
    if (r.webinars > 0) tags.push("id:webinar");
    if (r.attended > 0) tags.push("id:asistio-webinar");
    return {
      email: r.email,
      name: r.name,
      church: r.church,
      phone: r.whatsapp,
      city: r.city,
      tags,
      unsubscribed: Boolean(r.unsubscribed),
      createdAt: r.created_at,
    };
  });
  return NextResponse.json({ ok: true, source: "iglesiadigital", generatedAt: new Date().toISOString(), contacts });
}
