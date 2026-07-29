import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";

const VIDEO_SRC =
  "https://iframe.mediadelivery.net/embed/461012/d2bce1da-a413-4d3d-b60a-8d1799cadf11?autoplay=false&loop=false&muted=false&preload=true&responsive=true";

export function VideoSection() {
  return (
    <section id="video" className="py-24">
      <div className="container">
        <Reveal className="mx-auto mb-10 max-w-[680px] text-center">
          <h2 className="font-display text-[clamp(26px,4vw,42px)] font-bold leading-[1.1] tracking-tight">
            Tu mensaje del domingo puede seguir{" "}
            <span className="text-brand2">alcanzando vidas toda la semana.</span>
          </h2>
        </Reveal>

        <Reveal className="relative mx-auto max-w-[900px]">
          <div className="pointer-events-none absolute -inset-x-10 -top-8 bottom-0 -z-10">
            <div className="mx-auto h-full w-[70%] rounded-full bg-brand opacity-25 blur-[80px]" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-line2 bg-panel shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]">
            <div className="relative" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={VIDEO_SRC}
                loading="lazy"
                title="Iglesia Digital — presentación"
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                allowFullScreen
              />
            </div>
          </div>
          <div className="mt-8 text-center">
            <Button href="/diagnostico" variant="accent" size="lg">
              Haz tu diagnóstico gratis <span>→</span>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
