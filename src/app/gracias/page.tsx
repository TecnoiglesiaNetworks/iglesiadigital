import type { Metadata } from "next";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/animated-background";

export const metadata: Metadata = {
  title: "¡Gracias por tu compra!",
  description: "Recibimos tu pago. Te enviaremos los accesos a tu correo.",
  robots: { index: false, follow: false },
};

const MEMBERS_URL = "https://hotmart.com/en/club/iglesiadigital";

export default function GraciasPage() {
  return (
    <main className="relative">
      <AuroraBackground className="min-h-screen">
        <div className="container flex min-h-screen items-center justify-center py-12 sm:py-16">
          <div className="w-full max-w-[560px] rounded-[20px] border border-line2 bg-panel2 p-8 text-center sm:p-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/iglesiadigital-logo.png"
              alt="Iglesia Digital"
              className="mx-auto mb-7 h-[44px] w-auto"
            />

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-good/15">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-good" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h1 className="mt-5 font-display text-[clamp(24px,4vw,30px)] font-bold">
              ¡Gracias por tu compra! 🎉
            </h1>
            <p className="mx-auto mt-3 max-w-[44ch] text-[15.5px] text-muted">
              Recibimos tu pago correctamente y durante las próximas horas te
              enviaremos los{" "}
              <b className="text-ink">accesos al programa a tu correo electrónico</b>.
            </p>
            <p className="mx-auto mt-3 max-w-[44ch] text-[14px] text-muted">
              Revisa tu bandeja de entrada (y la carpeta de spam/promociones). Si en
              un máximo de 24 horas no llega, escríbenos a{" "}
              <a href="mailto:contacto@tecnoiglesia.com" className="text-accent-soft hover:underline">
                contacto@tecnoiglesia.com
              </a>
              .
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={MEMBERS_URL} target="_blank" rel="noopener" className="btn-accent">
                Ir al área de miembros <span>→</span>
              </a>
              <Link href="/" className="text-[14.5px] text-muted hover:text-ink">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </AuroraBackground>
    </main>
  );
}
