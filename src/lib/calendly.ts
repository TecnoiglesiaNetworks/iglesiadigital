// Integración con Calendly API v2.
// Requiere un Personal Access Token en CALENDLY_TOKEN.
// https://developer.calendly.com/api-docs

const API = "https://api.calendly.com";

function token(): string {
  const t = process.env.CALENDLY_TOKEN;
  if (!t) throw new Error("Falta CALENDLY_TOKEN en las variables de entorno.");
  return t;
}

async function cget<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Calendly ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

type CurrentUser = { resource: { uri: string; current_organization: string } };

export async function getOrgAndUser(): Promise<{ user: string; organization: string }> {
  const me = await cget<CurrentUser>(`${API}/users/me`);
  return { user: me.resource.uri, organization: me.resource.current_organization };
}

type ScheduledEvent = {
  uri: string;
  start_time: string;
  status: string; // active | canceled
  event_type: string; // URI del tipo de evento
};
type EventInvitee = { email: string; status: string };

// Si está configurado, solo procesamos citas de esta programación
// (p. ej. "Asesoría Iglesia Digital"), ignorando el resto de tipos de evento.
export function eventTypeFilter(): string | null {
  return process.env.CALENDLY_EVENT_TYPE_URI || null;
}

// Trae las citas recientes y sus invitados; devuelve un mapa email → cita.
// Sirve para el botón "Sincronizar con Calendly" (backfill de lo que ya se agendó).
export async function fetchRecentBookings(
  sinceDays = 60
): Promise<{ email: string; startTime: string; uri: string; canceled: boolean }[]> {
  const { organization } = await getOrgAndUser();
  const minStart = new Date(Date.now() - sinceDays * 864e5).toISOString();
  const typeFilter = eventTypeFilter();

  const out: { email: string; startTime: string; uri: string; canceled: boolean }[] = [];
  let pageUrl =
    `${API}/scheduled_events?organization=${encodeURIComponent(organization)}` +
    `&min_start_time=${encodeURIComponent(minStart)}&count=100&sort=start_time:desc` +
    (typeFilter ? `&event_type=${encodeURIComponent(typeFilter)}` : "");

  // Paginamos por eventos y, por cada uno, pedimos sus invitados.
  for (let guard = 0; guard < 20 && pageUrl; guard++) {
    const page = await cget<{ collection: ScheduledEvent[]; pagination: { next_page: string | null } }>(
      pageUrl
    );
    for (const ev of page.collection) {
      // Seguro extra: si la API no filtró, descartamos otros tipos de evento.
      if (typeFilter && ev.event_type !== typeFilter) continue;
      const uuid = ev.uri.split("/").pop();
      const inv = await cget<{ collection: EventInvitee[] }>(
        `${API}/scheduled_events/${uuid}/invitees?count=100`
      );
      for (const i of inv.collection) {
        out.push({
          email: i.email.toLowerCase(),
          startTime: ev.start_time,
          uri: ev.uri,
          canceled: ev.status === "canceled" || i.status === "canceled",
        });
      }
    }
    pageUrl = page.pagination.next_page || "";
  }
  return out;
}

// Verifica la firma del webhook de Calendly (header Calendly-Webhook-Signature).
// Formato: "t=<timestamp>,v1=<hmacHex>"  → HMAC-SHA256 de `${t}.${body}`.
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  const key = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!key) return false;
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.trim().split("=") as [string, string])
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(`${t}.${rawBody}`));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === v1;
}

// Registra la suscripción al webhook (llamar una sola vez, ver ruta /api/admin/calendly-webhook-setup).
export async function createWebhookSubscription(callbackUrl: string, signingKey: string) {
  const { organization, user } = await getOrgAndUser();
  const res = await fetch(`${API}/webhook_subscriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url: callbackUrl,
      events: ["invitee.created", "invitee.canceled"],
      organization,
      user,
      scope: "user",
      signing_key: signingKey,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Calendly ${res.status}: ${JSON.stringify(json).slice(0, 400)}`);
  return json;
}
