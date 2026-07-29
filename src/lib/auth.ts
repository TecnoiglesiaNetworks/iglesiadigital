// Sesión de administrador ligera y sin dependencias: firmamos un token con
// HMAC-SHA256 usando Web Crypto (funciona tanto en el middleware edge como en
// las rutas Node). No hay base de datos de usuarios: un único admin por env.

export const SESSION_COOKIE = "id_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function secret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASS || "cambia-esta-clave-secreta";
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createToken(username: string): Promise<string> {
  const payload = { u: username, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS };
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = b64urlEncode(await hmac(body));
  return `${body}.${sig}`;
}

export async function verifyToken(token?: string | null): Promise<{ u: string } | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  try {
    const expected = await hmac(body);
    if (!timingSafeEqual(b64urlToBytes(sig), expected)) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body)));
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { u: payload.u };
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
  secure: process.env.NODE_ENV === "production",
};
