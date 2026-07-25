import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";

const includes = [
  "16 semanas guiadas con acompañamiento semanal en vivo por Zoom",
  "Acceso 24/7 a la plataforma con videos, plantillas y checklists",
  "Activación del Google Ad Grant ($10,000 USD/mes)",
  "Embudo de conversión espiritual y tu servicio en línea funcionando",
  "Herramientas de IA: ID Coach y asistente para Google Ads",
  "Certificado de culminación del programa",
];

export function Pricing() {
  return (
    <section className="py-24">
      <div className="container">
        <SectionHead
          eyebrow="El programa"
          title="Todo lo que te llevas en 16 semanas"
          sub="Una formación completa, paso a paso, con acompañamiento real. Lo que una agencia haría por partes, aquí lo implementas tú con guía y un sistema probado."
        />
        <Reveal className="mx-auto max-w-[640px]">
          <div className="rounded-[24px] border border-line2 bg-gradient-to-b from-panel2 to-bg2 p-8 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] sm:p-11">
            <ul className="mb-8 grid gap-3 text-left">
              {includes.map((t) => (
                <li key={t} className="flex gap-3 text-[15.5px] before:font-bold before:text-accent before:content-['✓']">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mb-7 flex justify-center border-t border-line pt-7">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/badges.png"
                alt="Certificaciones y reconocimientos"
                className="h-auto w-full max-w-[420px] object-contain"
              />
            </div>
            <Button href="#diagnostico" variant="accent" size="lg" className="w-full">
              Empieza con tu diagnóstico gratis <span>→</span>
            </Button>
            <div className="mt-4 text-center text-[13.5px] text-muted">
              En tu asesoría gratuita te explicamos los detalles del programa y resolvemos tus dudas. Garantía de 7 días.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
