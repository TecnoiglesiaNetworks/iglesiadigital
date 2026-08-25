// Envío de correos con Resend (https://resend.com) usando su API REST directa,
// sin dependencias extra. El remitente debe estar en un dominio verificado en
// Resend (p.ej. iglesiadigital.net o tecnoiglesia.com).

type Mail = { to: string; subject: string; html: string; replyTo?: string };

export function mailFrom() {
  const email = process.env.LEAD_FROM_EMAIL || "hola@iglesiadigital.net";
  const name = (process.env.LEAD_FROM_NAME || "Iglesia Digital").replace(/"/g, "");
  // El nombre va entre comillas: si trae caracteres especiales (·, comas, etc.)
  // algunos proveedores rechazan el remitente sin comillar.
  return `"${name}" <${email}>`;
}

export function mailerReady() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail({ to, subject, html, replyTo }: Mail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Falta RESEND_API_KEY en las variables de entorno.");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: mailFrom(),
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${detail}`);
  }
}
