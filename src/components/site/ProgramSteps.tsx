import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";

const steps = [
  ["MES 1–2", "Fundamentos y construcción", "Arma tu equipo, diagnostica tu iglesia y levanta tu sitio web y tu servicio en línea."],
  ["MES 3", "Tráfico y embudo", "Activa el Google Grant, tu embudo de conversión espiritual y tu contenido en redes."],
  ["MES 4", "Lanzamiento y seguimiento", "Ejecuta tu semana de impacto, da seguimiento a los nuevos y mide tus resultados."],
];

export function ProgramSteps() {
  return (
    <section id="programa" className="py-24">
      <div className="container">
        <SectionHead
          eyebrow="El programa Iglesia Digital"
          title="Una formación de 16 semanas, paso a paso"
          sub="No necesitas ser experto en tecnología. Si sabes prender un celular, puedes comenzar. Te llevamos de la mano con instrucciones claras, ejemplos prácticos y acompañamiento semanal en vivo."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map(([k, t, d], i) => (
            <Reveal key={k} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-line bg-panel p-[30px]">
                <div className="font-display text-[15px] font-extrabold tracking-[0.1em] text-accent">{k}</div>
                <h3 className="my-3.5 font-display text-[20px] font-bold">{t}</h3>
                <p className="text-[15px] text-muted">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Button href="/temario" variant="ghost" size="lg">
            Ver el temario completo <span>→</span>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
