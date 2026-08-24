"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, MailCheck, CheckCircle2 } from "lucide-react";
import { questions } from "./quiz-data";
import { computeResult, type Answers, type Result } from "./scoring";
import { Combobox, type ComboOption } from "./Combobox";
import { loadCountries, type CountryOpt } from "./geo";
import { cn } from "@/lib/utils";

type Screen = "intro" | "quiz" | "gate" | "results";

// Oferta y pago con PayPal. El Client ID es público (se usa en el SDK del
// navegador); el secreto vive solo en el servidor (.env.local). El precio real
// del cobro se controla desde el backend con PAYPAL_PRICE.
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const OFFER_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD";
const OFFER_PRICE = "97";
const OFFER_PRICE_OLD = "497";
const OFFER_PRODUCT = "Programa Iglesia Digital";

export function AuditQuiz() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [lead, setLead] = useState({ name: "", church: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (key: string) => setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
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
    // Todos los campos son obligatorios; mostramos errores en línea.
    const name = lead.name.trim();
    const church = lead.church.trim();
    const email = lead.email.trim();
    const errs: Record<string, string> = {};
    if (!name) errs.name = "Escribe tu nombre";
    if (!church) errs.church = "Escribe el nombre de tu iglesia";
    if (!email) errs.email = "Escribe tu correo";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Escribe un correo válido, por ejemplo nombre@correo.com";
    if (!phoneNumber.trim()) errs.phone = "Escribe tu número de WhatsApp";
    if (!countryIso) errs.country = "Selecciona tu país";
    if (!cityName.trim()) errs.city = "Escribe tu ciudad";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollUp();
      return;
    }
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

      <div className="p-5 sm:p-11">
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
              <div className="my-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[14px] text-muted">
                <span className="inline-flex items-center gap-2 whitespace-nowrap before:h-1 before:w-1 before:rounded-full before:bg-accent before:content-['']"><b className="text-ink">8</b> preguntas</span>
                <span className="inline-flex items-center gap-2 whitespace-nowrap before:h-1 before:w-1 before:rounded-full before:bg-accent before:content-['']"><b className="text-ink">3</b> min</span>
                <span className="inline-flex items-center gap-2 whitespace-nowrap before:h-1 before:w-1 before:rounded-full before:bg-accent before:content-['']">Resultado <b className="text-ink">al instante</b></span>
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
              <Field
                label="Tu nombre"
                value={lead.name}
                onChange={(v) => { setLead({ ...lead, name: v }); clearError("name"); }}
                placeholder="Ej. Pastor Juan Pérez"
                error={errors.name}
              />
              <Field
                label="Nombre de tu iglesia"
                value={lead.church}
                onChange={(v) => { setLead({ ...lead, church: v }); clearError("church"); }}
                placeholder="Ej. Iglesia Vida Nueva"
                error={errors.church}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Correo"
                  type="email"
                  value={lead.email}
                  onChange={(v) => { setLead({ ...lead, email: v }); clearError("email"); }}
                  placeholder="tu@correo.com"
                  error={errors.email}
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
                      onChange={(e) => { setPhoneNumber(e.target.value.replace(/[^0-9]/g, "")); clearError("phone"); }}
                      placeholder="Número"
                      aria-invalid={!!errors.phone}
                      className={cn(
                        "w-full rounded-[11px] border bg-panel2 px-3.5 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#5a638f] focus:border-accent",
                        errors.phone ? "border-red-500/70" : "border-line"
                      )}
                    />
                  </div>
                  {errors.phone && <p className="mt-1.5 text-[12.5px] text-red-400">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="mb-4">
                  <label className="mb-1.5 block text-[13.5px] font-medium text-muted">País</label>
                  <Combobox
                    value={countryIso}
                    onChange={(v) => { setCountryIso(v); clearError("country"); }}
                    options={countryOptions}
                    loading={countries.length === 0}
                    placeholder="Selecciona tu país"
                    searchPlaceholder="Buscar país…"
                    className={cn("w-full", errors.country && "ring-1 ring-red-500")}
                  />
                  {errors.country && <p className="mt-1.5 text-[12.5px] text-red-400">{errors.country}</p>}
                </div>
                <Field
                  label="Ciudad"
                  value={cityName}
                  onChange={(v) => { setCityName(v); clearError("city"); }}
                  placeholder="Escribe tu ciudad"
                  error={errors.city}
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

              <div className="mt-6 overflow-hidden rounded-[18px] border border-line2 bg-panel2 p-4 sm:p-7">
                {/* VSL */}
                <div className="text-center">
                  <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">Antes de agendar, mira esto</div>
                  <h3 className="mt-1.5 font-display text-[22px] font-bold">Así ayudamos a iglesias como la tuya</h3>
                </div>
                <div className="mt-5 -mx-4 sm:mx-0">
                  <VslPlaceholder />
                </div>

                {/* Oferta especial + pago */}
                <div className="mt-9 rounded-[16px] border border-accent/40 bg-gradient-to-b from-accent/[0.12] to-transparent p-6 text-center sm:p-7">
                  <CountdownOffer seconds={600} />
                  <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">
                    🎉 Precio de aniversario · Solo por poco tiempo
                  </div>
                  <h3 className="mt-2 font-display text-[clamp(21px,3vw,25px)] font-bold">
                    Lleva el {OFFER_PRODUCT} hoy
                  </h3>
                  <div className="mt-4 flex items-end justify-center gap-3">
                    <span className="text-[26px] font-semibold text-red-500 line-through">${OFFER_PRICE_OLD} {OFFER_CURRENCY}</span>
                    <span className="font-display text-[clamp(34px,6vw,44px)] font-extrabold leading-none text-green-400">
                      ${OFFER_PRICE} {OFFER_CURRENCY}
                    </span>
                  </div>
                  <p className="mx-auto mt-3 max-w-[46ch] text-[14.5px] text-muted">
                    Incluye acceso al <b className="text-ink">curso de 16 semanas</b> con <b className="text-ink">Zoom en vivo cada 15 días</b>.
                  </p>
                  <div className="mx-auto mt-6 max-w-[420px]">
                    <PayPalCheckout lead={{ name: lead.name, email: lead.email, church: lead.church }} />
                  </div>
                </div>
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

/* Cuenta regresiva de la oferta. Arranca cuando el bloque entra en pantalla
   (al bajar y ver el pago), baja hasta 00:00 y se queda ahí. No se guarda en el
   navegador, así que si el visitante vuelve a entrar, la cuenta empieza de nuevo. */
function CountdownOffer({ seconds = 600 }: { seconds?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [left, setLeft] = useState(seconds);

  // Se activa al entrar en el viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Tic-tac una vez activa; se detiene sola al llegar a 0.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const done = left === 0;

  return (
    <div ref={ref} className="mb-4 flex flex-col items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {done ? "La oferta está por cerrar" : "Esta oferta expira en"}
      </span>
      <div
        className={cn(
          "flex items-center gap-1.5 font-display text-[32px] font-extrabold tabular-nums",
          done ? "text-red-500" : "text-accent"
        )}
      >
        <span className="rounded-lg bg-panel3 px-2.5 py-1">{mm}</span>
        <span>:</span>
        <span className="rounded-lg bg-panel3 px-2.5 py-1">{ss}</span>
      </div>
    </div>
  );
}

/* Pago embebido con PayPal (botones inteligentes + tarjeta sin cuenta).
   El SDK se carga con el Client ID público. La orden se crea y se captura en el
   servidor (/api/paypal/*), donde vive el secreto y el precio real del cobro.
   Prellenamos y enviamos los datos del lead para poder ligarlo al pago. */
function PayPalCheckout({
  lead,
}: {
  lead: { name: string; email: string; church?: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "paid" | "error">("idle");
  const [msg, setMsg] = useState("");
  // Mantiene los datos del lead frescos dentro de los callbacks del SDK.
  const leadRef = useRef(lead);
  leadRef.current = lead;

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) return;
    let cancelled = false;

    const render = () => {
      const paypal = (window as any).paypal;
      if (!paypal || !ref.current || cancelled) return;
      ref.current.innerHTML = "";
      paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "pill", label: "pay" },
          createOrder: async () => {
            const r = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(leadRef.current),
            });
            const d = await r.json();
            if (!d.id) throw new Error(d.error || "No se pudo crear la orden");
            return d.id as string;
          },
          onApprove: async (data: any) => {
            const r = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID, ...leadRef.current }),
            });
            const d = await r.json();
            if (d.status === "COMPLETED") {
              setStatus("paid");
            } else {
              setStatus("error");
              setMsg("No pudimos confirmar el pago. Si se te cobró, escríbenos.");
            }
          },
          onError: () => {
            setStatus("error");
            setMsg("Ocurrió un error con el pago. Intenta de nuevo.");
          },
        })
        .render(ref.current);
    };

    if ((window as any).paypal) {
      render();
      return () => {
        cancelled = true;
      };
    }

    const id = "paypal-sdk";
    let s = document.getElementById(id) as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement("script");
      s.id = id;
      s.src =
        `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}` +
        `&currency=${OFFER_CURRENCY}&enable-funding=card&disable-funding=paylater`;
      s.async = true;
      s.addEventListener("load", render);
      document.body.appendChild(s);
    } else {
      s.addEventListener("load", render);
      if ((window as any).paypal) render();
    }
    return () => {
      cancelled = true;
      s?.removeEventListener("load", render);
    };
  }, []);

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="grid place-content-center gap-2 rounded-[14px] border border-dashed border-line2 bg-panel3/40 px-6 py-9 text-center">
        <span className="text-[14.5px] font-medium">Aquí se mostrará el pago con PayPal y tarjeta</span>
        <span className="text-[13px] text-muted">
          Configura <code className="text-accent-soft">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> para activarlo.
        </span>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="grid place-content-center gap-2 rounded-[14px] border border-good/40 bg-good/[0.08] px-6 py-9 text-center">
        <span className="flex items-center justify-center gap-2 text-[15.5px] font-semibold text-good">
          <CheckCircle2 size={18} /> ¡Pago recibido! Gracias por inscribirte.
        </span>
        <span className="text-[13.5px] text-muted">Te enviaremos los siguientes pasos a {lead.email}.</span>
      </div>
    );
  }

  return (
    <div>
      <div ref={ref} />
      {status === "error" && <p className="mt-2 text-[13px] text-red-400">{msg}</p>}
      <p className="mt-3 text-[12px] text-muted">Pago seguro con PayPal · No necesitas cuenta, puedes pagar con tarjeta.</p>
    </div>
  );
}
