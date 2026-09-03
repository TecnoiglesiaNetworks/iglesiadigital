/* =====================================================================
   Motor de correos del WEBINAR — aislado de la secuencia del diagnóstico.

   Dos mecanismos:
   A) Recordatorios ANCLADOS a la fecha del evento (WEBINAR.startsAt):
      confirm (al registrarse) · r1 (1 día antes) · r2 (1 h antes) ·
      r3 (30 min antes, con el link de YouTube).
   B) Secuencia de venta POST-evento (7 correos, 1/día) que arranca al
      terminar el webinar y se detiene sola al convertirse en cliente.

   Los textos son editables desde el admin (tabla webinar_templates). Aquí
   viven los textos por defecto y el renderizador al HTML de marca.
   ===================================================================== */
import { sendEmail, mailerReady } from "./mailer";
import { getWebinarTemplate, logSequenceEmail, getLead, type LeadRow } from "./db";
import {
  listWebinars,
  registrationsForWebinar,
  regRemindersSent,
  markRegReminderSent,
  setRegSequence,
  dueRegSeq,
} from "./webinars-db";
import { unsubUrl } from "./unsubscribe";
import { resolveWebinarConfig, configForWebinar, type WebinarConfig } from "./webinar-config";

const BASE = process.env.PUBLIC_BASE_URL || "https://iglesiadigital.net";
const OFFER_PATH = "/oferta";
const POSTAL =
  process.env.LEAD_POSTAL_ADDRESS ||
  "Agua Azul #903 Int. Ab81, Col. Jardines del Moral, CP 37160, León, Guanajuato, México";

// ── Helpers de personalización ────────────────────────────────────────────────
function first(l: LeadRow) {
  return (l.name || "").split(" ")[0] || "Hola";
}
function iglesia(l: LeadRow) {
  return l.church?.trim() || "tu iglesia";
}
function offerUrl(l: LeadRow) {
  const p = new URLSearchParams({ email: l.email });
  if (l.name) p.set("name", l.name);
  if (l.church) p.set("church", l.church);
  return `${BASE}${OFFER_PATH}?${p.toString()}`;
}

// ── Render del texto editable a HTML de marca ─────────────────────────────────
// Formato editable (sin HTML crudo):
//   · Cada línea = un párrafo.
//   · {nombre} y {iglesia} = datos del registrado.
//   · **texto** = negrita.
//   · [GRUPO]    o [GRUPO:Texto]    = botón verde al grupo de WhatsApp.
//   · [YOUTUBE]  o [YOUTUBE:Texto]  = botón rojo al link de YouTube en vivo.
//   · [OFERTA]   o [OFERTA:Texto]   = botón naranja a la oferta del curso.
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function subVars(s: string, l: LeadRow, cfg?: WebinarConfig) {
  const c = cfg ?? resolveWebinarConfig();
  return s
    .replace(/\{nombre\}/g, first(l))
    .replace(/\{iglesia\}/g, iglesia(l))
    .replace(/\{fecha\}/g, c.dateLabel)
    .replace(/\{hora\}/g, c.timeLabel)
    .replace(/\{zona\}/g, c.timeZoneMain);
}
function inline(s: string, l: LeadRow, cfg?: WebinarConfig) {
  return esc(subVars(s, l, cfg)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}

const pStyle = "color:#445;font-size:15px;line-height:1.6;margin:0 0 14px";
function button(text: string, url: string, color: string) {
  const safeUrl = url || "#";
  return `<div style="text-align:center;margin:20px 0">
    <a href="${safeUrl}" style="display:inline-block;background:${color};color:#ffffff;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:12px;font-size:16px">${text}</a>
  </div>`;
}

function renderBodyHtml(text: string, l: LeadRow, cfg?: WebinarConfig, reason?: string) {
  const c = cfg ?? resolveWebinarConfig();
  const lines = text.split("\n").map((x) => x.trim()).filter(Boolean);
  const parts = lines.map((line) => {
    const grupo = line.match(/^\[GRUPO(?::\s*(.*?))?\]$/i);
    if (grupo) return button(esc(subVars(grupo[1] || "Unirme al grupo de WhatsApp →", l, c)), c.whatsappGroupUrl, "#25D366");
    const yt = line.match(/^\[YOUTUBE(?::\s*(.*?))?\]$/i);
    if (yt) return button(esc(subVars(yt[1] || "Ver el webinar en vivo →", l, c)), c.youtubeUrl, "#FF0000");
    const reg = line.match(/^\[REGISTRO(?::\s*(.*?))?\]$/i);
    // Apunta al landing de ESTE webinar (por slug), no al activo, para que las
    // invitaciones por webinar lleven a la persona al evento correcto.
    if (reg) {
      const regUrl = c.slug ? `${BASE}/webinar/${c.slug}` : `${BASE}/webinar`;
      return button(esc(subVars(reg[1] || "Registrarme gratis al webinar →", l, c)), regUrl, "#FF5001");
    }
    const off = line.match(/^\[OFERTA(?::\s*(.*?))?\]$/i);
    if (off) return button(esc(subVars(off[1] || "Inscribirme al curso →", l, c)), offerUrl(l), "#FF5001");
    return `<p style="${pStyle}">${inline(line, l, c)}</p>`;
  });
  return shell(parts.join(""), unsubUrl(l.email), c.title, reason, preheaderFrom(text, l, c));
}

// Texto de vista previa (preheader): primera línea de texto real del correo,
// sin markdown ni tokens de botón. Es lo que se ve en la bandeja junto al asunto.
function preheaderFrom(text: string, l: LeadRow, cfg?: WebinarConfig) {
  const lines = text
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x && !/^\[[A-Z]/i.test(x)); // sin líneas de botón
  // Salta el saludo ("¡Hola ...!") y toma la primera línea con contenido real.
  const line = lines.find((x) => !/^¡?hola\b/i.test(x)) || lines[0] || "";
  return subVars(line.replace(/\*\*(.+?)\*\*/g, "$1"), l, cfg);
}

function preheader(text: string) {
  // Oculto en el cuerpo pero visible en la vista previa de la bandeja.
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f4f5fb;opacity:0">${esc(text)}</div>
  <div style="display:none;max-height:0;overflow:hidden">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`;
}

function shell(inner: string, unsubscribeLink: string, title: string, reason?: string, pre = "") {
  const why = reason || "te registraste al webinar gratuito";
  return `<!DOCTYPE html><html><body style="margin:0;background:#f4f5fb;font-family:Arial,Helvetica,sans-serif">
  ${pre ? preheader(pre) : ""}
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#150F2E;border-radius:18px 18px 0 0;padding:22px;text-align:center">
      <div style="color:#FF5001;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700">Webinar · Iglesia Digital</div>
      <div style="color:#fff;font-size:17px;font-weight:800;margin-top:6px">${title}</div>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:26px">
      ${inner}
      <p style="color:#334;font-size:15px;margin:24px 0 0">Un abrazo,<br><b>Pedro Abiú</b><br><span style="color:#889">Iglesia Digital</span></p>
    </div>
    <p style="color:#aab;font-size:11px;text-align:center;margin-top:16px;line-height:1.7">
      © Tecnoiglesia Network · Programa Iglesia Digital<br>
      ${POSTAL}<br>
      Recibes este correo porque ${why}.<br>
      <a href="${unsubscribeLink}" style="color:#889;text-decoration:underline">Cancelar suscripción</a>
    </p>
  </div></body></html>`;
}

// ── Plantillas por defecto (editables desde el admin) ─────────────────────────
export type WebinarTpl = { key: string; label: string; whenLabel: string; subject: string; body: string };

// Recordatorios anclados al evento. offsetMin = minutos ANTES del inicio.
export const REMINDERS: (WebinarTpl & { offsetMin: number })[] = [
  {
    key: "confirm",
    label: "Confirmación (al registrarse)",
    whenLabel: "Al registrarse",
    offsetMin: -1, // no se envía por tiempo; se dispara en el registro.
    subject: "¡Registro confirmado! Nos vemos en el webinar 🎉",
    body: `¡Hola {nombre}!
Tu lugar para el webinar **La Gran Comisión también es Digital** quedó apartado. 🎉
📅 **{fecha} · {hora}** ({zona})
No te lo puedes perder: en una hora te voy a mostrar cómo usar Google, redes, publicidad e IA para que **{iglesia}** alcance a más personas.
Falta un paso importante para que no te quedes fuera: únete al **grupo de WhatsApp** del webinar. Ahí te avisaremos todo (dinámicas, material y el enlace de acceso el día del evento).
[GRUPO:Unirme al grupo de WhatsApp →]
Si **aún no te uniste** al grupo, hazlo ahora y revisa los mensajes que ya publicamos ahí para que no te pierdas nada.
El enlace para ver el webinar en vivo te llegará por este correo el día del evento. ¡Ahí nos vemos!`,
  },
  {
    key: "r1",
    label: "Recordatorio · 1 día antes",
    whenLabel: "1 día antes",
    offsetMin: 24 * 60,
    subject: "Mañana es el webinar 🙌 (te llega el link el día del evento)",
    body: `Hola {nombre},
Ya casi es momento. **Mañana** es nuestro webinar **La Gran Comisión también es Digital**.
📅 **{fecha} · {hora}** ({zona})
El **día del evento** te enviaremos por aquí el enlace para verlo en vivo, así que mantente pendiente de tu correo y del grupo de WhatsApp.
Si aún no estás en el grupo, únete ahora para no perderte ningún aviso:
[GRUPO:Unirme al grupo de WhatsApp →]
Prepárate para tomar notas. Va a ser muy práctico. 🙏`,
  },
  {
    key: "r2",
    label: "Recordatorio · 1 hora antes",
    whenLabel: "1 hora antes",
    offsetMin: 60,
    subject: "⏰ En 1 hora empezamos — La Gran Comisión también es Digital",
    body: `{nombre}, ¡ya casi! 🙌
En **1 hora** comienza el webinar en vivo.
🕗 Hoy · **{hora}** ({zona})
En unos minutos, antes de empezar, te enviaré por aquí el **enlace directo de YouTube** para que entres. Ten tu teléfono o computadora listos y busca un lugar tranquilo.
¿Sigues en el grupo de WhatsApp? Ahí también compartiremos el acceso:
[GRUPO:Abrir el grupo de WhatsApp →]`,
  },
  {
    key: "r3",
    label: "Acceso · 30 min antes (link YouTube)",
    whenLabel: "30 min antes",
    offsetMin: 30,
    subject: "🔴 AQUÍ está tu enlace para ver el webinar EN VIVO",
    body: `{nombre}, ¡es hora! 🔴
En **30 minutos** comenzamos. Este es tu enlace para ver el webinar **en vivo**:
[YOUTUBE:🔴 Ver el webinar en vivo ahora →]
Te recomiendo abrirlo desde ya y dejarlo listo. Da clic en "Notificarme" para que YouTube te avise en cuanto arranquemos.
Nos vemos en unos minutos. Va a valer muchísimo la pena. 🙏`,
  },
];

// Secuencia de venta POST-evento (1 correo/día). afterHours = espera desde el
// correo anterior (el primero sale al terminar el evento).
export const POST_SEQUENCE: (WebinarTpl & { afterHours: number })[] = [
  {
    key: "s1",
    label: "Post 1 · Gracias + repetición",
    whenLabel: "Al terminar",
    afterHours: 0,
    subject: "Gracias por acompañarnos hoy 🙏 (y el siguiente paso)",
    body: `¡Hola {nombre}!
Gracias por estar en el webinar **La Gran Comisión también es Digital**. Espero que te hayas llevado ideas claras para llevar a **{iglesia}** al mundo digital.
Durante el webinar te platiqué del **Programa Iglesia Digital**: 16 semanas llevándote de la mano —con sesiones en vivo cada 15 días— para construir tu presencia digital, activar el **Google Ad Grant ($10,000 USD/mes en publicidad gratis)** y montar tu embudo de seguimiento.
Por haber asistido, tienes acceso a un precio especial. Míralo aquí:
[OFERTA:Ver el precio especial del curso →]
Si tienes cualquier duda, respóndeme este correo. Estoy para ayudarte.`,
  },
  {
    key: "s2",
    label: "Post 2 · Historia / dolor",
    whenLabel: "Día 1",
    afterHours: 24,
    subject: "La historia que veo repetirse en cada iglesia",
    body: `Hola {nombre},
Veo esto una y otra vez: pastores con un corazón enorme, iglesias que aman a su gente… pero que de lunes a sábado casi **desaparecen del mundo digital**, mientras su ciudad entera vive con el teléfono en la mano buscando esperanza.
No es tu culpa —nadie te enseñó esto— y tiene solución. El Programa Iglesia Digital nació para romper ese ciclo, paso a paso y con acompañamiento en vivo.
[OFERTA:Quiero llevar a mi iglesia al siguiente nivel →]`,
  },
  {
    key: "s3",
    label: "Post 3 · Google Ad Grant",
    whenLabel: "Día 2",
    afterHours: 24,
    subject: "$10,000 USD/mes en publicidad… gratis para tu iglesia",
    body: `Hola {nombre},
Google le regala a las iglesias hasta **$10,000 USD mensuales** en publicidad (el Google Ad Grant). Imagina que cuando alguien en tu ciudad busque "iglesia cerca de mí" o "necesito oración", aparezca **{iglesia}**.
En el programa te llevamos paso a paso para obtenerlo y aprovecharlo (incluso con IA). Solo este módulo puede transformar tu alcance para siempre.
[OFERTA:Activar el Grant con el programa →]`,
  },
  {
    key: "s4",
    label: "Post 4 · Temario / qué incluye",
    whenLabel: "Día 3",
    afterHours: 24,
    subject: "Lo que {iglesia} hará en las próximas 16 semanas",
    body: `Hola {nombre},
Esto es lo que construyes dentro del programa, mes a mes:
**Mes 1 —** Equipo digital y estructura. **Mes 2 —** Tu sitio web y servicio en línea. **Mes 3 —** Google Ad Grant, publicidad y embudo de conversión. **Mes 4 —** Lanzamiento y seguimiento espiritual, con tu certificación final.
Todo con sesiones en vivo cada 15 días para que nunca te quedes atorado.
[OFERTA:Ver todo lo que incluye →]`,
  },
  {
    key: "s5",
    label: "Post 5 · Futuro / visión",
    whenLabel: "Día 4",
    afterHours: 24,
    subject: "Imagina {iglesia} dentro de 4 meses",
    body: `Hola {nombre},
Imagina que estamos a 4 meses de hoy: **{iglesia}** con un sitio que funciona, transmisiones con excelencia, un equipo digital organizado y apareciendo en Google gracias al Ad Grant. Nuevas familias llegando y personas tomando decisiones.
No es un sueño lejano: es el resultado del camino que recorremos juntos en el programa.
[OFERTA:Empezar ese camino hoy →]`,
  },
  {
    key: "s6",
    label: "Post 6 · Objeciones / dudas",
    whenLabel: "Día 5",
    afterHours: 24,
    subject: "\"¿Y si no soy bueno con la tecnología?\"",
    body: `Hola {nombre},
Es la duda más común. Y la respuesta es: por eso existe el acompañamiento. No te dejamos solo con un video: cada 15 días nos vemos en vivo, resolvemos tus dudas y revisamos tu avance. Miles de iglesias, con equipos de todas las edades, ya lo han hecho.
Si algo te detiene, respóndeme este correo y lo vemos juntos.
[OFERTA:Inscribirme con acompañamiento →]`,
  },
  {
    key: "s7",
    label: "Post 7 · Última llamada",
    whenLabel: "Día 6",
    afterHours: 24,
    subject: "{nombre}, esta es la última llamada",
    body: `Hola {nombre},
Este es el último correo de esta serie. Asististe al webinar porque en tu corazón hay un deseo de que **{iglesia}** alcance a más personas. El Programa Iglesia Digital es el camino para lograrlo —16 semanas, en vivo, con el Google Ad Grant y tu certificación al final.
No dejes pasar el precio especial para quienes asistieron.
[OFERTA:Asegurar mi lugar ahora →]
Si prefieres, respóndeme y platicamos antes de decidir. Estoy para servirte. 🙏`,
  },
];

// Invitación masiva al webinar (para los leads del diagnóstico). Editable.
export const INVITE: WebinarTpl = {
  key: "invite",
  label: "Invitación al webinar (a leads del diagnóstico)",
  whenLabel: "Envío manual",
  subject: "{nombre}, te invito a un webinar gratuito 🙌",
  body: `¡Hola {nombre}!
Hiciste el diagnóstico digital de **{iglesia}**, y por eso quiero invitarte a algo que te va a servir muchísimo: un **webinar gratuito en vivo**.
📅 **{fecha} · {hora}** ({zona})
En una hora te voy a mostrar cómo usar **Google, redes sociales, publicidad e inteligencia artificial** para que tu iglesia alcance a más personas. Práctico y directo, sin relleno.
Aparta tu lugar (es gratis y hay cupo limitado):
[REGISTRO:Registrarme gratis al webinar →]
Nos vemos en vivo. 🙏`,
};

// Devuelve el texto (editado si existe, o el de por defecto) por clave.
export function webinarTemplateFor(key: string): { subject: string; body: string } {
  const override = getWebinarTemplate(key);
  if (override) return override;
  const all = [...REMINDERS, ...POST_SEQUENCE, INVITE];
  const d = all.find((t) => t.key === key);
  return { subject: d?.subject || "", body: d?.body || "" };
}

// Muestra de datos para la vista previa del admin.
const SAMPLE = {
  name: "Pastor Juan Pérez",
  church: "Iglesia Vida Nueva",
  email: "pastor@iglesiaejemplo.com",
} as LeadRow;

export function webinarPreview(key: string) {
  const tpl = webinarTemplateFor(key);
  return {
    subjectPreview: subVars(tpl.subject, SAMPLE),
    html: renderBodyHtml(tpl.body, SAMPLE),
    edited: Boolean(getWebinarTemplate(key)),
    subjectRaw: tpl.subject,
    bodyRaw: tpl.body,
  };
}

// Envía un correo del webinar a un lead usando su plantilla (por clave) y la
// config de ESE webinar. `reason` cambia el pie de correo (para invitaciones).
export async function sendWebinarEmail(
  lead: LeadRow,
  key: string,
  opts?: { cfg?: WebinarConfig; reason?: string }
): Promise<void> {
  const cfg = opts?.cfg ?? resolveWebinarConfig();
  const tpl = webinarTemplateFor(key);
  const subject = subVars(tpl.subject, lead, cfg);
  await sendEmail({
    to: lead.email,
    subject,
    html: renderBodyHtml(tpl.body, lead, cfg, opts?.reason),
    replyTo: "contacto@tecnoiglesia.com",
    listUnsubscribe: unsubUrl(lead.email),
  });
  logSequenceEmail(lead.id, -1, `[Webinar] ${subject}`);
}

// Envía la invitación de UN webinar a un lote de leads y los marca invitados.
// Pausa entre correos para no rebasar el límite de envío de Resend (unos pocos
// por segundo) ni parecer un pico sospechoso. ~700 ms ≈ 1.4 correos/seg.
const INVITE_DELAY_MS = 700;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendInviteBatch(
  cfg: WebinarConfig,
  leads: LeadRow[],
  onSent: (leadId: number) => void
): Promise<{ sent: number; errors: number }> {
  let sent = 0;
  let errors = 0;
  const reason = "hiciste el diagnóstico digital de tu iglesia";
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    try {
      await sendWebinarEmail(lead, "invite", { cfg, reason });
      onSent(lead.id);
      sent++;
    } catch (e) {
      console.error("[webinar] error invitando a", lead.email, e);
      errors++;
    }
    // Pausa entre envíos (no tras el último) para ritmo seguro.
    if (i < leads.length - 1) await sleep(INVITE_DELAY_MS);
  }
  return { sent, errors };
}

// ── Procesador (lo llama el cron): recorre TODOS los webinars ─────────────────
export async function processWebinar(): Promise<{ reminders: number; sequence: number; errors: number }> {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  let reminders = 0;
  let sequence = 0;
  let errors = 0;

  if (!mailerReady()) {
    console.error("[webinar] Resend no configurado (falta RESEND_API_KEY).");
    return { reminders: 0, sequence: 0, errors: 0 };
  }

  for (const w of listWebinars()) {
    const cfg = configForWebinar(w);
    const start = new Date(cfg.startsAt).getTime();
    const end = start + cfg.durationMin * 60_000;

    // A) Recordatorios anclados al evento + inscripción a la secuencia post-evento.
    for (const reg of registrationsForWebinar(w.id)) {
      if (["cliente", "perdido"].includes(reg.status)) continue;
      const lead = getLead(reg.lead_id);
      if (!lead || lead.unsubscribed || lead.paid) continue;

      const sent = regRemindersSent(reg.reminders_sent);
      for (const r of REMINDERS) {
        if (r.key === "confirm") continue; // se envía en el registro, no por tiempo.
        const sendAt = start - r.offsetMin * 60_000;
        if (now >= sendAt && now < start + 5 * 60_000 && !sent.includes(r.key)) {
          try {
            await sendWebinarEmail(lead, r.key, { cfg });
            markRegReminderSent(reg.reg_id, r.key);
            reminders++;
          } catch (e) {
            console.error("[webinar] error recordatorio", r.key, lead.email, e);
            errors++;
          }
        }
      }

      // Al terminar el evento, inscribe en la secuencia de venta (una sola vez).
      if (now >= end && reg.seq_status === "") {
        setRegSequence(reg.reg_id, { status: "active", step: 0, next_at: new Date(end).toISOString() });
      }
    }

    // B) Secuencia de venta post-evento de este webinar.
    for (const reg of dueRegSeq(w.id, nowIso)) {
      const i = reg.seq_step;
      const step = POST_SEQUENCE[i];
      if (!step) {
        setRegSequence(reg.reg_id, { status: "done", next_at: null });
        continue;
      }
      const lead = getLead(reg.lead_id);
      if (!lead) continue;
      try {
        await sendWebinarEmail(lead, step.key, { cfg });
        const nextIdx = i + 1;
        if (nextIdx < POST_SEQUENCE.length) {
          const nextAt = new Date(now + POST_SEQUENCE[nextIdx].afterHours * 3600_000).toISOString();
          setRegSequence(reg.reg_id, { status: "active", step: nextIdx, next_at: nextAt });
        } else {
          setRegSequence(reg.reg_id, { status: "done", next_at: null });
        }
        sequence++;
      } catch (e) {
        console.error("[webinar] error secuencia", lead.email, e);
        setRegSequence(reg.reg_id, { next_at: new Date(now + 3600_000).toISOString() });
        errors++;
      }
    }
  }

  return { reminders, sequence, errors };
}
