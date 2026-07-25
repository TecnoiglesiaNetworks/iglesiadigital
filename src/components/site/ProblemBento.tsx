import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";

const cards = [
  ["🪑", "Sillas vacías", "Cada domingo hay lugares que podrían estar ocupados por personas que aún no te conocen."],
  ["🔍", "No te encuentran", "Cada persona que busca una iglesia y no encuentra la tuya, termina en otra parte."],
  ["👻", "Invisible en línea", "Sin presencia digital, tu iglesia no existe para quien busca respuestas desde su teléfono."],
  ["📉", "Oportunidades perdidas", "Cada oportunidad desaprovechada es una voz menos que escucha el mensaje del Evangelio."],
];

export function ProblemBento() {
  return (
    <section id="problema" className="py-24">
      <div className="container">
        <SectionHead
          eyebrow="El mundo cambió, ¿y tu iglesia?"
          title="¿Te has preguntado qué estás perdiendo cada domingo?"
          sub="Durante años las iglesias confiaron en eventos, invitaciones físicas y campañas impresas. Pero hoy las decisiones se toman desde el celular, y quien no te encuentra ahí, encuentra otra cosa."
        />
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([ic, t, d], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="group h-full rounded-2xl border border-line bg-panel p-[26px] transition-all duration-300 hover:-translate-y-1 hover:border-line2 hover:bg-panel2">
                <div className="mb-[18px] grid h-[46px] w-[46px] place-items-center rounded-xl border border-brand/30 bg-brand/[0.14] text-[22px]">
                  {ic}
                </div>
                <h3 className="mb-2 font-display text-[19px] font-bold">{t}</h3>
                <p className="text-[15px] text-muted">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
