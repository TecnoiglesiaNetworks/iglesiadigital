import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { AuroraBackground } from "@/components/ui/animated-background";

export function FinalCta() {
  return (
    <section className="relative">
      <AuroraBackground className="border-y border-line py-28 text-center">
        <Reveal className="container mx-auto max-w-[720px]">
          <h2 className="font-display text-[clamp(32px,5.6vw,58px)] font-extrabold leading-[1.08] tracking-tight">
            El campo misionero más grande de tu generación{" "}
            <span className="bg-gradient-to-r from-brand2 to-accent bg-clip-text text-transparent">
              está en internet.
            </span>
          </h2>
          <p className="mx-auto my-6 max-w-[540px] text-[19px] text-muted">
            Miles ya buscan esperanza en línea hoy mismo. Empieza con tu diagnóstico gratuito y
            descubre el primer paso para que tu iglesia los alcance.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Button href="/diagnostico" variant="accent" size="lg">
              Haz tu diagnóstico gratis <span>→</span>
            </Button>
            <Button href="/temario" variant="ghost" size="lg">
              Ver el temario
            </Button>
          </div>
        </Reveal>
      </AuroraBackground>
    </section>
  );
}
