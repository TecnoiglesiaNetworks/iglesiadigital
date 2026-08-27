import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import { reportEmail, notifyEmail } from "@/emails/report-template";
import { computeResult, type Answers, type Result } from "@/components/quiz/scoring";
import { upsertLead, enrollLeadInSequence } from "@/lib/db";

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
    const saved = upsertLead({
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
    // Inscribe al lead en la secuencia de emails. El primer correo sale ~2 h
    // después (para no encimarse con el correo del diagnóstico). Si luego paga,
    // la secuencia se detiene sola.
    enrollLeadInSequence(saved.id, new Date(Date.now() + 2 * 3600_000).toISOString());
  } catch (dbErr) {
    console.error("No se pudo guardar el lead en la base:", dbErr);
  }

  // Aviso de cada lead nuevo. Fijado en código (ignora LEAD_NOTIFY_EMAIL de Coolify)
  // para que llegue siempre a este correo.
  const notify = "pedro@tecnoiglesia.com";
  // Botón "Agendar mi asesoría gratuita" del reporte → agenda de Zoom (Calendly).
  const bookingUrl = "https://calendly.com/tecnoiglesianetwork/onboarding-curso-ede";
  // Botón secundario → oferta directa (con los datos del lead para ligar el pago).
  const base = process.env.PUBLIC_BASE_URL || "https://iglesiadigital.net";
  const offerParams = new URLSearchParams({ email: email.trim().toLowerCase() });
  if (name) offerParams.set("name", name.trim());
  if (church) offerParams.set("church", church.trim());
  const offerUrl = `${base}/oferta?${offerParams.toString()}`;

  try {
    // 1) Reporte al prospecto
    await sendEmail({
      to: email,
      subject: `${name.split(" ")[0]}, tu diagnóstico digital (${result.pct}%) 📊`,
      html: reportEmail({ name, church, city }, result, bookingUrl, offerUrl),
    });

    // 2) Aviso interno al equipo (opcional)
    if (notify) {
      await sendEmail({
        to: notify,
        replyTo: email,
        subject: `Nuevo lead · ${name} · ${result.pct}% ${result.grantCallout ? "· ⚑ Grant" : ""}`,
        html: notifyEmail({ name, church, email, whatsapp, city }, result),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Error al enviar el correo (Resend):", err);
    // No bloqueamos la experiencia del usuario: el resultado ya se muestra en pantalla.
    return NextResponse.json({ ok: false, error: "No se pudo enviar el correo" }, { status: 502 });
  }
}
