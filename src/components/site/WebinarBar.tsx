"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/* Cintillo del home que anuncia el próximo webinar con cuenta regresiva.
   Se maneja solo: consulta el webinar activo (editable en /admin) y solo se
   muestra si la fecha es futura; al pasar el evento, se oculta. Es cerrable
   (recuerda el cierre por slug) y desplaza el navbar/contenido con --wbar-h. */
type Info = { active: boolean; slug?: string; title?: string; startsAt?: string };

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}
const pad = (n: number) => String(n).padStart(2, "0");

export function WebinarBar() {
  const [info, setInfo] = useState<Info | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/webinar/active")
      .then((r) => r.json())
      .then((d: Info) => setInfo(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (info?.slug && localStorage.getItem(`wbar_dismissed_${info.slug}`)) {
      setDismissed(true);
    }
  }, [info?.slug]);

  const startsAt = info?.startsAt ? new Date(info.startsAt).getTime() : 0;
  const upcoming = !!info?.active && startsAt > now;
  const visible = upcoming && !dismissed;

  // Desplaza navbar/contenido según la altura real del cintillo (--wbar-h).
  useEffect(() => {
    const apply = () => {
      const h = visible && ref.current ? ref.current.offsetHeight : 0;
      document.documentElement.style.setProperty("--wbar-h", `${h}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      document.documentElement.style.setProperty("--wbar-h", "0px");
    };
  }, [visible]);

  if (!visible) return null;

  const { d, h, m, s } = parts(startsAt - now);
  const countdown = d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(s)}`;

  function close() {
    setDismissed(true);
    if (info?.slug) localStorage.setItem(`wbar_dismissed_${info.slug}`, "1");
  }

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 top-0 z-[60] border-b border-accent/40 bg-[#140C28] text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.7)]"
    >
      <a
        href="/webinar#registro"
        className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-10 py-2 text-center transition hover:bg-white/[0.03]"
      >
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em] text-accent-soft">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Webinar gratis
        </span>
        <span className="max-w-[80vw] truncate text-[13px] font-semibold text-white sm:text-[13.5px]">
          {info?.title}
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13.5px]">
          <span className="text-white/40">·</span>
          <span className="tabular-nums font-bold text-white">{countdown}</span>
        </span>
        <span className="inline-flex whitespace-nowrap rounded-full bg-accent px-3.5 py-1 text-[12.5px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(255,80,1,0.7)]">
          Regístrate gratis →
        </span>
      </a>
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar aviso"
        className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}
