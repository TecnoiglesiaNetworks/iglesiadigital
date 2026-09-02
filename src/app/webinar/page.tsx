import type { Metadata } from "next";
import { AuroraBackground } from "@/components/ui/animated-background";
import { WebinarLanding } from "@/components/webinar/WebinarLanding";

export const metadata: Metadata = {
  title: "Webinar gratis: La Gran Comisión también es digital",
  description:
    "Webinar en vivo y gratuito para pastores y líderes. Aprende a usar Google, redes sociales, publicidad e inteligencia artificial para alcanzar a más personas. Lunes 7 de septiembre, 8:00 PM (CDMX). Cupos limitados.",
  alternates: { canonical: "/webinar" },
  openGraph: {
    type: "website",
    url: "/webinar",
    title: "Webinar gratis: La Gran Comisión también es digital · Iglesia Digital",
    description:
      "Cómo usar Google, redes, publicidad e IA para alcanzar a más personas. En vivo, gratis. Lunes 7 de septiembre, 8:00 PM (CDMX).",
  },
};

export default function WebinarPage() {
  return (
    <>
      <main className="relative">
        <AuroraBackground className="min-h-screen">
          <WebinarLanding />
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
