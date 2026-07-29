import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Platforms } from "@/components/site/Platforms";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { TemarioTimeline } from "@/components/temario/TemarioTimeline";

export const metadata: Metadata = {
  title: "Temario del Programa",
  description:
    "Temario de Iglesia Digital: 16 semanas paso a paso para hacer crecer tu iglesia en internet. Fundamentos, sitio web y servicio en línea, tráfico y Google Ad Grant, embudo espiritual, lanzamiento y seguimiento. Modalidad híbrida con acompañamiento en vivo por Zoom.",
  alternates: { canonical: "/temario" },
  openGraph: {
    type: "article",
    url: "/temario",
    title: "Temario del Programa · Iglesia Digital",
    description:
      "16 semanas paso a paso para hacer crecer tu iglesia en internet y redes: sitio web, Google Ad Grant, embudo espiritual y seguimiento.",
  },
};

const meta = [
  ["Duración", "4 meses · 16 semanas"],
  ["Modalidad", "Híbrida: grabado + Zoom en vivo"],
  ["Plataforma", "Acceso 24/7 (LMS)"],
];


export default function Temario() {
  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pb-16 pt-[150px] text-center">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="hero-grid absolute inset-0 opacity-30" />
          <div className="animate-float1 absolute -top-36 left-1/2 h-[460px] w-[460px] -translate-x-[60%] rounded-full bg-brand opacity-40 blur-[90px]" />
          <div className="animate-float2 absolute -right-16 top-10 h-[360px] w-[360px] rounded-full bg-accent opacity-25 blur-[90px]" />
        </div>
        <div className="container relative z-10 mx-auto max-w-[820px]">
          <Reveal>
            <span className="mb-5 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent before:h-px before:w-5 before:bg-accent before:content-['']">
              El programa · Paso a paso
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="font-display text-[clamp(34px,6vw,60px)] font-extrabold leading-[1.06] tracking-tight">
              Temario del Programa
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-[560px] text-[18px] text-muted">
              Una formación de 16 semanas que lleva a tu iglesia de la idea a un sistema digital
              funcionando, con acompañamiento en vivo en cada paso.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mx-auto mt-9 flex max-w-[720px] flex-wrap justify-center gap-3">
              {meta.map(([k, v]) => (
                <div key={k} className="rounded-xl border border-line bg-panel px-5 py-3 text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">{k}</div>
                  <div className="mt-1 font-display text-[15px] font-bold">{v}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap justify-center gap-3.5">
              <Button href="/diagnostico" variant="accent" size="lg">
                Me interesa el programa <span>→</span>
              </Button>
              <Button href="/" variant="ghost" size="lg">
                Volver al inicio
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <TemarioTimeline />

      {/* CTA FINAL */}
      <section id="temario-end" className="relative overflow-hidden py-24 text-center">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-10 left-1/2 h-[300px] w-[560px] -translate-x-1/2 rounded-full bg-brand opacity-25 blur-[90px]" />
        </div>
        <Reveal className="container relative z-10 mx-auto max-w-[640px]">
          <h2 className="font-display text-[clamp(28px,5vw,48px)] font-extrabold leading-[1.1] tracking-tight">
            ¿Listo para transformar tu iglesia?
          </h2>
          <p className="mx-auto my-5 max-w-[480px] text-[18px] text-muted">
            Empieza con un diagnóstico gratuito y descubre por dónde comenzar tu camino en las 16 semanas.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Button href="/diagnostico" variant="accent" size="lg">
              Haz tu diagnóstico gratis <span>→</span>
            </Button>
            <Button href="/" variant="ghost" size="lg">
              Conocer el programa
            </Button>
          </div>
        </Reveal>
      </section>

      <Platforms />
      <Footer />
    </main>
  );
}
