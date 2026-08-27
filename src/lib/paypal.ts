// Utilidades de servidor para PayPal. El Client ID es público, pero el secreto y
// el precio real del cobro viven solo aquí (variables de entorno, nunca en el
// navegador). Usamos la API REST directa (sin SDK) para no agregar dependencias.

const PAYPAL_ENV = process.env.PAYPAL_ENV || "live";

export const PAYPAL_BASE =
  PAYPAL_ENV === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

export const PAYPAL_PRICE = process.env.PAYPAL_PRICE || "97.00";
export const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || "USD";
export const PAYPAL_PRODUCT_NAME =
  process.env.PAYPAL_PRODUCT_NAME || "Programa Iglesia Digital";

// El Client ID puede venir de la variable pública (misma cuenta) para no duplicar.
const CLIENT_ID =
  process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const SECRET = process.env.PAYPAL_SECRET || "";

export function paypalConfigured() {
  return Boolean(CLIENT_ID && SECRET);
}

export async function getPayPalAccessToken(): Promise<string> {
  if (!CLIENT_ID || !SECRET) {
    throw new Error("Faltan credenciales de PayPal (Client ID / Secret).");
  }
  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || "No se pudo autenticar con PayPal.");
  }
  return data.access_token as string;
}
