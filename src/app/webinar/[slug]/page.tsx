import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuroraBackground } from "@/components/ui/animated-background";
import { WebinarLanding } from "@/components/webinar/WebinarLanding";
import { getWebinarBySlug } from "@/lib/webinars-db";
import { configForWebinar } from "@/lib/webinar-config";

// Cada webinar tiene su propio landing en /webinar/<slug>. Se renderiza en cada
// request porque la config es editable desde el admin.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const w = getWebinarBySlug(params.slug);
  if (!w) return { title: "Webinar" };
  const cfg = configForWebinar(w);
  const desc = `${cfg.subtitle} En vivo, gratis. ${cfg.dateLabel}, ${cfg.timeLabel} (CDMX). Cupos limitados.`;
  return {
    title: `Webinar gratis: ${cfg.title}`,
    description: desc,
    alternates: { canonical: `/webinar/${cfg.slug}` },
    openGraph: {
      type: "website",
      url: `/webinar/${cfg.slug}`,
      title: `Webinar gratis: ${cfg.title} · Iglesia Digital`,
      description: desc,
    },
  };
}

export default function WebinarSlugPage({ params }: { params: { slug: string } }) {
  const w = getWebinarBySlug(params.slug);
  if (!w) notFound();
  const cfg = configForWebinar(w);
  return (
    <>
      <main className="relative">
        <AuroraBackground className="min-h-screen">
          <WebinarLanding cfg={cfg} />
        </AuroraBackground>
      </main>

      {/* Footer mínimo del landing: solo logo + copyright, sin links de navegación. */}
      <footer className="border-t border-line bg-bg2 py-10">
        <div className="container flex flex-col items-center gap-3 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ti-network.png" alt="TI Network" className="h-4 w-auto opacity-80" />
          <span className="text-[13px] text-muted">
            © 2026 Tecnoiglesia Network · Programa Iglesia Digital · Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </>
  );
}
