import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import { upsertLead, getLead } from "@/lib/db";
import { webinarNotifyEmail } from "@/emails/webinar-template";
import { sendWebinarEmail } from "@/lib/webinar-emails";

export const runtime = "nodejs";

type Body = {
  name?: string;
  email?: string;
  whatsapp?: string;
  church?: string;
  city?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const { name, email, whatsapp, church, city } = body;
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ ok: false, error: "Faltan nombre o correo" }, { status: 422 });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Guardamos al registrado como lead con source="webinar". No debe romper la
  // experiencia si algo falla aquí, por eso va en su propio try.
  let savedId: number | undefined;
  try {
    const saved = upsertLead({
      name: name.trim(),
      email: cleanEmail,
      whatsapp: whatsapp?.trim() || undefined,
      church: church?.trim() || undefined,
      city: city?.trim() || undefined,
      source: "webinar",
      status: "registrado",
    });
    savedId = saved.id;
  } catch (dbErr) {
    console.error("No se pudo guardar el registro del webinar:", dbErr);
  }

  // Aviso interno de cada registro (fijado en código, igual que el flujo del quiz).
  const notify = "pedro@tecnoiglesia.com";

  try {
    // 1) Confirmación al registrado (plantilla editable 'confirm').
    const lead = savedId ? getLead(savedId) : undefined;
    if (lead) {
      await sendWebinarEmail(lead, "confirm");
    }

    // 2) Aviso interno al equipo.
    if (notify) {
      await sendEmail({
        to: notify,
        replyTo: cleanEmail,
        subject: `Registro webinar · ${name.trim()}`,
        html: webinarNotifyEmail({ name: name.trim(), email: cleanEmail, whatsapp, church, city }),
      });
    }
  } catch (err) {
    console.error("Error al enviar el correo de confirmación del webinar:", err);
    // No bloqueamos: el registro ya quedó guardado y el Paso 2 se muestra igual.
    return NextResponse.json({ ok: true, emailFailed: true });
  }

  return NextResponse.json({ ok: true });
}
