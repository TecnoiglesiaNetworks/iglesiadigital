import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function GrantHighlight() {
  return (
    <section id="grant" className="py-24">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-[26px] border border-accent/30 bg-gradient-to-br from-accent/[0.13] to-brand/[0.10] p-8 sm:p-[52px]">
            <div className="absolute -right-16 -top-16 h-[280px] w-[280px] rounded-full bg-accent opacity-20 blur-[90px]" />
            <div className="relative z-10 grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
              <div>
                <span className="mb-5 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent before:h-px before:w-5 before:bg-accent before:content-['']">
                  La palanca que casi nadie usa
                </span>
                <h2 className="font-display text-[clamp(28px,4vw,42px)] font-bold leading-[1.1] tracking-tight">
                  Google le regala hasta <span className="text-accent">$10,000 USD al mes</span> en
                  publicidad a tu iglesia
                </h2>
                <p className="my-4 text-[16.5px] text-ink/90">
                  Si tu iglesia está registrada como organización sin fines de lucro, calificas para
                  el Google Ad Grant: publicidad gratuita, cada mes, para aparecer frente a quien
                  busca fe, esperanza y una comunidad. Dentro del programa te llevamos paso a paso a
                  activarlo.
                </p>
                <Button href="/diagnostico" variant="accent">
                  Ver si mi iglesia califica <span>→</span>
                </Button>
              </div>
              <div className="text-center">
                <div className="font-display text-[clamp(44px,8vw,84px)] font-extrabold leading-none tracking-tight text-accent">
                  $10K<small className="text-[22px] font-semibold text-muted">/mes</small>
                </div>
                <p className="mt-2.5 text-muted">en publicidad, sin costo para tu iglesia</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
