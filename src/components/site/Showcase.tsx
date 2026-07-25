import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";


function Band({
  img,
  alt,
  imgRight,
  eyebrow,
  title,
  body,
  cta,
}: {
  img: string;
  alt: string;
  imgRight?: boolean;
  eyebrow: string;
  title: string;
  body: string;
  cta?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      <Reveal className={imgRight ? "md:order-2" : ""}>
        <div className="overflow-hidden rounded-2xl border border-line2 bg-panel shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={alt} className="h-full w-full object-cover" />
        </div>
      </Reveal>
      <Reveal delay={0.08} className={imgRight ? "md:order-1" : ""}>
        <span className="mb-4 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent before:h-px before:w-5 before:bg-accent before:content-['']">
          {eyebrow}
        </span>
        <h2 className="font-display text-[clamp(24px,3.6vw,36px)] font-bold leading-[1.12] tracking-tight">{title}</h2>
        <p className="mt-4 text-[16.5px] text-muted">{body}</p>
        {cta && (
          <div className="mt-7">
            <Button href="#diagnostico" variant="accent">
              Haz tu diagnóstico gratis <span>→</span>
            </Button>
          </div>
        )}
      </Reveal>
    </div>
  );
}

export function Showcase() {
  return (
    <section className="space-y-24 py-24">
      <div className="container">
        <Band
          img={"/images/church-online.jpg"}
          alt="Servicio en línea de la iglesia"
          eyebrow="Tu servicio en línea"
          title="Un servicio online que recibe y acompaña a cada visitante"
          body="Configuramos tu plataforma de iglesia en línea para que quien te descubre no solo vea el video: encuentra dónde conectarse, pedir oración, tomar una decisión y dar el siguiente paso."
          cta
        />
      </div>
      <div className="container">
        <Band
          img={"/images/team.jpg"}
          alt="Equipo de Iglesia Digital"
          imgRight
          eyebrow="Con profesionales"
          title="Más de 20 años equipando iglesias como la tuya"
          body="No es solo tecnología: es propósito con dirección. Te acompañamos con la experiencia de haber ayudado a miles de iglesias a impactar más allá de las paredes del templo."
        />
      </div>
      <div className="container">
        <Reveal className="mx-auto mb-9 max-w-[680px] text-center">
          <span className="mb-4 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent before:h-px before:w-5 before:bg-accent before:content-['']">
            En cualquier pantalla
          </span>
          <h2 className="font-display text-[clamp(24px,3.6vw,36px)] font-bold leading-[1.12] tracking-tight">
            Tu servicio en vivo, listo para quien te descubre
          </h2>
        </Reveal>
        <Reveal className="relative mx-auto max-w-[1000px]">
          <div className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0 -z-10">
            <div className="mx-auto h-full w-[70%] rounded-full bg-brand opacity-25 blur-[80px]" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-line2 bg-panel shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/banner.jpg" alt="Servicio en línea de la iglesia" className="w-full" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
