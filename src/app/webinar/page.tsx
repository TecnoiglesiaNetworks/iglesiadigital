import type { Metadata } from "next";
import { AuroraBackground } from "@/components/ui/animated-background";
import { WebinarLanding } from "@/components/webinar/WebinarLanding";
import { resolveWebinarConfig } from "@/lib/webinar-config";

// La config puede cambiar desde el admin (nombre, fecha/hora), así que la
// página se renderiza en cada request.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const cfg = resolveWebinarConfig();
  const desc = `${cfg.subtitle} En vivo, gratis. ${cfg.dateLabel}, ${cfg.timeLabel} (CDMX). Cupos limitados.`;
  return {
    title: `Webinar gratis: ${cfg.title}`,
    description: desc,
    alternates: { canonical: "/webinar" },
    openGraph: {
      type: "website",
      url: "/webinar",
      title: `Webinar gratis: ${cfg.title} · Iglesia Digital`,
      description: desc,
    },
  };
}

export default function WebinarPage() {
  const cfg = resolveWebinarConfig();
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
