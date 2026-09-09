import { SITE } from "@/lib/site";

const links = [
  ["#programa", "El programa"],
  ["/temario", "Temario"],
  ["/diagnostico", "Diagnóstico"],
  ["https://hotmart.com/en/club/iglesiadigital", "Área de miembros"],
];

const socials = [
  {
    label: "YouTube",
    href: SITE.social.youtube,
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z",
  },
  {
    label: "Instagram",
    href: SITE.social.instagram,
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 3.5A6.3 6.3 0 1 0 12 18.3 6.3 6.3 0 0 0 12 5.7zm0 10.4A4.1 4.1 0 1 1 12 7.9a4.1 4.1 0 0 1 0 8.2zm6.5-10.6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z",
  },
  {
    label: "Facebook",
    href: SITE.social.facebook,
    path: "M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z",
  },
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
        <div className="mb-8 flex gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d={s.path} />
              </svg>
            </a>
          ))}
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
