/* =====================================================================
   Conversión entre el input `datetime-local` del admin (hora CDMX, sin zona)
   y el ISO con offset que guardamos en la base. México no usa horario de
   verano desde 2022, así que CDMX es siempre -06:00.
   ===================================================================== */

// ISO con offset  →  "YYYY-MM-DDTHH:MM" en hora CDMX (para el input del admin).
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

// "YYYY-MM-DDTHH:MM" (hora CDMX)  →  ISO con offset -06:00.
export function localInputToIso(local: string): string {
  return `${local.trim()}:00-06:00`;
}
