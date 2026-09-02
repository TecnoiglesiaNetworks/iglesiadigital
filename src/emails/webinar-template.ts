import { WEBINAR } from "@/lib/webinar";

/** Correo de confirmación que recibe quien se registra al webinar. */
export function webinarConfirmEmail(lead: { name: string }) {
  const first = lead.name?.split(" ")[0] || "Hola";
  const postal =
    process.env.LEAD_POSTAL_ADDRESS ||
    "Agua Azul #903 Int. Ab81, Col. Jardines del Moral, CP 37160, León, Guanajuato, México";

  return `<!DOCTYPE html><html><body style="margin:0;background:#f4f5fb;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#150F2E;border-radius:18px;padding:30px;text-align:center">
      <div style="color:#FF5001;font-size:12px;letter-spacing:2px;text-transform:uppercase">Webinar gratuito · Iglesia Digital</div>
      <h1 style="color:#fff;font-size:23px;margin:12px 0 6px;line-height:1.25">${WEBINAR.title}</h1>
      <p style="color:#98A2CE;font-size:14px;margin:0">${WEBINAR.subtitle}</p>
    </div>

    <div style="background:#fff;border-radius:16px;padding:26px;margin-top:14px">
      <p style="color:#111;font-size:16px;margin:0 0 12px">¡${first}, tu lugar está reservado! 🎉</p>
      <p style="color:#445;font-size:15px;margin:0 0 18px">Ya estás dentro del webinar. Guarda esta fecha:</p>

      <div style="background:#f6f4ff;border:1px solid #e7e0ff;border-radius:12px;padding:18px;text-align:center;margin-bottom:20px">
        <div style="color:#6A3DE8;font-weight:700;font-size:18px">${WEBINAR.dateLabel} · ${WEBINAR.timeLabel}</div>
        <div style="color:#889;font-size:13px;margin-top:4px">${WEBINAR.timeZoneMain}</div>
      </div>

      <div style="background:#fff8e8;border:1px solid #f3d38a;border-radius:12px;padding:16px;margin-bottom:20px">
        <b style="color:#a9760a;font-size:14px">📩 El enlace para ver el webinar en vivo te llegará por este mismo correo el día del evento.</b>
      </div>

      <p style="color:#111;font-size:15px;font-weight:700;margin:0 0 6px">Falta un paso muy importante 👇</p>
      <p style="color:#445;font-size:15px;margin:0 0 16px">Únete al grupo de WhatsApp del webinar. Ahí te enviaremos recordatorios, el material y el acceso el día del evento. Sin el grupo podrías perderte la sesión.</p>

      <div style="text-align:center;margin:8px 0 6px">
        <a href="${WEBINAR.whatsappGroupUrl}" style="display:inline-block;background:#25D366;color:#ffffff;font-weight:700;text-decoration:none;padding:15px 28px;border-radius:12px;font-size:16px">Unirme al grupo de WhatsApp →</a>
      </div>
      <p style="color:#99a;font-size:12px;text-align:center;margin-top:14px">Nos vemos en vivo. ¡Prepárate para llevar tu iglesia al mundo digital!</p>
    </div>

    <p style="color:#aab;font-size:11px;text-align:center;margin-top:16px;line-height:1.7">
      © Tecnoiglesia Network · Programa Iglesia Digital<br>
      ${postal}
    </p>
  </div></body></html>`;
}

/** Aviso interno para el equipo con los datos del registrado. */
export function webinarNotifyEmail(lead: {
  name: string;
  email: string;
  whatsapp?: string;
  church?: string;
  city?: string;
}) {
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
    <h2 style="margin:0 0 10px">Nuevo registro · Webinar "La Gran Comisión también es digital"</h2>
    <table cellpadding="4">
      <tr><td><b>Nombre</b></td><td>${lead.name}</td></tr>
      <tr><td><b>Correo</b></td><td>${lead.email}</td></tr>
      <tr><td><b>WhatsApp</b></td><td>${lead.whatsapp || "-"}</td></tr>
      <tr><td><b>Iglesia</b></td><td>${lead.church || "-"}</td></tr>
      <tr><td><b>Ciudad</b></td><td>${lead.city || "-"}</td></tr>
    </table>
  </div>`;
}
