"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, CheckCircle2 } from "lucide-react";

/* Paso 2 del registro al webinar: unirse al grupo de WhatsApp. 15 s después de
   montarse (formulario ya enviado) muestra "registro completo", den o no clic. */
export function Step2Card({ whatsappUrl, joinImage }: { whatsappUrl: string; joinImage: string }) {
  const [joined, setJoined] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function startTimer() {
    if (timerRef.current) return; // no reinicia si ya está corriendo
    timerRef.current = setTimeout(() => setJoined(true), 15000);
  }
  // Arranca solo al montar (15 s tras enviar el formulario).
  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const markJoining = startTimer;

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
          href={whatsappUrl}
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
        href={whatsappUrl}
        target="_blank"
        rel="noopener"
        onClick={markJoining}
        className="mt-5 block overflow-hidden rounded-xl border border-line transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
        aria-label="Unirme al grupo de WhatsApp"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={joinImage}
          alt="Cómo unirte al grupo de WhatsApp"
          className="w-full"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </a>

      <a
        href={whatsappUrl}
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
