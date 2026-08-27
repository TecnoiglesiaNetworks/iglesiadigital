// Explicación de qué es el Programa Iglesia Digital. Se muestra debajo del video
// (en los resultados del diagnóstico) y en /oferta, para que quede claro qué se
// compra antes de ver el precio. Sin hooks: sirve en server y client components.

const INCLUDES = [
  "Curso en video de 16 semanas (4 módulos), para avanzar a tu ritmo",
  "Sesiones en vivo por Zoom cada 15 días (dudas y acompañamiento)",
  "Cómo activar el Google Ad Grant: $10,000 USD/mes en publicidad gratis",
  "Cómo hacer y/o modificar tu sitio web + Church Online Platform + streaming",
  "Embudo de conversión y publicidad (orgánica y con IA SmartReach Ads)",
  "Plantillas, checklists y documentos editables listos para usar",
  "Semana de lanzamiento + seguimiento espiritual",
  "Certificado de culminación",
];

export function ProgramDetails({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-[16px] border border-line2 bg-white/[0.03] p-5 sm:p-6 ${className}`}>
      <h3 className="font-display text-[20px] font-bold text-white">¿Qué es el Programa Iglesia Digital?</h3>
      <p className="mt-2 text-[14.5px] text-white/90">
        Es un <b className="text-white">curso en video</b> que avanzas a tu ritmo,{" "}
        <b className="text-white">semana a semana durante 16 semanas</b>, con{" "}
        <b className="text-white">sesiones en vivo por Zoom cada 15 días</b> para resolver tus dudas y
        acompañarte paso a paso hasta ver resultados.
      </p>

      {/* Vista del plan de formación (módulos + bonos + certificado) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/programa-formacion.png"
        alt="Plan de Formación Iglesia Digital — Curso en video de 16 semanas, con bonos y certificado"
        className="mt-5 w-full rounded-xl border border-line2"
        loading="lazy"
      />

      <div className="mt-5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">
        Todo lo que incluye
      </div>
      <ul className="mt-2.5 space-y-2.5">
        {INCLUDES.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[14.5px] text-white/90">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-none text-good" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Botón que baja al checkout, con flechas */}
      <div className="mt-6 text-center">
        <a
          href="#checkout"
          className="inline-block rounded-full bg-accent px-6 py-3 font-display text-[15px] font-extrabold uppercase tracking-wide text-white shadow-[0_12px_30px_-10px_rgba(255,80,1,0.6)] transition hover:brightness-110"
        >
          ¡Adquiérelo ahora! · Oferta limitada
        </a>
        <div className="mt-1.5 flex animate-bounce items-center justify-center gap-1 text-accent">
          {[0, 1, 2].map((i) => (
            <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}
