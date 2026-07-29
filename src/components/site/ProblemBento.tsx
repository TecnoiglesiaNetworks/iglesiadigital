import { Radio, Camera, Compass, TrendingDown } from "lucide-react";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";

const cards = [
  [Radio, "Transmites, pero llegan los mismos", "Cada domingo sales en vivo… y siempre te ven las mismas personas. Sin difusión, el mensaje no sale de tu círculo."],
  [Camera, "Invertiste en equipo, no en fruto", "Cámaras, luces y micrófonos de sobra. Pero ese equipo no convierte las visitas en personas acompañadas."],
  [Compass, "Publicas sin un rumbo", "Subes contenido cuando se puede, sin un plan que lleve a la persona del primer clic hasta tu iglesia."],
  [TrendingDown, "Sin seguimiento, se evapora", "Alguien se conecta, ora, se interesa… y nadie le da seguimiento. Ese fruto se pierde."],
] as const;

export function ProblemBento() {
  return (
    <section id="problema" className="py-24">
      <div className="container">
        <SectionHead
          eyebrow="El esfuerzo está, falta la estrategia"
          title="Tu iglesia ya lo intenta. ¿Por qué no llega el fruto?"
          sub="Publicas, transmites, inviertes en cámaras y pruebas cosas nuevas. La intención es buena, pero sin una estrategia clara los resultados se diluyen. Falta el sistema que convierta todo ese esfuerzo en personas que llegan, se quedan y crecen."
        />
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="group h-full rounded-2xl border border-line bg-panel p-[26px] transition-all duration-300 hover:-translate-y-1 hover:border-line2 hover:bg-panel2">
                <div className="mb-[18px] grid h-[46px] w-[46px] place-items-center rounded-xl border border-brand/30 bg-brand/[0.14] text-brand2">
                  <Icon size={22} strokeWidth={2} />
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
