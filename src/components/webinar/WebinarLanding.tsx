"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Radio,
  Search,
  Megaphone,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  Globe2,
  MonitorPlay,
  Filter,
  HeartHandshake,
  Users,
  Video,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WEBINAR } from "@/lib/webinar";
import type { WebinarConfig } from "@/lib/webinar-config";
import { Combobox, type ComboOption } from "@/components/quiz/Combobox";
import { loadCountries, type CountryOpt } from "@/components/quiz/geo";

const BENEFITS = [
  {
    icon: Search,
    title: "Google Ad Grant: $10,000 USD/mes",
    body: "Cómo calificar y activar la publicidad gratuita de Google para que tu iglesia aparezca cuando alguien busca fe, ayuda o una iglesia cerca.",
  },
  {
    icon: MonitorPlay,
    title: "Tu sitio web y servicio en línea",
    body: "Cómo crear una web efectiva y montar tu servicio digital (Church Online Platform) para recibir y transmitir a los que llegan.",
  },
  {
    icon: Filter,
    title: "El embudo de conversión digital",
    body: "El sistema para convertir visitas y clics en decisiones espirituales, con formularios de seguimiento que capturan a cada persona.",
  },
  {
    icon: HeartHandshake,
    title: "Seguimiento y afirmación",
    body: "Cómo dar seguimiento espiritual y conectar a los nuevos en grupos de afirmación en línea para que no se pierdan.",
  },
  {
    icon: Megaphone,
    title: "Redes y publicidad que alcanzan",
    body: "Contenido con impacto emocional y anuncios simples para crecer en redes y llenar tus servicios con personas de tu ciudad.",
  },
  {
    icon: Sparkles,
    title: "IA para el ministerio",
    body: "Herramientas de inteligencia artificial (como SmartReach Ads) que te ahorran horas creando, publicando y dando seguimiento.",
  },
  {
    icon: Users,
    title: "Tu equipo digital",
    body: "Cómo armar el equipo ideal, definir roles y responsables, y crear la estructura operativa que sostiene todo el ministerio digital.",
  },
  {
    icon: Video,
    title: "Transmisiones que conectan",
    body: "Los roles clave en el streaming y la producción de video, y cómo evitar los errores comunes en tus servicios en vivo.",
  },
  {
    icon: Rocket,
    title: "Lanzamiento y semana de impacto",
    body: "Cómo planificar y ejecutar tu evento digital para maximizar el día del lanzamiento y convertir el alcance en personas conectadas.",
  },
];

function useCountdown(target: string) {
  const targetMs = useMemo(() => new Date(target).getTime(), [target]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null; // Evita hidratación desajustada.
  const diff = Math.max(0, targetMs - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: diff === 0,
  };
}

/* Título del webinar replicado en código (dorado metálico animado + glow).
   Se mantiene como <h1> con el texto real para SEO/lectores de pantalla. */
function WebinarTitle({ title, isDefault }: { title: string; isDefault: boolean }) {
  // Título editable: si es el nombre por defecto, mantenemos el arte animado
  // de 4 líneas; si lo cambiaron desde el admin, mostramos el nuevo nombre con
  // un estilo dorado limpio (para que funcione con cualquier texto).
  if (!isDefault) {
    return (
      <h1 className="mt-5 flex flex-col items-center text-center font-display font-extrabold uppercase leading-[1.02]">
        <span className="block wtitle-gold text-[clamp(30px,6.5vw,60px)]">{title}</span>
        <span className="wtitle-spark mx-auto mt-4" aria-hidden />
        <span className="mt-2 block wtitle-white text-[clamp(15px,2.6vw,22px)] font-semibold normal-case tracking-wide opacity-95">
          Webinar Gratuito
        </span>
      </h1>
    );
  }
  return (
    <h1 className="mt-5 flex flex-col items-center text-center font-display font-extrabold uppercase leading-[0.95]">
      <span className="block wtitle-white text-[clamp(34px,7vw,64px)]">La Gran</span>
      <span className="block wtitle-white text-[clamp(34px,7vw,64px)]">Comisión</span>

      <span className="my-2.5 flex items-center justify-center gap-3">
        <span className="wtitle-line w-[clamp(18px,7vw,80px)] flex-none" aria-hidden />
        <span className="wtitle-gold whitespace-nowrap text-[clamp(20px,4.4vw,40px)] tracking-wide">También es</span>
        <span className="wtitle-line w-[clamp(18px,7vw,80px)] flex-none" aria-hidden />
      </span>

      <span className="block wtitle-gold text-[clamp(46px,10vw,88px)] leading-[0.9]">Digital</span>

      {/* Destello/línea centrada entre DIGITAL y el subtítulo (como el arte). */}
      <span className="wtitle-spark mx-auto mt-3.5" aria-hidden />

      <span className="mt-2 block wtitle-white text-[clamp(15px,2.6vw,22px)] font-semibold normal-case tracking-wide opacity-95">
        Webinar Gratuito
      </span>
    </h1>
  );
}

/* Foto del presentador. Reutiliza la del home (/founder/pedro-abiu.jpg);
   si falta, muestra las iniciales automáticamente. */
function PresenterPhoto() {
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth === 0) setErr(true);
  }, []);
  if (!err) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        ref={ref}
        src="/founder/pedro-abiu.jpg"
        alt="Pedro Abiú"
        onError={() => setErr(true)}
        className="mx-auto h-[150px] w-[150px] flex-none rounded-full border border-line2 object-cover sm:mx-0"
      />
    );
  }
  return (
    <div className="mx-auto grid h-[150px] w-[150px] flex-none place-items-center rounded-full border border-line2 bg-gradient-to-br from-brand to-brand2 font-display text-[44px] font-bold text-white sm:mx-0">
      PA
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="grid h-[62px] w-[62px] place-items-center rounded-xl border border-line2 bg-panel2 font-display text-[28px] font-bold tabular-nums text-ink sm:h-[74px] sm:w-[74px] sm:text-[34px]">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-2 text-[11px] uppercase tracking-wider text-muted">{label}</span>
    </div>
  );
}

export function WebinarLanding({ cfg }: { cfg: WebinarConfig }) {
  const cd = useCountdown(cfg.startsAt);
  const [done, setDone] = useState(false);

  return (
    <div className="relative z-10">
      {/* ── HERO + FORM ─────────────────────────────────────────── */}
      <section className="container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Columna izquierda: mensaje */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-accent">
            <Radio size={14} /> Webinar gratuito · En vivo
          </div>

          <WebinarTitle title={cfg.title} isDefault={cfg.title === WEBINAR.title} />
          <p className="mt-5 max-w-[54ch] text-[clamp(16px,2.4vw,19px)] text-muted">
            {cfg.subtitle}
          </p>

          {/* Contador */}
          {cd && !cd.ended && (
            <div className="mt-8">
              <p className="mb-3 text-[13px] uppercase tracking-wider text-muted">El webinar comienza en</p>
              <div className="flex justify-center gap-3 sm:gap-4">
                <Unit value={cd.days} label="Días" />
                <Unit value={cd.hours} label="Horas" />
                <Unit value={cd.minutes} label="Min" />
                <Unit value={cd.seconds} label="Seg" />
              </div>
            </div>
          )}
          {cd?.ended && (
            <p className="mt-8 text-[15px] font-semibold text-accent">¡El webinar está por comenzar! Revisa tu correo. 📩</p>
          )}

          {/* Fecha y hora */}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-panel px-4 py-3 text-[15px] font-semibold text-ink">
              <CalendarDays size={18} className="text-brand" /> {cfg.dateLabel}
            </div>
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-panel px-4 py-3 text-[15px] font-semibold text-ink">
              <Clock size={18} className="text-accent" /> {cfg.timeLabel}
              <span className="text-[13px] font-normal text-muted">CDMX</span>
            </div>
          </div>

          {/* Presentador (mención breve) */}
          <div className="mt-5 inline-flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/founder/pedro-abiu.jpg"
              alt="Pedro Abiú"
              className="h-11 w-11 flex-none rounded-full border border-line2 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="text-left">
              <p className="text-[13px] uppercase tracking-wider text-muted">Impartido en vivo por</p>
              <p className="text-[15px] font-bold text-ink">Pedro Abiú · Fundador de Tecnoiglesia</p>
            </div>
          </div>

        </div>

        {/* Columna derecha: tarjeta de registro / paso 2 */}
        <div className="lg:sticky lg:top-24">
          <AnimatePresence mode="wait">
            {!done ? (
              <RegistrationCard key="form" onDone={() => setDone(true)} />
            ) : (
              <Step2Card key="step2" />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── BENEFICIOS ──────────────────────────────────────────── */}
      <section className="border-t border-line bg-bg2/40">
        <div className="container py-16 sm:py-20">
          <h2 className="text-center font-display text-[clamp(24px,4vw,34px)] font-bold text-ink">
            Lo que vas a aprender
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-center text-[16px] text-muted">
            Una hora práctica y directa. Sin relleno. Para pastores y líderes que quieren alcanzar a más personas.
          </p>

          <div className="mx-auto mt-10 grid max-w-[1040px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-line bg-panel p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-line2 bg-panel2 text-accent">
                  <b.icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-[18px] font-bold text-ink">{b.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRESENTADOR ─────────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="container py-16 sm:py-20">
          <div className="mx-auto max-w-[920px] rounded-[26px] border border-line2 bg-gradient-to-b from-panel to-bg2 p-8 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] sm:p-11">
            <div className="grid items-center gap-8 text-center sm:grid-cols-[auto_1fr] sm:text-left">
              <PresenterPhoto />
              <div>
                <span className="mb-3 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent before:h-px before:w-5 before:bg-accent before:opacity-70 before:content-['']">
                  Quién lo imparte
                </span>
                <h2 className="font-display text-[clamp(26px,3.6vw,34px)] font-bold leading-tight text-ink">Pedro Abiú</h2>
                <p className="mt-1 font-display text-[16px] font-semibold text-brand2">
                  Fundador de Tecnoiglesia y del programa Iglesia Digital
                </p>
                <p className="mt-4 text-[16.5px] text-muted">
                  Durante más de 16 años he ayudado a miles de iglesias en Latinoamérica, Estados Unidos
                  y Europa a usar la tecnología con propósito para llegar a más personas. En este webinar
                  te compartiré, sin rodeos, el mismo sistema con el que hoy pastores y líderes están
                  alcanzando a su ciudad usando Google, redes sociales, publicidad e inteligencia artificial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HORARIOS POR PAÍS ───────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="container py-16 sm:py-20">
          <div className="mx-auto max-w-[720px] text-center">
            <div className="inline-flex items-center gap-2 text-brand">
              <Globe2 size={18} />
              <span className="text-[13px] font-semibold uppercase tracking-wider">Encuentra tu horario</span>
            </div>
            <h2 className="mt-3 font-display text-[clamp(22px,3.6vw,30px)] font-bold text-ink">
              {cfg.timeLabel} hora de México — ¿y en tu país?
            </h2>
          </div>

          <div className="mx-auto mt-9 grid max-w-[820px] gap-2.5 sm:grid-cols-2">
            {cfg.times.map((t) => (
              <div
                key={t.region}
                className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3"
              >
                <span className="text-[14.5px] text-muted">{t.region}</span>
                <span className="text-[15px] font-bold text-ink">{t.time}</span>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-[52ch] text-center text-[13px] text-muted">
            El webinar se transmite en vivo. El enlace te llega por correo el día del evento.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────── */}
      <section className="border-t border-line bg-bg2/40">
        <div className="container py-16 text-center sm:py-20">
          <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(24px,4.5vw,38px)] font-extrabold leading-tight text-ink">
            La Gran Comisión no cambió. Las herramientas sí.
          </h2>
          <p className="mx-auto mt-4 max-w-[50ch] text-[16px] text-muted">
            Aparta tu lugar gratis y aprende a alcanzar a más personas para Cristo usando lo digital.
          </p>
          <a
            href="#registro"
            className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-[13px] bg-accent px-8 py-[17px] text-[17px] font-semibold text-white shadow-[0_14px_34px_-12px_rgba(255,80,1,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-soft"
          >
            Reservar mi lugar gratis
          </a>
        </div>
      </section>
    </div>
  );
}

/* ── Tarjeta de registro ───────────────────────────────────────── */
function RegistrationCard({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", city: "" });
  const [countryIso, setCountryIso] = useState("");
  const [countries, setCountries] = useState<CountryOpt[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  // Cargamos el catálogo de países (con banderas) de forma diferida.
  useEffect(() => {
    loadCountries().then(setCountries).catch(() => {});
  }, []);

  const countryOptions: ComboOption[] = useMemo(
    () =>
      countries.map((c) => ({
        value: c.iso,
        label: c.name,
        search: `${c.name} ${c.iso}`,
        flag: c.flag,
      })),
    [countries]
  );

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Escribe tu nombre";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Correo no válido";
    if (form.whatsapp.replace(/\D/g, "").length < 8) errs.whatsapp = "WhatsApp no válido";
    if (!form.city.trim()) errs.city = "Escribe tu ciudad";
    if (!countryIso) errs.country = "Selecciona tu país";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Enviamos "Ciudad, País" en el campo city (igual que el quiz).
    const countryName = countries.find((c) => c.iso === countryIso)?.name || "";
    const city = [form.city.trim(), countryName].filter(Boolean).join(", ");

    setSending(true);
    try {
      await fetch("/api/webinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, city }),
      });
    } catch (err) {
      console.error("No se pudo registrar:", err);
    } finally {
      setSending(false);
      onDone();
    }
  }

  return (
    <motion.form
      id="registro"
      onSubmit={submit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="scroll-mt-24 rounded-[24px] border border-line2 bg-gradient-to-b from-panel to-bg2 p-6 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] sm:p-8"
    >
      <h2 className="font-display text-[22px] font-bold text-ink">Aparta tu lugar gratis</h2>
      <p className="mt-1.5 text-[14px] text-muted">Cupos limitados. Te enviamos el acceso por correo.</p>

      <div className="mt-6 space-y-4">
        <WField label="Nombre completo" value={form.name} onChange={(v) => set("name", v)} error={errors.name} placeholder="Pastor Juan Pérez" />
        <WField label="Correo electrónico" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} placeholder="tucorreo@iglesia.com" />
        <WField label="WhatsApp" type="tel" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} error={errors.whatsapp} placeholder="+52 1 55 1234 5678" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13.5px] font-medium text-muted">País</label>
            <Combobox
              value={countryIso}
              onChange={(v) => { setCountryIso(v); if (errors.country) setErrors((e) => ({ ...e, country: "" })); }}
              options={countryOptions}
              loading={countries.length === 0}
              placeholder="Selecciona tu país"
              searchPlaceholder="Buscar país…"
              className={cn("w-full", errors.country && "ring-1 ring-red-500")}
            />
            {errors.country && <p className="mt-1.5 text-[12.5px] text-red-400">{errors.country}</p>}
          </div>
          <WField label="Ciudad" value={form.city} onChange={(v) => set("city", v)} error={errors.city} placeholder="Escribe tu ciudad" />
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-[13px] bg-accent px-6 py-[15px] text-[16px] font-semibold text-white shadow-[0_14px_34px_-12px_rgba(255,80,1,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-soft disabled:opacity-60"
      >
        {sending ? "Registrando…" : "Reservar mi lugar →"}
      </button>
      <p className="mt-3 text-center text-[12px] text-muted">100% gratis. Cero spam. Solo el webinar y sus recordatorios.</p>
    </motion.form>
  );
}

function WField({
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
    <div>
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

/* ── Paso 2: unirse al grupo de WhatsApp ───────────────────────── */
function Step2Card() {
  // Al tocar el grupo (imagen o botón) arrancamos un temporizador: ~10 s después
  // (tiempo de unirse en WhatsApp) mostramos "registro completo" al volver.
  const [joined, setJoined] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function markJoining() {
    if (timerRef.current) return; // no reinicia si ya está corriendo
    timerRef.current = setTimeout(() => setJoined(true), 10000);
  }

  // ── Vista final: registro completo ──────────────────────────────────────
  if (joined) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[24px] border border-line2 bg-gradient-to-b from-panel to-bg2 p-6 text-center shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] sm:p-8"
      >
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12.5px] font-semibold uppercase tracking-wider text-muted">Registro completo</span>
            <span className="font-display text-[18px] font-bold text-good">100%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              initial={{ width: "98%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-brand to-good"
            />
          </div>
        </div>

        <div className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-full bg-good/15 text-good">
          <CheckCircle2 size={30} />
        </div>
        <h2 className="mt-4 font-display text-[22px] font-bold text-ink">¡Listo! Nos vemos en el webinar 🎉</h2>
        <p className="mt-2 text-[14.5px] text-muted">
          Tu lugar está confirmado. Te avisaremos todo por el grupo de WhatsApp y te enviaremos el enlace de acceso el día del evento.
        </p>

        <a
          href={WEBINAR.whatsappGroupUrl}
          target="_blank"
          rel="noopener"
          className="mt-5 inline-flex items-center justify-center gap-2 text-[13px] font-semibold text-good underline underline-offset-2"
        >
          <MessageCircle size={15} /> ¿No alcanzaste a unirte? Entra al grupo
        </a>
      </motion.div>
    );
  }

  // ── Vista Paso 2: unirse al grupo ───────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[24px] border border-line2 bg-gradient-to-b from-panel to-bg2 p-6 text-center shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] sm:p-8"
    >
      {/* Barra de progreso: casi listo, falta el paso del grupo. */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12.5px] font-semibold uppercase tracking-wider text-muted">Tu registro casi está listo</span>
          <span className="font-display text-[18px] font-bold text-accent">98%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "98%" }}
            transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
            className="wbar-fill h-full rounded-full"
          />
        </div>
        <p className="mt-3 text-[14px] text-muted">
          Falta <b className="text-ink">1 paso obligatorio</b> para asegurar tu lugar 👇
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-accent/40 bg-accent/[0.08] p-4">
        <p className="text-[15px] font-bold text-ink">⚠️ Falta un paso más (importante)</p>
        <p className="mt-1.5 text-[14px] text-muted">
          Únete al <b className="text-ink">grupo de WhatsApp</b> del webinar. Ahí enviamos los recordatorios y el enlace de acceso el día del evento. Sin el grupo podrías perderte la sesión.
        </p>
      </div>

      {/* Imagen guía: cómo unirse (también clickeable al grupo). */}
      <a
        href={WEBINAR.whatsappGroupUrl}
        target="_blank"
        rel="noopener"
        onClick={markJoining}
        className="mt-5 block overflow-hidden rounded-xl border border-line transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
        aria-label="Unirme al grupo de WhatsApp"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={WEBINAR.joinImage}
          alt="Cómo unirte al grupo de WhatsApp"
          className="w-full"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </a>

      <a
        href={WEBINAR.whatsappGroupUrl}
        target="_blank"
        rel="noopener"
        onClick={markJoining}
        className="mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-[13px] bg-[#25D366] px-6 py-[15px] text-[16px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105"
      >
        <MessageCircle size={19} /> Unirme al grupo de WhatsApp
      </a>
      <p className="mt-3 text-[12px] text-muted">Toca el botón y luego “Unirte al grupo” dentro de WhatsApp.</p>
    </motion.div>
  );
}
