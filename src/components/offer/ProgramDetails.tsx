// Explicación de qué es el Programa Iglesia Digital. Se muestra debajo del video
// (en los resultados del diagnóstico) y en /oferta, para que quede claro qué se
// compra antes de ver el precio. Sin hooks: sirve en server y client components.

const INCLUDES = [
  "Curso en video de 16 semanas (4 módulos), para avanzar a tu ritmo",
  "Sesiones en vivo por Zoom cada 15 días (dudas y acompañamiento)",
  "Cómo activar el Google Ad Grant: $10,000 USD/mes en publicidad gratis",
  "Tu sitio web + Church Online Platform + streaming",
  "Embudo de conversión y publicidad (orgánica y con IA SmartReach Ads)",
  "Plantillas, checklists y documentos editables listos para usar",
  "Semana de lanzamiento + seguimiento espiritual",
  "Certificado de culminación",
];

export function ProgramDetails({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-[16px] border border-line2 bg-white/[0.03] p-5 sm:p-6 ${className}`}>
      <h3 className="font-display text-[20px] font-bold">¿Qué es el Programa Iglesia Digital?</h3>
      <p className="mt-2 text-[14.5px] text-muted">
        Es un <b className="text-ink">curso en video</b> que avanzas a tu ritmo,{" "}
        <b className="text-ink">semana a semana durante 16 semanas</b>, con{" "}
        <b className="text-ink">sesiones en vivo por Zoom cada 15 días</b> para resolver tus dudas y
        acompañarte paso a paso hasta ver resultados.
      </p>

      <div className="mt-4 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">
        Todo lo que incluye
      </div>
      <ul className="mt-2.5 space-y-2.5">
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
  );
}
