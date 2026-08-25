import type { Metadata } from "next";
import { AuroraBackground } from "@/components/ui/animated-background";
import { CountdownOffer } from "@/components/offer/CountdownOffer";
import { PayPalCheckout } from "@/components/offer/PayPalCheckout";
import {
  OFFER_PRICE,
  OFFER_PRICE_OLD,
  OFFER_CURRENCY,
  OFFER_PRODUCT,
} from "@/components/offer/config";

export const metadata: Metadata = {
  title: "Oferta de aniversario · Programa Iglesia Digital",
  description:
    "Únete al Programa Iglesia Digital con el precio de aniversario. 16 semanas de formación, Zoom en vivo cada 15 días y el Google Ad Grant de $10,000 USD/mes.",
  robots: { index: false, follow: false },
};

const INCLUDES = [
  "16 semanas de formación paso a paso (4 módulos)",
  "Sesiones en vivo por Zoom cada 15 días",
  "Cómo activar el Google Ad Grant: $10,000 USD/mes en publicidad gratis",
  "Tu sitio web + Church Online Platform + streaming",
  "Embudo de conversión y publicidad (orgánica y con IA SmartReach Ads)",
  "Plantillas, checklists y documentos editables listos para usar",
  "Semana de lanzamiento + seguimiento espiritual",
  "Certificado de culminación",
];

export default function OfertaPage({
  searchParams,
}: {
  searchParams: { email?: string; name?: string; church?: string };
}) {
  const lead = {
    name: (searchParams.name || "").trim(),
    email: (searchParams.email || "").trim().toLowerCase(),
    church: (searchParams.church || "").trim(),
  };

  return (
    <main className="relative">
      <AuroraBackground className="min-h-screen">
        <div className="container flex min-h-screen items-center justify-center py-12 sm:py-16">
          <div className="w-full max-w-[640px] overflow-hidden rounded-[26px] border border-line2 bg-gradient-to-b from-panel to-bg2 p-6 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] sm:p-10">
            <a href="/" className="mb-6 flex justify-center" aria-label="Ir al inicio">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/iglesiadigital-logo.png" alt="Iglesia Digital" className="h-[44px] w-auto" />
            </a>

            <div className="text-center">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">
                🎉 Precio de aniversario · Solo por poco tiempo
              </div>
              <h1 className="mt-2 font-display text-[clamp(24px,4vw,32px)] font-bold">
                {OFFER_PRODUCT}
              </h1>
              <p className="mx-auto mt-2.5 max-w-[46ch] text-[15.5px] text-muted">
                El acompañamiento completo para llevar tu iglesia al mundo digital y
                alcanzar a más personas en tu ciudad.
              </p>
            </div>

            {/* Lo que incluye */}
            <div className="my-7 rounded-[16px] border border-line2 bg-panel2 p-5 sm:p-6">
              <h2 className="mb-3.5 font-display text-[18px] font-bold">Esto es lo que incluye:</h2>
              <ul className="space-y-2.5">
                {INCLUDES.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14.5px]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none text-good" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Oferta + pago */}
            <div className="rounded-[16px] border border-accent/40 bg-gradient-to-b from-accent/[0.12] to-transparent p-4 text-center sm:p-7">
              <CountdownOffer seconds={600} />
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <span className="whitespace-nowrap text-[22px] font-semibold text-red-500 line-through">
                  ${OFFER_PRICE_OLD} {OFFER_CURRENCY}
                </span>
                <span className="whitespace-nowrap font-display text-[clamp(34px,8vw,44px)] font-extrabold leading-none text-green-400">
                  ${OFFER_PRICE} {OFFER_CURRENCY}
                </span>
              </div>
              <p className="mx-auto mt-2 max-w-[42ch] text-[14px] text-muted">
                Precio de lanzamiento por nuestro aniversario. Por poco tiempo.
              </p>
              <div className="mx-auto mt-6 max-w-[480px]">
                <PayPalCheckout lead={lead} />
              </div>
            </div>

            <p className="mt-6 text-center text-[12.5px] text-muted">
              ¿Dudas antes de inscribirte? Escríbenos a{" "}
              <a href="mailto:contacto@tecnoiglesia.com" className="text-accent-soft hover:underline">
                contacto@tecnoiglesia.com
              </a>
            </p>
          </div>
        </div>
      </AuroraBackground>
    </main>
  );
}
