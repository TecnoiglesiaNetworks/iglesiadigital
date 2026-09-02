/* =====================================================================
   Configuración EFECTIVA del webinar: mezcla los ajustes editables desde
   el admin (nombre, fecha/hora, link de YouTube) sobre los valores por
   defecto de webinar.ts, y calcula automáticamente las etiquetas humanas y
   la tabla de horarios por país a partir de la fecha/hora elegida.

   Solo servidor (usa la base de datos). El landing lo recibe por props.
   ===================================================================== */
import { getSetting } from "./db";
import { WEBINAR } from "./webinar";

export type WebinarConfig = {
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

// Regiones para la tabla de horarios (zona IANA → se calcula la hora local).
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
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d); // p. ej. "8:00 PM"
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
    if (wd !== baseWd) time += ` (${wd})`; // p. ej. España cae en miércoles
    return { region: r.label, time };
  });
}

// Mezcla ajustes del admin sobre los valores por defecto.
export function resolveWebinarConfig(): WebinarConfig {
  const startsAt = getSetting("webinar_starts_at") || WEBINAR.startsAt;
  return {
    title: getSetting("webinar_title") || WEBINAR.title,
    subtitle: getSetting("webinar_subtitle") || WEBINAR.subtitle,
    startsAt,
    durationMin: WEBINAR.durationMin,
    dateLabel: dateLabelFor(startsAt),
    timeLabel: timeLabelFor(startsAt),
    timeZoneMain: WEBINAR.timeZoneMain,
    times: timesFor(startsAt),
    youtubeUrl: getSetting("webinar_youtube_url") || "",
    whatsappGroupUrl: WEBINAR.whatsappGroupUrl,
    joinImage: WEBINAR.joinImage,
  };
}
