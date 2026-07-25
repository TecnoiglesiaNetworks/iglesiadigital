"use client";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { questions } from "./quiz-data";
import { computeResult, type Answers, type Result } from "./scoring";
import { cn } from "@/lib/utils";

type Screen = "intro" | "quiz" | "gate" | "results";
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || "#";

export function AuditQuiz() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [lead, setLead] = useState({ name: "", church: "", email: "", whatsapp: "", city: "" });
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

  const scrollUp = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

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
    if (!lead.name.trim() || !lead.email.trim()) {
      alert("Escribe al menos tu nombre y correo para enviarte el reporte.");
      return;
    }
    const res = computeResult(answers);
    setResult(res);
    setScreen("results");
    scrollUp();
    setSending(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, answers, result: res }),
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
              <p className="mt-3.5 flex justify-center gap-2 text-[12.5px] text-muted">🔒 No compartimos tus datos con nadie.</p>
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
                <Field label="Correo" type="email" value={lead.email} onChange={(v) => setLead({ ...lead, email: v })} placeholder="tu@correo.com" />
                <Field label="WhatsApp" type="tel" value={lead.whatsapp} onChange={(v) => setLead({ ...lead, whatsapp: v })} placeholder="Con clave de país" />
              </div>
              <Field label="Ciudad y país" value={lead.city} onChange={(v) => setLead({ ...lead, city: v })} placeholder="Ej. León, México" />
              <button onClick={reveal} className="btn-accent mt-1 w-full py-[18px] text-[17px]">Ver mi resultado <span>→</span></button>
              <p className="mt-3.5 flex gap-2 text-[12.5px] text-muted">🔒 Nada de spam. Solo tu diagnóstico y consejos útiles.</p>
            </motion.div>
          )}

          {screen === "results" && result && (
            <motion.div key="results" {...fade}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                {lead.name ? `${lead.name.split(" ")[0]}, este es tu diagnóstico` : "Tu diagnóstico"}
              </div>
              <h2 className="font-display text-[clamp(23px,3.4vw,30px)] font-bold">Estado digital de tu iglesia</h2>

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

              <div className="mt-6 rounded-[18px] border border-line2 bg-panel2 p-6 text-center">
                <h3 className="font-display text-[22px] font-bold">Hablemos de tu iglesia, sin costo</h3>
                <p className="mx-auto mb-4 mt-2 max-w-[42ch] text-[15px] text-muted">
                  Agenda una asesoría gratuita de 20 minutos. Revisamos tu diagnóstico juntos y te decimos por dónde empezar.
                </p>
                <a href={BOOKING_URL} target="_blank" rel="noopener" className="btn-accent w-full py-[18px] text-[17px]">
                  Agendar mi asesoría gratuita <span>→</span>
                </a>
                <span className="mt-3 block text-[13px] text-muted">
                  {sending ? "Enviando tu reporte…" : "Te enviamos también el reporte completo por correo."}{" "}
                  <a href="/temario" className="text-accent-soft">Conoce el programa completo →</a>
                </span>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13.5px] font-medium text-muted">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[11px] border border-line bg-panel2 px-3.5 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#5a638f] focus:border-accent"
      />
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
