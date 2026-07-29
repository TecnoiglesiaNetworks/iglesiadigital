"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, MailCheck, CalendarDays } from "lucide-react";
import { questions } from "./quiz-data";
import { computeResult, type Answers, type Result } from "./scoring";
import { Combobox, type ComboOption } from "./Combobox";
import { loadCountries, type CountryOpt } from "./geo";
import { cn } from "@/lib/utils";

type Screen = "intro" | "quiz" | "gate" | "results";

// Enlace de Calendly. Se puede sobreescribir con NEXT_PUBLIC_CALENDLY_URL, pero
// dejamos un valor por defecto para que el calendario aparezca siempre (las
// variables NEXT_PUBLIC_* deben existir en build; el valor no es secreto).
const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  "https://calendly.com/tecnoiglesianetwork/asesoria-iglesia-digital?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=ff5001";
const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  "https://calendly.com/tecnoiglesianetwork/asesoria-iglesia-digital";

export function AuditQuiz() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [lead, setLead] = useState({ name: "", church: "", email: "" });
  const [emailError, setEmailError] = useState("");
  // Teléfono (código de país + número) y ubicación (país + ciudad).
  const [countries, setCountries] = useState<CountryOpt[]>([]);
  const [phoneIso, setPhoneIso] = useState("MX");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryIso, setCountryIso] = useState("");
  const [cityName, setCityName] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const total = questions.length;
  const q = questions[idx];
  const current = answers[q?.id];
  const progress = useMemo(() => {
    if (screen === "intro") return 0;
    if (screen === "gate" || screen === "results") return 100;
    return (idx / total) * 100;
  }, [screen, idx, total]);

  // Solo lleva la tarjeta arriba si su parte superior quedó fuera de la vista
  // (evita que "brinque" en cada pregunta cuando ya cabe en pantalla).
  const scrollUp = () => {
    const el = topRef.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Carga la lista de países al llegar al formulario (diferido).
  useEffect(() => {
    if (screen === "gate" && countries.length === 0) {
      loadCountries().then(setCountries).catch(() => {});
    }
  }, [screen, countries.length]);

  const countryOptions: ComboOption[] = useMemo(
    () =>
      countries.map((c) => ({
        value: c.iso,
        label: c.name,
        flag: c.flag,
        search: `${c.name} ${c.dial}`.toLowerCase(),
      })),
    [countries]
  );
  const phoneOptions: ComboOption[] = useMemo(
    () =>
      countries.map((c) => ({
        value: c.iso,
        label: c.name,
        sub: `+${c.dial}`,
        flag: c.flag,
        search: `${c.name} +${c.dial}`.toLowerCase(),
      })),
    [countries]
  );
  const phoneCountry = countries.find((c) => c.iso === phoneIso);

  function pick(option: (typeof questions)[number]["options"][number]) {
    setAnswers((a) => ({
      ...a,
      [q.id]: { label: option.label, value: option.value, points: option.points },
    }));
  }
  function next() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      scrollUp();
    } else {
      setScreen("gate");
      scrollUp();
    }
  }
  function back() {
    if (idx > 0) {
      setIdx((i) => i - 1);
      scrollUp();
    }
  }

  async function reveal() {
    const name = lead.name.trim();
    const email = lead.email.trim();
    if (!name || !email) {
      alert("Escribe al menos tu nombre y correo para enviarte el reporte.");
      return;
    }
    // Validamos que el correo tenga formato válido (no cualquier texto).
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Escribe un correo válido, por ejemplo nombre@correo.com");
      return;
    }
    setEmailError("");
    const res = computeResult(answers);
    setResult(res);
    setScreen("results");
    scrollUp();
    setSending(true);
    // Armamos el teléfono internacional y "Ciudad, País" para el backend.
    const country = countries.find((c) => c.iso === countryIso);
    const whatsapp = phoneNumber.trim()
      ? `+${phoneCountry?.dial ?? ""} ${phoneNumber.trim()}`.trim()
      : "";
    const city = [cityName, country?.name].filter(Boolean).join(", ");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, whatsapp, city, answers, result: res }),
      });
    } catch (e) {
      console.error("No se pudo enviar el lead:", e);
    } finally {
      setSending(false);
    }
  }

  const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] as const },
  };

  return (
    <div ref={topRef} className="mx-auto max-w-[720px] overflow-hidden rounded-[26px] border border-line2 bg-gradient-to-b from-panel to-bg2 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)]">
      <div className="h-[5px] bg-white/[0.07]">
        <div className="h-full bg-gradient-to-r from-brand to-accent transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="p-7 sm:p-11">
        <AnimatePresence mode="wait">
          {screen === "intro" && (
            <motion.div key="intro" {...fade}>
              <div className="mb-6 flex justify-center" aria-hidden>
                <svg className="rings h-[130px] w-[130px]" viewBox="0 0 130 130">
                  <circle className="r3" cx="65" cy="65" r="12" />
                  <circle className="r2" cx="65" cy="65" r="12" />
                  <circle className="r1" cx="65" cy="65" r="12" />
                  <circle className="core" cx="65" cy="65" r="6" />
                </svg>
              </div>
              <h2 className="text-center font-display text-[clamp(23px,3.4vw,30px)] font-bold">Auditoría Digital de tu Iglesia</h2>
              <p className="mx-auto mt-2.5 max-w-[46ch] text-center text-[16px] text-muted">
                Un diagnóstico honesto y personalizado. Sin costo, sin compromiso.
              </p>
              <div className="my-7 flex justify-center gap-6 text-[14px] text-muted">
                <span className="inline-flex items-center gap-2 before:h-1 before:w-1 before:rounded-full before:bg-accent before:content-['']"><b className="text-ink">8</b> preguntas</span>
                <span className="inline-flex items-center gap-2 before:h-1 before:w-1 before:rounded-full before:bg-accent before:content-['']"><b className="text-ink">3</b> min</span>
                <span className="inline-flex items-center gap-2 before:h-1 before:w-1 before:rounded-full before:bg-accent before:content-['']">Resultado <b className="text-ink">al instante</b></span>
              </div>
              <div className="text-center">
                <button onClick={() => { setIdx(0); setScreen("quiz"); }} className="btn-accent">
                  Comenzar mi diagnóstico <span>→</span>
                </button>
              </div>
              <p className="mt-3.5 flex items-center justify-center gap-2 text-[12.5px] text-muted"><Lock size={13} /> No compartimos tus datos con nadie.</p>
            </motion.div>
          )}

          {screen === "quiz" && q && (
            <motion.div key={`q-${idx}`} {...fade}>
              <div className="mb-1.5 text-[13.5px] font-medium text-muted">Pregunta {idx + 1} de {total}</div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-accent">{q.dim}</div>
              <h2 className="font-display text-[clamp(23px,3.4vw,30px)] font-bold">{q.q}</h2>
              <div className="mt-4 flex flex-col gap-2.5" role="listbox">
                {q.options.map((o, i) => {
                  const sel = current?.value === o.value;
                  return (
                    <button
                      key={i}
                      role="option"
                      aria-selected={sel}
                      onClick={() => pick(o)}
                      className={cn(
                        "flex items-center gap-3.5 rounded-[13px] border border-line bg-panel2 p-4 text-left text-[15.5px] transition-colors hover:border-line2 hover:bg-panel3",
                        sel && "border-accent bg-panel3 shadow-[inset_0_0_0_1px_var(--accent)]"
                      )}
                    >
                      <span className={cn("grid h-[21px] w-[21px] flex-none place-items-center rounded-full border-2 border-line2", sel && "border-accent bg-accent")}>
                        {sel && <span className="h-2 w-2 rounded-full bg-[#ffffff]" />}
                      </span>
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <button onClick={back} className={cn("text-[14.5px] text-muted hover:text-ink", idx === 0 && "invisible")}>← Atrás</button>
                <button onClick={next} disabled={!current} className="btn-accent disabled:cursor-not-allowed disabled:opacity-40">
                  Siguiente <span>→</span>
                </button>
              </div>
            </motion.div>
          )}

          {screen === "gate" && (
            <motion.div key="gate" {...fade}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-accent">Casi listo</div>
              <h2 className="font-display text-[clamp(23px,3.4vw,30px)] font-bold">Tu diagnóstico está preparado</h2>
              <p className="mb-6 mt-2.5 text-[16px] text-muted">
                ¿A dónde te enviamos el reporte completo con tu plan de acción? Verás tu resultado en la siguiente pantalla.
              </p>
              <Field label="Tu nombre" value={lead.name} onChange={(v) => setLead({ ...lead, name: v })} placeholder="Ej. Pastor Juan Pérez" />
              <Field label="Nombre de tu iglesia" value={lead.church} onChange={(v) => setLead({ ...lead, church: v })} placeholder="Ej. Iglesia Vida Nueva" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Correo"
                  type="email"
                  value={lead.email}
                  onChange={(v) => {
                    setLead({ ...lead, email: v });
                    if (emailError) setEmailError("");
                  }}
                  placeholder="tu@correo.com"
                  error={emailError}
                />
                <div className="mb-4">
                  <label className="mb-1.5 block text-[13.5px] font-medium text-muted">WhatsApp</label>
                  <div className="flex gap-2">
                    <Combobox
                      value={phoneIso}
                      onChange={setPhoneIso}
                      options={phoneOptions}
                      loading={countries.length === 0}
                      panelWidth={300}
                      searchPlaceholder="País o código…"
                      renderTrigger={() => (
                        <span className="flex flex-none items-center gap-1.5 whitespace-nowrap">
                          <span className="text-[16px]">{phoneCountry?.flag ?? "🌐"}</span>
                          <b className="font-medium">+{phoneCountry?.dial ?? ""}</b>
                        </span>
                      )}
                    />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Número"
                      className="w-full rounded-[11px] border border-line bg-panel2 px-3.5 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#5a638f] focus:border-accent"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="mb-4">
                  <label className="mb-1.5 block text-[13.5px] font-medium text-muted">País</label>
                  <Combobox
                    value={countryIso}
                    onChange={setCountryIso}
                    options={countryOptions}
                    loading={countries.length === 0}
                    placeholder="Selecciona tu país"
                    searchPlaceholder="Buscar país…"
                    className="w-full"
                  />
                </div>
                <Field
                  label="Ciudad"
                  value={cityName}
                  onChange={setCityName}
                  placeholder="Escribe tu ciudad"
                />
              </div>
              <button onClick={reveal} className="btn-accent mt-1 w-full py-[18px] text-[17px]">Ver mi resultado <span>→</span></button>
              <p className="mt-3.5 flex items-center gap-2 text-[12.5px] text-muted"><Lock size={13} className="flex-none" /> Nada de spam. Solo tu diagnóstico y consejos útiles.</p>
            </motion.div>
          )}

          {screen === "results" && result && (
            <motion.div key="results" {...fade}>
              <a href="/" className="mb-6 flex justify-center" aria-label="Ir al inicio">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/iglesiadigital-logo.png" alt="Iglesia Digital" className="h-[47px] w-auto" />
              </a>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                {lead.name ? `${lead.name.split(" ")[0]}, este es tu diagnóstico` : "Tu diagnóstico"}
              </div>
              <h2 className="font-display text-[clamp(23px,3.4vw,30px)] font-bold">Estado digital de tu iglesia</h2>
              <p className="mt-2 flex items-center gap-2 text-[13.5px] text-muted">
                <MailCheck size={15} className="flex-none text-good" />
                {sending ? "Enviando el reporte completo a tu correo…" : "Te enviamos también el reporte completo por correo."}
              </p>

              <div className="my-6 flex flex-wrap items-center gap-6">
                <Gauge pct={result.pct} />
                <div className="min-w-[210px] flex-1">
                  <div className="mb-2 font-display text-[23px] font-bold">{result.level}</div>
                  <p className="text-[15px] text-muted">{result.levelSub}</p>
                </div>
              </div>

              <div className="my-6 flex flex-col gap-3.5">
                {result.dims.map((d) => (
                  <div key={d.name} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
                    <span className="text-[14px] font-medium">{d.name}</span>
                    <span className="text-[12.5px] tabular-nums text-muted">{d.pct}%</span>
                    <div className="col-span-2 h-[7px] overflow-hidden rounded-full bg-white/[0.07]">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${d.pct}%` }} transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }} className="h-full rounded-full bg-gradient-to-r from-brand to-accent" />
                    </div>
                  </div>
                ))}
              </div>

              {result.grantCallout && (
                <div className="my-6 rounded-[15px] border border-accent/40 bg-gradient-to-b from-accent/[0.12] to-transparent p-5">
                  <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">Oportunidad detectada</div>
                  <h4 className="my-1.5 font-display text-[18px] font-bold">{result.grantCallout.title}</h4>
                  <p className="text-[14.5px] opacity-90">{result.grantCallout.body}</p>
                </div>
              )}

              <div className="my-6">
                <h3 className="mb-3.5 font-display text-[20px] font-bold">Tus 3 movimientos de mayor impacto</h3>
                {result.wins.map((w, i) => (
                  <div key={i} className="flex gap-3.5 border-t border-line py-3.5 last:border-b">
                    <div className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-panel3 font-display text-[15px] font-bold text-accent">{i + 1}</div>
                    <div>
                      <b className="block text-[15px]">{w.title}</b>
                      <span className="text-[14px] text-muted">{w.body}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[18px] border border-line2 bg-panel2 p-6 sm:p-7">
                {/* VSL */}
                <div className="text-center">
                  <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">Antes de agendar, mira esto</div>
                  <h3 className="mt-1.5 font-display text-[22px] font-bold">Así ayudamos a iglesias como la tuya</h3>
                </div>
                <div className="mt-5">
                  <VslPlaceholder />
                </div>

                {/* Agenda tu cita */}
                <div className="mt-9 text-center">
                  <h3 className="font-display text-[22px] font-bold">Agenda tu cita gratuita</h3>
                  <p className="mx-auto mb-5 mt-2 max-w-[44ch] text-[15px] text-muted">
                    Asesoría de 20 minutos, sin costo. Revisamos tu diagnóstico juntos y te decimos por dónde empezar.
                  </p>
                </div>
                <CalendlyEmbed
                  url={CALENDLY_URL}
                  fallbackUrl={BOOKING_URL}
                  prefill={{ name: lead.name, email: lead.email }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13.5px] font-medium text-muted">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cn(
          "w-full rounded-[11px] border bg-panel2 px-3.5 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#5a638f] focus:border-accent",
          error ? "border-red-500/70" : "border-line"
        )}
      />
      {error && <p className="mt-1.5 text-[12.5px] text-red-400">{error}</p>}
    </div>
  );
}

function Gauge({ pct }: { pct: number }) {
  const circ = 415;
  return (
    <div className="relative h-[150px] w-[150px] flex-none">
      <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
        <circle cx="75" cy="75" r="66" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
        <motion.circle
          cx="75" cy="75" r="66" fill="none" stroke="url(#rg)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
        />
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6A3DE8" />
            <stop offset="1" stopColor="#FF5001" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <b className="font-display text-[36px] font-extrabold leading-none">{pct}%</b>
        <small className="text-[11px] uppercase tracking-[0.1em] text-muted">Madurez</small>
      </div>
    </div>
  );
}

/* Placeholder del VSL. Cuando tengas el video, reemplaza este componente por el
   <iframe> de YouTube/Vimeo o un <video> propio, manteniendo el contenedor 16:9. */
function VslPlaceholder() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line2 bg-black/60" style={{ paddingTop: "56.25%" }}>
      <div className="absolute inset-0 grid place-content-center gap-4 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent shadow-[0_14px_34px_-12px_rgba(255,80,1,0.6)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M8 5v14l11-7z" /></svg>
        </span>
        <span className="text-[13.5px] font-medium text-muted">Aquí irá tu VSL (video) — placeholder</span>
      </div>
    </div>
  );
}

/* Embed de Calendly. Si NEXT_PUBLIC_CALENDLY_URL está vacío, muestra un placeholder
   con un botón de respaldo; cuando lo configures, incrusta el calendario en línea.
   Prellenamos nombre y correo para que la cita quede ligada al lead correcto
   (el webhook empareja por el correo con el que agendan en Calendly). */
function CalendlyEmbed({
  url,
  fallbackUrl,
  prefill,
}: {
  url: string;
  fallbackUrl: string;
  prefill?: { name?: string; email?: string };
}) {
  const finalUrl = url
    ? (() => {
        try {
          const u = new URL(url);
          if (prefill?.name) u.searchParams.set("name", prefill.name);
          if (prefill?.email) u.searchParams.set("email", prefill.email);
          return u.toString();
        } catch {
          return url;
        }
      })()
    : "";

  useEffect(() => {
    if (!url) return;
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, [url]);

  if (!url) {
    return (
      <div className="grid place-content-center gap-3 rounded-[14px] border border-dashed border-line2 bg-panel3/40 px-6 py-11 text-center">
        <span className="flex items-center justify-center gap-2 text-[14.5px] font-medium"><CalendarDays size={16} /> Aquí se incrustará tu calendario de Calendly</span>
        <span className="text-[13px] text-muted">Pega tu enlace en <code className="text-accent-soft">NEXT_PUBLIC_CALENDLY_URL</code> y aparecerá el calendario.</span>
        <a href={fallbackUrl} target="_blank" rel="noopener" className="btn-accent mx-auto mt-1">
          Agendar mi asesoría gratuita <span>→</span>
        </a>
      </div>
    );
  }

  return (
    <div
      className="calendly-inline-widget overflow-hidden rounded-[14px]"
      data-url={finalUrl}
      style={{ minWidth: 320, height: 700 }}
    />
  );
}
