import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Step2Card } from "@/components/webinar/Step2Card";
import { getWebinarBySlug } from "@/lib/webinars-db";
import { configForWebinar } from "@/lib/webinar-config";

// Pantalla enfocada tras el registro: fondo limpio y solo la caja del Paso 2
// (unirse al grupo de WhatsApp) para que no haya distracciones en móvil ni
// escritorio. Se renderiza en cada request porque la config es editable.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Casi listo · Únete al grupo",
  robots: { index: false, follow: false },
};

export default function WebinarListoPage({ params }: { params: { slug: string } }) {
  const w = getWebinarBySlug(params.slug);
  if (!w) notFound();
  const cfg = configForWebinar(w);
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-[440px]">
        <Step2Card whatsappUrl={cfg.whatsappGroupUrl} joinImage={cfg.joinImage} />
      </div>
    </main>
  );
}
