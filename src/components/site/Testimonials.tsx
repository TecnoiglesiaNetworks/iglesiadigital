import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";

/* TODO: reemplaza por testimonios reales (foto, nombre, iglesia, ciudad). */
const items = [
  {
    quote:
      "Pasamos de no aparecer en Google a llenar sillas con visitantes que nos encontraron en línea. El acompañamiento semanal hizo toda la diferencia.",
    initials: "MR",
    name: "Pastor Miguel R.",
    place: "Iglesia Renovación · Guadalajara",
  },
  {
    quote:
      "Activamos el Google Grant y hoy tenemos publicidad todos los meses sin gastar un peso. Nunca imaginé que fuera posible para nuestra iglesia.",
    initials: "LC",
    name: "Lucía C.",
    place: "Equipo de medios · Bogotá",
  },
  {
    quote:
      "Por fin tenemos un sistema y no improvisación. Nuestro equipo sabe qué hacer cada semana y las personas nuevas reciben seguimiento de verdad.",
    initials: "JT",
    name: "Pastor José T.",
    place: "Comunidad de Fe · Monterrey",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container">
        <SectionHead eyebrow="Resultados reales, no solo likes" title="Iglesias que ya están creciendo en digital" />
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-line bg-panel p-[26px]">
                <div className="mb-3.5 tracking-[2px] text-[14px] text-accent">★★★★★</div>
                <p className="mb-5 text-[15.5px]">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="grid h-[42px] w-[42px] place-items-center rounded-full bg-gradient-to-br from-brand to-brand2 font-display font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <b className="block text-[14.5px]">{t.name}</b>
                    <span className="text-[13px] text-muted">{t.place}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
