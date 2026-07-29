import type { Metadata } from "next";
import { AuditQuiz } from "@/components/quiz/AuditQuiz";
import { AuroraBackground } from "@/components/ui/animated-background";

export const metadata: Metadata = {
  title: "Diagnóstico Digital Gratis para tu Iglesia",
  description:
    "Auditoría digital gratuita de tu iglesia en 3 minutos. Descubre qué tan lista está tu iglesia para crecer en internet y redes, y recibe al instante un diagnóstico personalizado con tus próximos pasos.",
  alternates: { canonical: "/diagnostico" },
  openGraph: {
    type: "website",
    url: "/diagnostico",
    title: "Diagnóstico Digital Gratis para tu Iglesia · Iglesia Digital",
    description: "Descubre en 3 minutos qué tan lista está tu iglesia para crecer en internet. Gratis y al instante.",
  },
};

export default function DiagnosticoPage() {
  return (
    <main className="relative">
      {/* Fondo Aurora animado (sin header ni cuadrícula, experiencia enfocada) */}
      <AuroraBackground className="min-h-screen">
        <div className="container flex min-h-screen items-center py-12 sm:py-16">
          <AuditQuiz />
        </div>
      </AuroraBackground>
    </main>
  );
}
