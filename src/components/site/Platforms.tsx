import { Reveal } from "./Reveal";


/* Logos reales alojados en tu dominio. Ajusta alt/orden si hace falta. */
const logos = [
  { src: "/logos/google-ad-grants.png", alt: "Google Ad Grants", cls: "h-14 sm:h-16" },
  { src: "/logos/meta.png", alt: "Meta", cls: "h-10 sm:h-12" },
  { src: "/logos/instagram.png", alt: "Instagram", cls: "h-10 sm:h-12" },
  { src: "/logos/youtube.png", alt: "YouTube", cls: "h-10 sm:h-12" },
];

const DISCLOSURE =
  "Este sitio web no está afiliado, asociado, autorizado, respaldado por, ni de ninguna manera oficialmente conectado con Facebook, Meta, Instagram, YouTube ni Google LLC. Las marcas registradas, nombres de productos y servicios de Facebook, Meta, Instagram, YouTube y Google son propiedad de sus respectivos titulares. El contenido y las opiniones expresadas en este sitio web son únicamente del autor y no reflejan ni son respaldadas por Facebook, Meta, Instagram, YouTube ni Google LLC.";

export function Platforms() {
  return (
    <section className="border-t border-line py-16">
      <div className="container">
        <Reveal className="text-center">
          <p className="mb-9 text-[13px] font-semibold uppercase tracking-[0.15em] text-muted">
            Integramos las plataformas que tu iglesia ya usa
          </p>
          <div className="mx-auto grid max-w-[880px] grid-cols-2 place-items-center gap-x-8 gap-y-10 sm:grid-cols-4">
            {logos.map((l) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={l.alt} src={l.src} alt={l.alt} className={`${l.cls} w-auto object-contain opacity-90`} />
            ))}
          </div>
        </Reveal>
        <Reveal className="mx-auto mt-14 max-w-[860px]">
          <p className="text-center text-[12px] leading-relaxed text-[#6B6494]">{DISCLOSURE}</p>
        </Reveal>
      </div>
    </section>
  );
}
