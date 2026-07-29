import { NextResponse } from "next/server";
import { getSendgrid } from "@/lib/sendgrid";
import { reportEmail, notifyEmail } from "@/emails/report-template";
import { computeResult, type Answers, type Result } from "@/components/quiz/scoring";
import { upsertLead } from "@/lib/db";

export const runtime = "nodejs";

type Body = {
  name?: string;
  church?: string;
  email?: string;
  whatsapp?: string;
  city?: string;
  answers?: Answers;
  result?: Result;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const { name, church, email, whatsapp, city, answers } = body;
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ ok: false, error: "Faltan nombre o correo" }, { status: 422 });
  }

  // Recalculamos en el servidor por seguridad (no confiamos en el cliente).
  const result = answers ? computeResult(answers) : body.result;
  if (!result) {
    return NextResponse.json({ ok: false, error: "Sin respuestas" }, { status: 422 });
  }

  // Guardamos el lead en la base de datos (para el panel/CRM). No debe romper la
  // experiencia si algo falla aquí, así que va en su propio try.
  try {
    upsertLead({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      church,
      whatsapp,
      city,
      score: result.pct,
      level: result.level,
      answers,
      result,
      source: "quiz",
    });
  } catch (dbErr) {
    console.error("No se pudo guardar el lead en la base:", dbErr);
  }

  const from = {
    email: process.env.LEAD_FROM_EMAIL || "hola@iglesiadigital.net",
    name: process.env.LEAD_FROM_NAME || "Iglesia Digital",
  };
  const notify = process.env.LEAD_NOTIFY_EMAIL;
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "https://iglesiadigital.net/";

  try {
    const sg = getSendgrid();

    // 1) Reporte al prospecto
    await sg.send({
      to: email,
      from,
      subject: `${name.split(" ")[0]}, tu diagnóstico digital (${result.pct}%) 📊`,
      html: reportEmail({ name, church, city }, result, bookingUrl),
    });

    // 2) Aviso interno al equipo (opcional)
    if (notify) {
      await sg.send({
        to: notify,
        from,
        replyTo: email,
        subject: `Nuevo lead · ${name} · ${result.pct}% ${result.grantCallout ? "· ⚑ Grant" : ""}`,
        html: notifyEmail({ name, church, email, whatsapp, city }, result),
      });
    }

    // TODO opcional: agregar el contacto a una lista/segmento de SendGrid Marketing.
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("SendGrid error:", err);
    // No bloqueamos la experiencia del usuario: el resultado ya se muestra en pantalla.
    return NextResponse.json({ ok: false, error: "No se pudo enviar el correo" }, { status: 502 });
  }
}
