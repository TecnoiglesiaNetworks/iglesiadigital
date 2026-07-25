"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#problema", label: "El reto" },
  { href: "/#grant", label: "Google Grant" },
  { href: "/temario", label: "Temario" },
  { href: "/#diagnostico", label: "Diagnóstico" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-300",
        scrolled && "border-line bg-bg/80 backdrop-blur-md"
      )}
    >
      <div className="container flex h-[72px] items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/iglesia-digital-logo.png" alt="Iglesia Digital" className="h-7 w-auto" />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] font-medium text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3.5">
          <Button href="/#programa" variant="ghost" className="hidden px-5 py-[11px] text-[14.5px] md:inline-flex">
            Ver el programa
          </Button>
          <Button href="/#diagnostico" variant="accent" className="px-5 py-[11px] text-[14.5px]">
            Diagnóstico gratis
          </Button>
        </div>
      </div>
    </header>
  );
}
