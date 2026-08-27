import type { Metadata } from "next";
import { AuroraBackground } from "@/components/ui/animated-background";
import { CountdownOffer } from "@/components/offer/CountdownOffer";
import { PayPalCheckout } from "@/components/offer/PayPalCheckout";
import { ProgramDetails } from "@/components/offer/ProgramDetails";
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

            {/* Qué es el programa + lo que incluye */}
            <ProgramDetails className="my-7 text-left" />

            {/* Oferta + pago */}
            <div id="checkout" className="scroll-mt-6 rounded-[16px] border border-accent/40 bg-gradient-to-b from-accent/[0.12] to-transparent p-4 text-center sm:p-7">
              <CountdownOffer seconds={600} />
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <span className="whitespace-nowrap text-[22px] font-semibold text-red-500 line-through">
                  ${OFFER_PRICE_OLD} {OFFER_CURRENCY}
                </span>
                <span className="whitespace-nowrap font-display text-[clamp(34px,8vw,44px)] font-extrabold leading-none text-green-400">
                  ${OFFER_PRICE} {OFFER_CURRENCY}
                </span>
              </div>
              <div className="mx-auto mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-good/15 px-3.5 py-1 text-[13.5px] font-bold text-good">
                ✔ Un solo pago de ${OFFER_PRICE} {OFFER_CURRENCY} · No es mensual
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
