import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

const trust = [
  ["+65,000", "iglesias acompañadas"],
  ["+20", "años de experiencia"],
  ["16", "semanas paso a paso"],
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-[150px] text-center">
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-crowd.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/85 to-bg" />
        <div className="hero-grid absolute inset-0 opacity-35" />
        <div className="animate-float1 absolute -top-36 left-1/2 h-[520px] w-[520px] -translate-x-[60%] rounded-full bg-brand opacity-50 blur-[90px]" />
        <div className="animate-float2 absolute -right-20 top-16 h-[420px] w-[420px] rounded-full bg-accent opacity-30 blur-[90px]" />
      </div>
      <div className="container relative z-10 mx-auto max-w-[860px]">
        <Reveal>
          <span className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line2 bg-white/[0.05] py-[7px] pl-2 pr-[15px] text-[13.5px] text-muted">
            <b className="rounded-full bg-accent px-[9px] py-[3px] text-[11px] font-bold text-[#ffffff]">NUEVO</b>
            Diagnóstico digital de tu iglesia en 3 minutos
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="font-display text-[clamp(36px,6.6vw,68px)] font-extrabold leading-[1.08] tracking-tight">
            Multiplica el alcance de tu iglesia{" "}
            <span className="bg-gradient-to-r from-brand2 to-accent bg-clip-text text-transparent">
              en el mundo digital
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-[620px] text-[clamp(17px,2.4vw,21px)] text-muted">
            La misión sigue siendo la misma. Solo cambió el canal. Te damos el sistema, el
            acompañamiento y las herramientas para que tu iglesia crezca dentro y fuera del templo.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <Button href="#diagnostico" variant="accent" size="lg">
              Haz tu diagnóstico gratis <span>→</span>
            </Button>
            <Button href="#programa" variant="ghost" size="lg">
              Conocer el programa
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.32}>
          <div className="mt-12 flex flex-wrap justify-center gap-x-9 gap-y-3.5 text-[14px] text-muted">
            {trust.map(([n, l]) => (
              <span key={l} className="inline-flex items-center gap-2.5">
                <i className="h-1.5 w-1.5 rounded-full bg-good" />
                <b className="font-display font-bold text-ink">{n}</b> {l}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
