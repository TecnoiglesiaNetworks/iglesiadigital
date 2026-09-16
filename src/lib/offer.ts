/* =====================================================================
   Fecha límite de la oferta (cuenta regresiva del quiz y de /oferta).
   Se guarda en app_settings ("offer_deadline") como ISO con offset CDMX.
   Si no está configurada, se usa el valor por defecto de abajo. Solo servidor.
   ===================================================================== */
import { getSetting } from "./db";

// Por defecto: domingo 20 de septiembre de 2026, 12:00 AM (CDMX, -06:00).
export const DEFAULT_OFFER_DEADLINE = "2026-09-20T00:00:00-06:00";
export const OFFER_DEADLINE_KEY = "offer_deadline";

export function getOfferDeadline(): string {
  return getSetting(OFFER_DEADLINE_KEY) || DEFAULT_OFFER_DEADLINE;
}
