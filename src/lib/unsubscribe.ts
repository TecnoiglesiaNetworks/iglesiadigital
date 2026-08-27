import crypto from "crypto";

// Enlace de cancelación de suscripción con token firmado (para que nadie pueda
// dar de baja a otros). El token es un HMAC del correo con un secreto del server.
const SECRET =
  process.env.UNSUBSCRIBE_SECRET ||
  process.env.SESSION_SECRET ||
  process.env.CRON_SECRET ||
  "iglesiadigital-unsub-fallback";
const BASE = process.env.PUBLIC_BASE_URL || "https://iglesiadigital.net";

export function unsubToken(email: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 24);
}

export function unsubUrl(email: string): string {
  const e = email.trim().toLowerCase();
  return `${BASE}/api/unsubscribe?e=${encodeURIComponent(e)}&t=${unsubToken(e)}`;
}

export function verifyUnsub(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expected = unsubToken(email);
  // Comparación de tiempo constante.
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
