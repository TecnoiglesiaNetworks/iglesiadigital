"use client";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

/* Para poner la foto: sube el archivo a /public/founder/pedro-abiu.jpg
   Mientras no exista, se muestran las iniciales automáticamente. */
const PHOTO = "/founder/pedro-abiu.jpg";

function FounderPhoto() {
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth === 0) setErr(true);
  }, []);
  if (!err) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        ref={ref}
        src={PHOTO}
        alt="Pedro Abiú"
        onError={() => setErr(true)}
        className="mx-auto h-[150px] w-[150px] flex-none rounded-full border border-line2 object-cover sm:mx-0"
      />
    );
  }
  return (
    <div className="mx-auto grid h-[150px] w-[150px] flex-none place-items-center rounded-full border border-line2 bg-gradient-to-br from-brand to-brand2 font-display text-[44px] font-bold text-white sm:mx-0">
      PA
    </div>
  );
}

export function Founder() {
  return (
    <section className="py-24">
      <div className="container">
        <Reveal className="mx-auto max-w-[920px]">
          <div className="rounded-[26px] border border-line2 bg-gradient-to-b from-panel to-bg2 p-8 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] sm:p-11">
            <div className="grid items-center gap-8 text-center sm:grid-cols-[auto_1fr] sm:text-left">
              <FounderPhoto />
              <div>
                <span className="mb-3 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent before:h-px before:w-5 before:bg-accent before:opacity-70 before:content-['']">
                  Quién está detrás
                </span>
                <h2 className="font-display text-[clamp(26px,3.6vw,34px)] font-bold leading-tight">Pedro Abiú</h2>
                <p className="mt-1 font-display text-[16px] font-semibold text-brand2">
                  Fundador de Tecnoiglesia y del programa Iglesia Digital
                </p>
                <p className="mt-4 text-[16.5px] text-muted">
                  Durante más de 16 años hemos ayudado a miles de iglesias a usar la tecnología con
                  propósito para llegar a más personas. Iglesia Digital es el mismo sistema que hoy
                  funciona en Latinoamérica, Estados Unidos y Europa, puesto en tus manos paso a paso.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
