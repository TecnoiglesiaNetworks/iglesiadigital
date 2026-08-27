import type { Result } from "@/components/quiz/scoring";

type LeadInfo = { name: string; church?: string; city?: string };

/** Correo HTML con el reporte personalizado que recibe el prospecto. */
export function reportEmail(
  lead: LeadInfo,
  result: Result,
  bookingUrl: string,
  offerUrl?: string,
  unsubscribeUrl?: string
) {
  const first = lead.name?.split(" ")[0] || "Hola";
  const postal = process.env.LEAD_POSTAL_ADDRESS || "Tecnoiglesia Network";
  const bars = result.dims
    .map(
      (d) => `
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#334">${d.name}</td>
        <td style="padding:6px 0;font-size:14px;color:#889;text-align:right;width:48px">${d.pct}%</td>
      </tr>
      <tr><td colspan="2" style="padding:0 0 10px">
        <div style="height:8px;background:#eceefb;border-radius:99px">
          <div style="height:8px;width:${d.pct}%;background:linear-gradient(90deg,#6A3DE8,#FF5001);border-radius:99px"></div>
        </div>
      </td></tr>`
    )
    .join("");

  const wins = result.wins
    .map(
      (w, i) => `
      <tr><td style="padding:12px 0;border-top:1px solid #eee">
        <b style="color:#111;font-size:15px">${i + 1}. ${w.title}</b><br/>
        <span style="color:#667;font-size:14px">${w.body}</span>
      </td></tr>`
    )
    .join("");

  const grant = result.grantCallout
    ? `<div style="margin:22px 0;padding:18px;border:1px solid #f3d38a;background:#fff8e8;border-radius:12px">
        <b style="color:#a9760a;font-size:15px">${result.grantCallout.title}</b><br/>
        <span style="color:#665;font-size:14px">${result.grantCallout.body}</span>
      </div>`
    : "";

  return `<!DOCTYPE html><html><body style="margin:0;background:#f4f5fb;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#150F2E;border-radius:18px;padding:30px;text-align:center">
      <div style="color:#FF5001;font-size:12px;letter-spacing:2px;text-transform:uppercase">Iglesia Digital</div>
      <h1 style="color:#fff;font-size:22px;margin:10px 0 4px">${first}, aquí está tu diagnóstico</h1>
      <div style="font-size:52px;font-weight:800;color:#FF5001;line-height:1">${result.pct}%</div>
      <div style="color:#98A2CE;font-size:14px">${result.level}</div>
    </div>
    <div style="background:#fff;border-radius:16px;padding:26px;margin-top:14px">
      <p style="color:#445;font-size:15px;margin:0 0 18px">${result.levelSub}</p>
      <table width="100%" cellpadding="0" cellspacing="0">${bars}</table>
      ${grant}
      <h3 style="color:#111;font-size:17px;margin:22px 0 4px">Tus 3 movimientos de mayor impacto</h3>
      <table width="100%" cellpadding="0" cellspacing="0">${wins}</table>
      <div style="text-align:center;margin-top:26px">
        <a href="${bookingUrl}" style="display:inline-block;background:#FF5001;color:#ffffff;font-weight:700;text-decoration:none;padding:15px 28px;border-radius:12px;font-size:16px">Agendar mi asesoría gratuita →</a>
        ${
          offerUrl
            ? `<div style="margin-top:14px">
        <a href="${offerUrl}" style="display:inline-block;color:#6A3DE8;font-weight:600;text-decoration:none;font-size:14px;border-bottom:1px solid #d9cffb;padding-bottom:1px">O inscríbete ya con el precio de aniversario ($97) →</a>
      </div>`
            : ""
        }
      </div>
      <p style="color:#99a;font-size:12px;text-align:center;margin-top:18px">Este diagnóstico es orientativo, basado en tus respuestas.</p>
    </div>
    <p style="color:#aab;font-size:11px;text-align:center;margin-top:16px;line-height:1.7">
      © Tecnoiglesia Network · Programa Iglesia Digital<br>
      ${postal}${
        unsubscribeUrl
          ? `<br><a href="${unsubscribeUrl}" style="color:#889;text-decoration:underline">Cancelar suscripción</a>`
          : ""
      }
    </p>
  </div></body></html>`;
}

/** Aviso interno para tu equipo con los datos del lead. */
export function notifyEmail(
  lead: { name: string; church?: string; email: string; whatsapp?: string; city?: string },
  result: Result
) {
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
    <h2 style="margin:0 0 10px">Nuevo lead · Auditoría Digital</h2>
    <table cellpadding="4">
      <tr><td><b>Nombre</b></td><td>${lead.name}</td></tr>
      <tr><td><b>Iglesia</b></td><td>${lead.church || "-"}</td></tr>
      <tr><td><b>Correo</b></td><td>${lead.email}</td></tr>
      <tr><td><b>WhatsApp</b></td><td>${lead.whatsapp || "-"}</td></tr>
      <tr><td><b>Ciudad</b></td><td>${lead.city || "-"}</td></tr>
      <tr><td><b>Madurez</b></td><td>${result.pct}% · ${result.level}</td></tr>
    </table>
    <p style="color:#a9760a">${result.grantCallout ? "⚑ Posible candidato a Google Grant" : ""}</p>
  </div>`;
}
