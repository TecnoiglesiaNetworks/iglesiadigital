"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHead } from "./SectionHead";
import { cn } from "@/lib/utils";

const faqs = [
  ["¿Necesito saber de tecnología para el programa?", "No. Está diseñado para pastores, líderes y voluntarios sin experiencia técnica. Si sabes usar un celular, puedes empezar. Te llevamos de la mano con pasos claros y acompañamiento cada semana."],
  ["¿Cuánto tiempo debo dedicarle a la semana?", "Con unas pocas horas por semana avanzas al ritmo del programa. El contenido queda grabado, así que lo ves cuando puedas, y cada semana hay una sesión en vivo para resolver dudas."],
  ["¿Es verdad lo del Google Ad Grant de $10,000 al mes?", "Sí. Google entrega ese beneficio en publicidad a organizaciones sin fines de lucro que califican, incluidas iglesias. Dentro del programa te guiamos en el registro y la activación paso a paso."],
  ["¿Sirve si mi iglesia es pequeña?", "Especialmente. Las iglesias pequeñas son las que más ganan al volverse visibles en línea, porque compiten en igualdad de condiciones por la atención de quien busca una comunidad."],
  ["¿Y si no me funciona?", "Tienes una garantía de 7 días. Si entras y sientes que no es para ti, te devolvemos el 100% de tu inversión, sin preguntas."],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24">
      <div className="container">
        <SectionHead eyebrow="Dudas frecuentes" title="Antes de dar el paso" />
        <div className="mx-auto max-w-[760px]">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="border-b border-line">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-[22px] text-left font-sans text-[17px] font-semibold"
                >
                  {q}
                  <span className="relative h-[22px] w-[22px] flex-none">
                    <span className="absolute left-1/2 top-1/2 h-0.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded bg-accent" />
                    <span className={cn("absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded bg-accent transition-transform duration-300", isOpen && "scale-y-0")} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-[22px] text-[15.5px] text-muted">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
