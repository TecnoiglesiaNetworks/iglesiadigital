import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import { AuroraBackground } from "@/components/ui/animated-background";

const pillars = [
  ["01", "Presencia", "Un sitio web y tu iglesia visible en Google y redes, para que te encuentren justo cuando alguien busca oración, paz o una comunidad."],
  ["02", "Mensaje", "Tu servicio del domingo y tu contenido llevando el Evangelio en línea durante toda la semana, no solo en el momento en vivo."],
  ["03", "Conexión", "Formularios, contacto y seguimiento que acompañan a cada persona desde el primer clic hasta que llega a tu iglesia."],
  ["04", "Resultado", "Personas nuevas, acompañadas y creciendo en la fe. Fruto que permanece, no solo vistas y likes."],
];

export function Pillars() {
  return (
    <section className="relative">
      <AuroraBackground className="border-y border-line py-24">
      <div className="container">
        <SectionHead
          eyebrow="El método Iglesia Digital"
          title="Cuatro pasos simples: de que te encuentren a que se queden"
          sub="No necesitas ser experto en tecnología. Sigues un camino claro que convierte tu presencia en línea en personas reales, acompañadas y creciendo en la fe."
        />
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
      </AuroraBackground>
    </section>
  );
}
