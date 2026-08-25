import { getSendgrid } from "./sendgrid";
import {
  dueSequenceLeads,
  setSequence,
  logSequenceEmail,
  type LeadRow,
} from "./db";

// ── Configuración ─────────────────────────────────────────────────────────────
const BASE = process.env.PUBLIC_BASE_URL || "https://iglesiadigital.net";
const ZOOM_URL = "https://calendly.com/tecnoiglesianetwork/onboarding-curso-ede";

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
  return `${BASE}/oferta?${p.toString()}`;
}

// ── Piezas de HTML ────────────────────────────────────────────────────────────
const p = (html: string) =>
  `<p style="color:#445;font-size:15px;line-height:1.6;margin:0 0 14px">${html}</p>`;

function button(text: string, url: string, color = "#FF5001") {
  return `<div style="text-align:center;margin:20px 0">
    <a href="${url}" style="display:inline-block;background:${color};color:#ffffff;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:12px;font-size:16px">${text}</a>
  </div>`;
}

function shell(inner: string) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#f4f5fb;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#150F2E;border-radius:18px 18px 0 0;padding:22px;text-align:center">
      <div style="color:#FF5001;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700">Iglesia Digital</div>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:26px">
      ${inner}
      <p style="color:#334;font-size:15px;margin:24px 0 0">Un abrazo,<br><b>Pedro Abiú</b><br><span style="color:#889">Iglesia Digital</span></p>
    </div>
    <p style="color:#aab;font-size:11px;text-align:center;margin-top:16px">© Tecnoiglesia Network · Programa Iglesia Digital<br>
    Recibes este correo porque hiciste el diagnóstico digital de tu iglesia.</p>
  </div></body></html>`;
}

// ── Definición de la secuencia ────────────────────────────────────────────────
// afterHours = horas de espera respecto al correo anterior.
type Step = {
  afterHours: number;
  subject: (l: LeadRow) => string;
  body: (l: LeadRow) => string;
};

export const SEQUENCE: Step[] = [
  // 1 · Inmediato
  {
    afterHours: 0,
    subject: (l) => `${first(l)}, tu diagnóstico y el siguiente paso 📊`,
    body: (l) =>
      p(`Hola ${first(l)},`) +
      p(`Gracias por tomarte el tiempo de hacer el diagnóstico digital de <b>${iglesia(l)}</b>. Ese solo paso ya te pone por delante de la mayoría de las iglesias, porque decidiste mirar de frente una pregunta incómoda: <i>¿está mi iglesia realmente presente donde hoy vive la gente?</i>`) +
      p(`Tu resultado te mostró en qué nivel estás y dónde están tus mayores oportunidades. Pero un diagnóstico, por sí solo, no transforma nada. Lo que transforma es un <b>plan claro y alguien que te acompañe a ejecutarlo</b>.`) +
      p(`Para eso existe el <b>Programa Iglesia Digital</b>: 16 semanas llevándote de la mano, con <b>sesiones en vivo por Zoom cada 15 días</b> donde resolvemos tus dudas y revisamos tu avance. No es un curso que compras y abandonas: es acompañamiento real hasta ver resultados.`) +
      p(`Y algo que quiero que sepas desde hoy: dentro del programa te enseñamos a activar el <b>Google Ad Grant</b>, un beneficio de <b>$10,000 USD mensuales en publicidad gratuita</b> que Google le da a las iglesias.`) +
      p(`Por nuestro <b>aniversario</b>, puedes entrar hoy por <b>$97 USD</b> en lugar de $497. Pero es por muy poco tiempo.`) +
      button("Inscribirme por $97 →", offerUrl(l)) +
      p(`Si te queda alguna duda, responde este correo. Lo leo yo.`),
  },
  // 2 · +1 día · storytelling
  {
    afterHours: 24,
    subject: () => `La historia que veo repetirse en cada iglesia 🙏`,
    body: (l) =>
      p(`Hola ${first(l)},`) +
      p(`Déjame contarte algo que veo una y otra vez.`) +
      p(`Un pastor con un corazón enorme. Una iglesia que ama a su gente, que predica con fuego los domingos… pero que de lunes a sábado prácticamente <b>desaparece del mundo digital</b>. Mientras tanto, su ciudad entera vive con el teléfono en la mano: buscando esperanza, respuestas, una comunidad.`) +
      p(`Ese pastor lo sabe. Lo siente. Intenta algo: abre una página, sube unos videos… y luego la vida de la iglesia lo absorbe todo. Sin un plan y sin acompañamiento, el esfuerzo se apaga. Y vuelve esa sensación de <i>"sé que deberíamos hacer más, pero no sé por dónde".</i>`) +
      p(`Si algo de esto te resuena, quiero que sepas dos cosas: <b>no es tu culpa</b> —nadie te enseñó esto— y <b>tiene solución</b>.`) +
      p(`El Programa Iglesia Digital nació justo para romper ese ciclo. Cada 15 días nos vemos en vivo por Zoom para que avances de verdad, con pasos concretos y herramientas listas para usar.`) +
      p(`Antes de decidir, me encantaría conocerte y escuchar el caso de <b>${iglesia(l)}</b> en una llamada corta por Zoom, sin compromiso. En 15 minutos te digo con honestidad si esto es para tu iglesia o no.`) +
      button("Agendar mi llamada por Zoom", ZOOM_URL, "#6A3DE8") +
      p(`Y si ya quieres avanzar, aquí entras con el precio de aniversario ($97):`) +
      button("Inscribirme por $97 →", offerUrl(l)),
  },
  // 3 · +2 días · valor / temario
  {
    afterHours: 24,
    subject: (l) => `Lo que ${iglesia(l)} hará en las próximas 16 semanas`,
    body: (l) =>
      p(`Hola ${first(l)},`) +
      p(`Quiero que veas exactamente lo que vivirás dentro del <b>Programa Iglesia Digital</b>. No es teoría: es un camino de 4 meses, semana a semana, con plantillas, checklists y acompañamiento en vivo.`) +
      p(`<b>Mes 1 — Fundamentos y estructura.</b> Armas tu equipo digital (con documentos editables para definir roles), diagnosticas el estado real de tu iglesia y preparas la documentación para el Google Ad Grant.`) +
      p(`<b>Mes 2 — Construcción digital.</b> Levantas tu sitio web efectivo, configuras la Church Online Platform, ordenas tu streaming y equipo técnico, y haces un simulacro de servicio en vivo.`) +
      p(`<b>Mes 3 — Tráfico y publicidad.</b> Aquí activas el <b>Google Ad Grant: $10,000 USD al mes en anuncios gratis</b>, usas la herramienta de IA SmartReach Ads y construyes tu embudo para acompañar decisiones espirituales. Este mes, por sí solo, vale muchas veces la inversión.`) +
      p(`<b>Mes 4 — Lanzamiento y seguimiento.</b> Planeas y ejecutas tu semana de impacto, organizas los grupos de afirmación para el seguimiento espiritual, y cierras con tu <b>certificado de culminación</b>.`) +
      p(`Todo esto, con <b>sesiones en vivo por Zoom cada 15 días</b> para que nunca te quedes atorado. Por el aniversario: <b>$97 USD</b> en lugar de $497.`) +
      button("Quiero inscribirme →", offerUrl(l)) +
      p(`¿Prefieres que lo veamos juntos primero? Responde este correo o agenda una llamada por Zoom.`),
  },
  // 4 · +3 días · Google Grant + Zoom
  {
    afterHours: 24,
    subject: () => `$10,000 USD al mes en publicidad… gratis para tu iglesia`,
    body: (l) =>
      p(`Hola ${first(l)},`) +
      p(`Sé que suena demasiado bueno para ser verdad, así que voy directo: Google tiene un programa (el <b>Google Ad Grant</b>) que le regala a las organizaciones sin fines de lucro —<b>incluidas las iglesias</b>— hasta <b>$10,000 USD mensuales</b> para anunciarse en su buscador.`) +
      p(`Piensa en lo que eso significa para <b>${iglesia(l)}</b>: cuando alguien en tu ciudad busque <i>"iglesia cerca de mí"</i>, <i>"necesito oración"</i> o <i>"ayuda para mi familia"</i>, tu iglesia puede aparecer ahí, día y noche, sin pagar un peso.`) +
      p(`El problema es que configurarlo bien es complicado, y muchas iglesias lo intentan, cometen errores y pierden el beneficio. Por eso, dentro del programa te llevamos <b>paso a paso</b> para obtenerlo y aprovecharlo (incluso con nuestra herramienta de IA, SmartReach Ads).`) +
      p(`Solo este módulo puede transformar el alcance de tu iglesia para siempre. Y está incluido en los $97 del precio de aniversario.`) +
      button("Agendar mi llamada por Zoom", ZOOM_URL, "#6A3DE8") +
      button("Inscribirme por $97 →", offerUrl(l)),
  },
  // 5 · +5 días · urgencia + futuro
  {
    afterHours: 48,
    subject: (l) => `⏳ Imagina ${iglesia(l)} dentro de 4 meses`,
    body: (l) =>
      p(`Hola ${first(l)},`) +
      p(`Cierra los ojos un segundo e imagina que estamos a cuatro meses de hoy.`) +
      p(`<b>${iglesia(l)}</b> ya tiene un sitio web que sí funciona. Tus transmisiones se ven y se escuchan con excelencia. Tienes un equipo digital organizado que sabe qué hacer cada semana. Y en Google, cuando alguien en tu ciudad busca esperanza, <b>aparece tu iglesia</b> —gracias a los $10,000 USD mensuales del Ad Grant que ya activaste.`) +
      p(`Nuevas familias llegando. Personas tomando decisiones. Un ministerio que por fin alcanza a quienes nunca habrían cruzado la puerta por sí solos.`) +
      p(`Eso no es un sueño lejano: es el resultado del camino que recorres en el Programa Iglesia Digital. Pero empieza con una decisión hoy.`) +
      p(`Y te escribo porque <b>la oferta de aniversario ($97 en vez de $497) está por cerrar</b>. No quiero que tu iglesia se quede afuera.`) +
      button("Asegurar mi lugar por $97 →", offerUrl(l)) +
      p(`Si algo te detiene, respóndeme. Lo resolvemos juntos.`),
  },
  // 6 · +7 días · última llamada
  {
    afterHours: 48,
    subject: (l) => `${first(l)}, se cierra hoy`,
    body: (l) =>
      p(`Hola ${first(l)},`) +
      p(`Hoy es el último día para entrar al <b>Programa Iglesia Digital</b> con el precio de aniversario de <b>$97 USD</b>. Mañana vuelve a $497.`) +
      p(`Hiciste el diagnóstico por una razón: en tu corazón hay un deseo de que <b>${iglesia(l)}</b> crezca y alcance a más personas. Este es el acompañamiento para lograrlo —16 semanas, Zoom en vivo cada 15 días, el Google Ad Grant y tu certificación al final.`) +
      p(`No dejes que el precio de aniversario se te vaya.`) +
      button("Entrar ahora por $97 →", offerUrl(l)) +
      p(`¿Última duda antes de decidir? Agenda una llamada por Zoom y la vemos.`) +
      button("Agendar mi llamada por Zoom", ZOOM_URL, "#6A3DE8"),
  },
];

// Horas de espera para el paso indicado (usado al agendar el siguiente correo).
export function afterHoursFor(step: number): number {
  return SEQUENCE[step]?.afterHours ?? 24;
}

// ── Procesador ────────────────────────────────────────────────────────────────
// Envía los correos que ya tocan. Se llama desde un temporizador interno y/o
// desde el endpoint /api/cron/email-sequence.
export async function processSequence(): Promise<{ sent: number; errors: number }> {
  const now = new Date();
  const due = dueSequenceLeads(now.toISOString());
  if (due.length === 0) return { sent: 0, errors: 0 };

  let sg;
  try {
    sg = getSendgrid();
  } catch (e) {
    console.error("[sequence] SendGrid no configurado:", e);
    return { sent: 0, errors: 0 };
  }
  const from = {
    email: process.env.LEAD_FROM_EMAIL || "hola@iglesiadigital.net",
    name: process.env.LEAD_FROM_NAME || "Pedro Abiú · Iglesia Digital",
  };

  let sent = 0;
  let errors = 0;
  for (const lead of due) {
    const i = lead.seq_step;
    const step = SEQUENCE[i];
    if (!step) {
      setSequence(lead.id, { status: "done", next_at: null });
      continue;
    }
    try {
      const subject = step.subject(lead);
      await sg.send({ to: lead.email, from, subject, html: shell(step.body(lead)) });
      logSequenceEmail(lead.id, i, subject);

      const nextIdx = i + 1;
      if (nextIdx < SEQUENCE.length) {
        const nextAt = new Date(
          now.getTime() + SEQUENCE[nextIdx].afterHours * 3600_000
        ).toISOString();
        setSequence(lead.id, { status: "active", step: nextIdx, next_at: nextAt });
      } else {
        setSequence(lead.id, { status: "done", next_at: null });
      }
      sent++;
    } catch (err) {
      console.error("[sequence] error enviando a", lead.email, err);
      // Reintenta en 1 hora para no bloquear la secuencia.
      setSequence(lead.id, {
        next_at: new Date(now.getTime() + 3600_000).toISOString(),
      });
      errors++;
    }
  }
  return { sent, errors };
}
