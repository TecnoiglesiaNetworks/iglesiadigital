"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboOption = {
  value: string;
  label: string;
  search: string;
  flag?: string;
  sub?: string;
};

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Selecciona…",
  searchPlaceholder = "Buscar…",
  disabled,
  loading,
  className,
  panelWidth,
  renderTrigger,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ComboOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  panelWidth?: number;
  renderTrigger?: (selected: ComboOption | null) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) || null;

  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, width: r.width });
  };

  useLayoutEffect(() => {
    if (open) place();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    // Al hacer scroll de la página o cambiar el tamaño, reposicionamos el panel
    // (no lo cerramos). Ignoramos el scroll DENTRO de la propia lista.
    const onScrollResize = (e: Event) => {
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
      place();
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = s ? options.filter((o) => o.search.includes(s)) : options;
    return base.slice(0, 60);
  }, [q, options]);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-[11px] border border-line bg-panel2 px-3.5 py-3 text-left text-[15.5px] text-ink outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {renderTrigger ? (
          renderTrigger(selected)
        ) : (
          <span className={cn("flex-1 truncate", !selected && "text-[#5a638f]")}>
            {selected ? (
              <span className="flex items-center gap-2">
                {selected.flag && <span>{selected.flag}</span>}
                {selected.label}
              </span>
            ) : loading ? (
              "Cargando…"
            ) : (
              placeholder
            )}
          </span>
        )}
        <ChevronDown size={16} className="flex-none text-muted" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: rect.top,
              left: rect.left,
              width: panelWidth ?? Math.max(rect.width, 220),
            }}
            className="z-[100] overflow-hidden rounded-[13px] border border-line2 bg-panel shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)]"
          >
            <div className="flex items-center gap-2 border-b border-line px-3 py-2">
              <Search size={14} className="text-muted" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                name="cbx-search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-autocomplete="list"
                data-lpignore="true"
                data-form-type="other"
                className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-[#5a638f]"
              />
            </div>
            <ul className="max-h-[240px] overflow-y-auto py-1">
              {loading && <li className="px-3 py-2 text-[14px] text-muted">Cargando…</li>}
              {!loading && filtered.length === 0 && (
                <li className="px-3 py-2 text-[14px] text-muted">Sin resultados</li>
              )}
              {filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setQ("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14.5px] text-ink hover:bg-panel3",
                      o.value === value && "bg-panel2"
                    )}
                  >
                    {o.flag && <span className="text-[16px]">{o.flag}</span>}
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.sub && <span className="text-[12.5px] text-muted">{o.sub}</span>}
                    {o.value === value && <Check size={15} className="flex-none text-accent" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
}
