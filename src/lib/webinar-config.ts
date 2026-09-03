/* =====================================================================
   Configuración EFECTIVA de un webinar: a partir de un registro de la tabla
   `webinars` calcula las etiquetas humanas (fecha/hora) y la tabla de horarios
   por país. Solo servidor.
   ===================================================================== */
import { WEBINAR } from "./webinar";
import { getActiveWebinar, type WebinarRow } from "./webinars-db";

export type WebinarConfig = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  startsAt: string;
  durationMin: number;
  dateLabel: string;
  timeLabel: string;
  timeZoneMain: string;
  times: { region: string; time: string }[];
  youtubeUrl: string;
  whatsappGroupUrl: string;
  joinImage: string;
};

const REGIONS: { label: string; tz: string }[] = [
  { label: "🇲🇽 México (CDMX)", tz: "America/Mexico_City" },
  { label: "🇬🇹🇸🇻🇭🇳🇳🇮🇨🇷 Centroamérica", tz: "America/Guatemala" },
  { label: "🇨🇴🇵🇪🇪🇨 Colombia · Perú · Ecuador", tz: "America/Bogota" },
  { label: "🇺🇸 EE.UU. Este (Miami/NY)", tz: "America/New_York" },
  { label: "🇺🇸 EE.UU. Centro", tz: "America/Chicago" },
  { label: "🇺🇸 EE.UU. Pacífico (Los Ángeles)", tz: "America/Los_Angeles" },
  { label: "🇧🇴🇻🇪🇩🇴 Bolivia · Venezuela · Rep. Dom.", tz: "America/La_Paz" },
  { label: "🇨🇱🇦🇷🇺🇾 Chile · Argentina · Uruguay", tz: "America/Argentina/Buenos_Aires" },
  { label: "🇪🇸 España", tz: "Europe/Madrid" },
];
const CDMX = "America/Mexico_City";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function timeIn(d: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(d);
}
function weekdayIn(d: Date, tz: string) {
  return new Intl.DateTimeFormat("es-MX", { timeZone: tz, weekday: "long" }).format(d);
}

export function dateLabelFor(startsAt: string): string {
  const d = new Date(startsAt);
  const wd = weekdayIn(d, CDMX);
  const day = new Intl.DateTimeFormat("es-MX", { timeZone: CDMX, day: "numeric" }).format(d);
  const month = new Intl.DateTimeFormat("es-MX", { timeZone: CDMX, month: "long" }).format(d);
  return `${cap(wd)} ${day} de ${month}`;
}
export function timeLabelFor(startsAt: string): string {
  return timeIn(new Date(startsAt), CDMX);
}
export function timesFor(startsAt: string): { region: string; time: string }[] {
  const d = new Date(startsAt);
  const baseWd = weekdayIn(d, CDMX);
  return REGIONS.map((r) => {
    let time = timeIn(d, r.tz);
    const wd = weekdayIn(d, r.tz);
    if (wd !== baseWd) time += ` (${wd})`;
    return { region: r.label, time };
  });
}

// Construye la config efectiva a partir de un registro de webinar.
export function configForWebinar(w: WebinarRow): WebinarConfig {
  return {
    id: w.id,
    slug: w.slug,
    title: w.title,
    subtitle: w.subtitle,
    startsAt: w.starts_at,
    durationMin: w.duration_min,
    dateLabel: dateLabelFor(w.starts_at),
    timeLabel: timeLabelFor(w.starts_at),
    timeZoneMain: WEBINAR.timeZoneMain,
    times: timesFor(w.starts_at),
    youtubeUrl: w.youtube_url,
    whatsappGroupUrl: w.whatsapp_group_url,
    joinImage: w.join_image || WEBINAR.joinImage,
  };
}

// Config del webinar activo (el destacado que se muestra en /webinar).
export function resolveWebinarConfig(): WebinarConfig {
  const w = getActiveWebinar();
  if (w) return configForWebinar(w);
  // Respaldo (no debería ocurrir tras la migración inicial).
  return {
    id: 0,
    slug: "webinar",
    title: WEBINAR.title,
    subtitle: WEBINAR.subtitle,
    startsAt: WEBINAR.startsAt,
    durationMin: WEBINAR.durationMin,
    dateLabel: dateLabelFor(WEBINAR.startsAt),
    timeLabel: timeLabelFor(WEBINAR.startsAt),
    timeZoneMain: WEBINAR.timeZoneMain,
    times: timesFor(WEBINAR.startsAt),
    youtubeUrl: "",
    whatsappGroupUrl: WEBINAR.whatsappGroupUrl,
    joinImage: WEBINAR.joinImage,
  };
}
