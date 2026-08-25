import { sendEmail, mailerReady } from "./mailer";
import {
  dueSequenceLeads,
  setSequence,
  logSequenceEmail,
  getTemplate,
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

// ── Render del texto editable a HTML ──────────────────────────────────────────
// Formato editable (amigable, sin HTML crudo):
//   · Cada línea = un párrafo.
//   · {nombre} y {iglesia} se reemplazan por los datos del lead.
//   · **texto** = negrita.
//   · Una línea "[OFERTA]" o "[OFERTA:Texto del botón]" = botón a la oferta.
//   · Una línea "[ZOOM]"  o "[ZOOM:Texto del botón]"  = botón a la agenda de Zoom.
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function sub(s: string, l: LeadRow) {
  return s.replace(/\{nombre\}/g, first(l)).replace(/\{iglesia\}/g, iglesia(l));
}
function inline(s: string, l: LeadRow) {
  return esc(sub(s, l)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}

const pStyle = "color:#445;font-size:15px;line-height:1.6;margin:0 0 14px";
function button(text: string, url: string, color = "#FF5001") {
  return `<div style="text-align:center;margin:20px 0">
    <a href="${url}" style="display:inline-block;background:${color};color:#ffffff;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:12px;font-size:16px">${text}</a>
  </div>`;
}

function renderBodyHtml(text: string, l: LeadRow) {
  const lines = text.split("\n").map((x) => x.trim()).filter(Boolean);
  const parts = lines.map((line) => {
    const off = line.match(/^\[OFERTA(?::\s*(.*?))?\]$/i);
    if (off) return button(esc(sub(off[1] || "Inscribirme por $97 →", l)), offerUrl(l));
    const zoom = line.match(/^\[ZOOM(?::\s*(.*?))?\]$/i);
    if (zoom) return button(esc(sub(zoom[1] || "Agendar mi llamada por Zoom", l)), ZOOM_URL, "#6A3DE8");
    return `<p style="${pStyle}">${inline(line, l)}</p>`;
  });
  return shell(parts.join(""));
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

// ── Secuencia (textos por defecto, editables desde el admin) ───────────────────
// afterHours = horas de espera respecto al correo anterior.
type Step = { afterHours: number; subject: string; body: string };

export const SEQUENCE: Step[] = [
  // 1 · Inmediato
  {
    afterHours: 0,
    subject: "{nombre}, tu diagnóstico y el siguiente paso 📊",
    body: `Hola {nombre},
Gracias por tomarte el tiempo de hacer el diagnóstico digital de **{iglesia}**. Ese solo paso ya te pone por delante de la mayoría de las iglesias, porque decidiste mirar de frente una pregunta incómoda: "¿está mi iglesia realmente presente donde hoy vive la gente?".
Tu resultado te mostró en qué nivel estás y dónde están tus mayores oportunidades. Pero un diagnóstico, por sí solo, no transforma nada. Lo que transforma es un **plan claro y alguien que te acompañe a ejecutarlo**.
Para eso existe el **Programa Iglesia Digital**: 16 semanas llevándote de la mano, con **sesiones en vivo por Zoom cada 15 días** donde resolvemos tus dudas y revisamos tu avance. No es un curso que compras y abandonas: es acompañamiento real hasta ver resultados.
Y algo que quiero que sepas desde hoy: dentro del programa te enseñamos a activar el **Google Ad Grant**, un beneficio de **$10,000 USD mensuales en publicidad gratuita** que Google le da a las iglesias.
Por nuestro **aniversario**, puedes entrar hoy por **$97 USD** en lugar de $497. Pero es por muy poco tiempo.
[OFERTA:Inscribirme por $97 →]
Si te queda alguna duda, responde este correo. Lo leo yo.`,
  },
  // 2 · +1 día · storytelling
  {
    afterHours: 24,
    subject: "La historia que veo repetirse en cada iglesia 🙏",
    body: `Hola {nombre},
Déjame contarte algo que veo una y otra vez.
Un pastor con un corazón enorme. Una iglesia que ama a su gente, que predica con fuego los domingos… pero que de lunes a sábado prácticamente **desaparece del mundo digital**. Mientras tanto, su ciudad entera vive con el teléfono en la mano: buscando esperanza, respuestas, una comunidad.
Ese pastor lo sabe. Lo siente. Intenta algo: abre una página, sube unos videos… y luego la vida de la iglesia lo absorbe todo. Sin un plan y sin acompañamiento, el esfuerzo se apaga. Y vuelve esa sensación de "sé que deberíamos hacer más, pero no sé por dónde".
Si algo de esto te resuena, quiero que sepas dos cosas: **no es tu culpa** —nadie te enseñó esto— y **tiene solución**.
El Programa Iglesia Digital nació justo para romper ese ciclo. Cada 15 días nos vemos en vivo por Zoom para que avances de verdad, con pasos concretos y herramientas listas para usar.
Antes de decidir, me encantaría conocerte y escuchar el caso de **{iglesia}** en una llamada corta por Zoom, sin compromiso. En 15 minutos te digo con honestidad si esto es para tu iglesia o no.
[ZOOM:Agendar mi llamada por Zoom]
Y si ya quieres avanzar, aquí entras con el precio de aniversario ($97):
[OFERTA:Inscribirme por $97 →]`,
  },
  // 3 · +2 días · valor / temario
  {
    afterHours: 24,
    subject: "Lo que {iglesia} hará en las próximas 16 semanas",
    body: `Hola {nombre},
Quiero que veas exactamente lo que vivirás dentro del **Programa Iglesia Digital**. No es teoría: es un camino de 4 meses, semana a semana, con plantillas, checklists y acompañamiento en vivo.
**Mes 1 — Fundamentos y estructura.** Armas tu equipo digital (con documentos editables para definir roles), diagnosticas el estado real de tu iglesia y preparas la documentación para el Google Ad Grant.
**Mes 2 — Construcción digital.** Levantas tu sitio web efectivo, configuras la Church Online Platform, ordenas tu streaming y equipo técnico, y haces un simulacro de servicio en vivo.
**Mes 3 — Tráfico y publicidad.** Aquí activas el **Google Ad Grant: $10,000 USD al mes en anuncios gratis**, usas la herramienta de IA SmartReach Ads y construyes tu embudo para acompañar decisiones espirituales. Este mes, por sí solo, vale muchas veces la inversión.
**Mes 4 — Lanzamiento y seguimiento.** Planeas y ejecutas tu semana de impacto, organizas los grupos de afirmación para el seguimiento espiritual, y cierras con tu **certificado de culminación**.
Todo esto, con **sesiones en vivo por Zoom cada 15 días** para que nunca te quedes atorado. Por el aniversario: **$97 USD** en lugar de $497.
[OFERTA:Quiero inscribirme →]
¿Prefieres que lo veamos juntos primero? Responde este correo o agenda una llamada por Zoom.`,
  },
  // 4 · +3 días · Google Grant + Zoom
  {
    afterHours: 24,
    subject: "$10,000 USD al mes en publicidad… gratis para tu iglesia",
    body: `Hola {nombre},
Sé que suena demasiado bueno para ser verdad, así que voy directo: Google tiene un programa (el **Google Ad Grant**) que le regala a las organizaciones sin fines de lucro —**incluidas las iglesias**— hasta **$10,000 USD mensuales** para anunciarse en su buscador.
Piensa en lo que eso significa para **{iglesia}**: cuando alguien en tu ciudad busque "iglesia cerca de mí", "necesito oración" o "ayuda para mi familia", tu iglesia puede aparecer ahí, día y noche, sin pagar un peso.
El problema es que configurarlo bien es complicado, y muchas iglesias lo intentan, cometen errores y pierden el beneficio. Por eso, dentro del programa te llevamos **paso a paso** para obtenerlo y aprovecharlo (incluso con nuestra herramienta de IA, SmartReach Ads).
Solo este módulo puede transformar el alcance de tu iglesia para siempre. Y está incluido en los $97 del precio de aniversario.
[ZOOM:Agendar mi llamada por Zoom]
[OFERTA:Inscribirme por $97 →]`,
  },
  // 5 · +5 días · urgencia + futuro
  {
    afterHours: 48,
    subject: "⏳ Imagina {iglesia} dentro de 4 meses",
    body: `Hola {nombre},
Cierra los ojos un segundo e imagina que estamos a cuatro meses de hoy.
**{iglesia}** ya tiene un sitio web que sí funciona. Tus transmisiones se ven y se escuchan con excelencia. Tienes un equipo digital organizado que sabe qué hacer cada semana. Y en Google, cuando alguien en tu ciudad busca esperanza, **aparece tu iglesia** —gracias a los $10,000 USD mensuales del Ad Grant que ya activaste.
Nuevas familias llegando. Personas tomando decisiones. Un ministerio que por fin alcanza a quienes nunca habrían cruzado la puerta por sí solos.
Eso no es un sueño lejano: es el resultado del camino que recorres en el Programa Iglesia Digital. Pero empieza con una decisión hoy.
Y te escribo porque **la oferta de aniversario ($97 en vez de $497) está por cerrar**. No quiero que tu iglesia se quede afuera.
[OFERTA:Asegurar mi lugar por $97 →]
Si algo te detiene, respóndeme. Lo resolvemos juntos.`,
  },
  // 6 · +7 días · última llamada
  {
    afterHours: 48,
    subject: "{nombre}, se cierra hoy",
    body: `Hola {nombre},
Hoy es el último día para entrar al **Programa Iglesia Digital** con el precio de aniversario de **$97 USD**. Mañana vuelve a $497.
Hiciste el diagnóstico por una razón: en tu corazón hay un deseo de que **{iglesia}** crezca y alcance a más personas. Este es el acompañamiento para lograrlo —16 semanas, Zoom en vivo cada 15 días, el Google Ad Grant y tu certificación al final.
No dejes que el precio de aniversario se te vaya.
[OFERTA:Entrar ahora por $97 →]
¿Última duda antes de decidir? Agenda una llamada por Zoom y la vemos.
[ZOOM:Agendar mi llamada por Zoom]`,
  },
];

// Devuelve el texto del paso: el editado (si existe) o el de por defecto.
function templateFor(step: number): { subject: string; body: string } {
  const override = getTemplate(step);
  if (override) return override;
  const d = SEQUENCE[step];
  return { subject: d.subject, body: d.body };
}

export function afterHoursFor(step: number): number {
  return SEQUENCE[step]?.afterHours ?? 24;
}

// ── Vistas previas para el admin ──────────────────────────────────────────────
const SAMPLE = {
  name: "Pastor Juan Pérez",
  church: "Iglesia Vida Nueva",
  email: "pastor@iglesiaejemplo.com",
} as LeadRow;

function whenLabel(cumHours: number): string {
  if (cumHours <= 0) return "Al momento (~2 h después del quiz)";
  return `Día ${Math.round(cumHours / 24)}`;
}

// Cada correo con su texto editable + la vista previa renderizada.
export function previewSteps(): {
  n: number;
  whenLabel: string;
  subjectRaw: string;
  bodyRaw: string;
  subjectPreview: string;
  html: string;
  edited: boolean;
}[] {
  let cum = 0;
  return SEQUENCE.map((s, i) => {
    cum += s.afterHours;
    const tpl = templateFor(i);
    return {
      n: i + 1,
      whenLabel: whenLabel(cum),
      subjectRaw: tpl.subject,
      bodyRaw: tpl.body,
      subjectPreview: sub(tpl.subject, SAMPLE),
      html: renderBodyHtml(tpl.body, SAMPLE),
      edited: Boolean(getTemplate(i)),
    };
  });
}

// ── Procesador ────────────────────────────────────────────────────────────────
export async function processSequence(): Promise<{ sent: number; errors: number }> {
  const now = new Date();
  const due = dueSequenceLeads(now.toISOString());
  if (due.length === 0) return { sent: 0, errors: 0 };

  if (!mailerReady()) {
    console.error("[sequence] Resend no configurado (falta RESEND_API_KEY).");
    return { sent: 0, errors: 0 };
  }

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
      const tpl = templateFor(i);
      const subject = sub(tpl.subject, lead);
      await sendEmail({ to: lead.email, subject, html: renderBodyHtml(tpl.body, lead) });
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
      setSequence(lead.id, {
        next_at: new Date(now.getTime() + 3600_000).toISOString(),
      });
      errors++;
    }
  }
  return { sent, errors };
}
