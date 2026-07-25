import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28 text-center">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-10 left-1/2 h-[340px] w-[600px] -translate-x-1/2 rounded-full bg-brand opacity-30 blur-[90px]" />
      </div>
      <Reveal className="container relative z-10 mx-auto max-w-[720px]">
        <h2 className="font-display text-[clamp(32px,5.6vw,58px)] font-extrabold leading-[1.08] tracking-tight">
          La misión sigue igual.
          <br />
          Solo cambió el canal.
        </h2>
        <p className="mx-auto my-6 max-w-[520px] text-[19px] text-muted">
          Empieza con un diagnóstico gratuito y descubre exactamente por dónde hacer crecer tu
          iglesia en digital.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Button href="#diagnostico" variant="accent" size="lg">
            Haz tu diagnóstico gratis <span>→</span>
          </Button>
          <Button href="/temario" variant="ghost" size="lg">
            Ver el temario
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
