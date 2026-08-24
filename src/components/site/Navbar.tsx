"use client";
import { useEffect, useState } from "react";
import { UserRound, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#problema", label: "El reto" },
  { href: "/#grant", label: "Google Grant" },
  { href: "/temario", label: "Temario" },
  { href: "/diagnostico", label: "Diagnóstico" },
];

const MEMBERS_URL = "https://hotmart.com/en/club/iglesiadigital";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra el menú móvil al pasar a escritorio.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-300",
        (scrolled || open) && "border-line bg-bg/80 backdrop-blur-md"
      )}
    >
      <div className="container flex h-[72px] items-center justify-between">
        <a href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/iglesiadigital-logo.png" alt="Iglesia Digital" className="h-8 w-auto md:h-[39px]" />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] font-medium text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <Button
            href={MEMBERS_URL}
            target="_blank"
            rel="noopener"
            variant="ghost"
            className="hidden px-5 py-[11px] text-[14.5px] md:inline-flex"
          >
            <UserRound size={17} />
            Área de miembros
          </Button>
          <Button href="/diagnostico" variant="accent" className="px-3.5 py-[11px] text-[14px] sm:px-5 sm:text-[14.5px]">
            Diagnóstico gratis
          </Button>

          {/* Botón menú (solo móvil) */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-lg border border-line2 text-ink md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Panel del menú móvil */}
      {open && (
        <div className="border-t border-line bg-bg md:hidden">
          <nav className="container flex flex-col py-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3.5 text-[16px] font-medium text-ink"
              >
                {l.label}
              </a>
            ))}
            <a
              href={MEMBERS_URL}
              target="_blank"
              rel="noopener"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-3.5 text-[16px] font-medium text-muted"
            >
              <UserRound size={18} /> Área de miembros
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
