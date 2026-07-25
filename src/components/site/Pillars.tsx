import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";

const pillars = [
  ["01", "Un sitio web con propósito", "Diseñado para recibir y guiar a cada nuevo visitante, no solo para verse bonito."],
  ["02", "Un equipo digital capacitado", "Voluntarios que saben transmitir, comunicar y dar seguimiento con roles claros."],
  ["03", "Una estrategia clara", "Para atraer, conectar y discipular a personas en línea con intención, no al azar."],
  ["04", "Un sistema que trabaja 24/7", "Que sigue evangelizando y dando seguimiento incluso cuando el templo está cerrado."],
];

export function Pillars() {
  return (
    <section className="py-24">
      <div className="container">
        <SectionHead eyebrow="Imagina tu iglesia equipada" title="Todo lo que necesitas, trabajando como un solo sistema" />
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          {pillars.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 0.08}>
              <div className="flex h-full gap-[18px] rounded-2xl border border-line bg-panel p-[26px] transition-all duration-300 hover:-translate-y-1 hover:border-line2">
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 font-display text-[18px] font-bold text-white">
                  {n}
                </div>
                <div>
                  <h3 className="mb-1.5 font-display text-[18px] font-bold">{t}</h3>
                  <p className="text-[15px] text-muted">{d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
