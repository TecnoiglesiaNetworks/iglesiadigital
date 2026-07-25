import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";

const yes = [
  "Eres pastor, líder o voluntario y quieres ayudar a crecer tu iglesia.",
  "Estás dispuesto a aprender y a liderar, aunque no seas experto en tecnología.",
  "Quieres un sistema probado, no seguir improvisando en redes.",
  "Buscas alcanzar personas dentro y fuera de tu ciudad.",
];
const no = [
  "Buscas resultados mágicos sin dedicar tiempo cada semana.",
  "No estás dispuesto a formar un pequeño equipo digital.",
  "Crees que la tecnología reemplaza la misión, en vez de servirla.",
  "No te interesa dar seguimiento real a las personas nuevas.",
];

export function ForWhom() {
  return (
    <section className="py-24">
      <div className="container">
        <SectionHead eyebrow="¿Es para ti?" title="Diseñado para quienes quieren ver fruto verdadero" />
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-line bg-panel p-[30px]">
              <h3 className="mb-[18px] font-display text-[20px] font-bold">✓ Es para ti si…</h3>
              <ul className="flex flex-col gap-3.5">
                {yes.map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] text-muted">
                    <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-good/[0.16] text-[13px] font-bold text-good">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h-full rounded-2xl border border-line bg-panel p-[30px]">
              <h3 className="mb-[18px] font-display text-[20px] font-bold">✕ No es para ti si…</h3>
              <ul className="flex flex-col gap-3.5">
                {no.map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] text-muted">
                    <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-white/[0.06] text-[13px] font-bold text-muted">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
