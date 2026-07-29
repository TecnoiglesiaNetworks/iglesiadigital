"use client";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";

/* Para poner las fotos: sube los archivos a /public/testimonials/ con estos
   nombres. Mientras no existan, se muestran las iniciales automáticamente. */
const items = [
  {
    quote:
      "Pasamos de no aparecer en Google a llenar sillas con visitantes que nos encontraron en línea. El acompañamiento semanal hizo toda la diferencia.",
    initials: "JD",
    name: "Pastor Jeff Duncan",
    photo: "/testimonials/jeff-duncan.jpg",
  },
  {
    quote:
      "Activamos el Google Grant y hoy tenemos publicidad todos los meses sin gastar un peso. Nunca imaginé que fuera posible para nuestra iglesia.",
    initials: "SM",
    name: "Pastor Santiago Moya",
    photo: "/testimonials/santiago-moya.jpg",
  },
  {
    quote:
      "Por fin tenemos un sistema y no improvisación. Nuestro equipo sabe qué hacer cada semana y las personas nuevas reciben seguimiento de verdad.",
    initials: "XT",
    name: "Pastor Xavier Tamayo",
    photo: "/testimonials/xavier-tamayo.jpg",
  },
];

function Avatar({ photo, initials, name }: { photo?: string; initials: string; name: string }) {
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // Si la imagen ya falló antes de que React conectara onError (404 en SSR), lo detectamos al montar.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth === 0) setErr(true);
  }, []);
  if (photo && !err) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        ref={ref}
        src={photo}
        alt={name}
        onError={() => setErr(true)}
        className="h-[42px] w-[42px] flex-none rounded-full object-cover"
      />
    );
  }
  return (
    <div className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full bg-gradient-to-br from-brand to-brand2 font-display font-bold text-white">
      {initials}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container">
        <SectionHead eyebrow="Resultados reales, no solo likes" title="Iglesias que ya están creciendo en digital" />
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-line bg-panel p-[26px]">
                <div className="mb-3.5 flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={16} className="fill-accent" strokeWidth={0} />
                  ))}
                </div>
                <p className="mb-5 text-[15.5px]">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <Avatar photo={t.photo} initials={t.initials} name={t.name} />
                  <b className="block text-[14.5px]">{t.name}</b>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
