const links = [
  ["#programa", "El programa"],
  ["/temario", "Temario"],
  ["/diagnostico", "Diagnóstico"],
  ["https://hotmart.com/en/club/iglesiadigital", "Área de miembros"],
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg2 py-14">
      <div className="container">
        <div className="mb-8 flex flex-wrap justify-between gap-8">
          <a href="#top" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/iglesia-digital-logo.png" alt="Iglesia Digital" className="h-7 w-auto" />
          </a>
          <nav className="flex flex-wrap gap-10">
            {links.map(([href, label]) => (
              <a key={label} href={href} className="text-[14.5px] text-muted transition-colors hover:text-ink">
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6 text-[13px] text-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ti-network.png" alt="TI Network" className="h-4 w-auto opacity-80" />
          <span>© 2026 Tecnoiglesia Network · Programa Iglesia Digital · Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
