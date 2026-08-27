import { verifyUnsub } from "@/lib/unsubscribe";
import { unsubscribeByEmail } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(title: string, message: string) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title></head>
  <body style="margin:0;background:#0e0a1f;color:#e8e8f0;font-family:Arial,Helvetica,sans-serif;display:grid;min-height:100vh;place-items:center">
    <div style="max-width:460px;padding:36px;text-align:center">
      <div style="color:#FF5001;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700">Iglesia Digital</div>
      <h1 style="font-size:22px;margin:16px 0 8px">${title}</h1>
      <p style="color:#b7b7cc;font-size:15px;line-height:1.6">${message}</p>
    </div>
  </body></html>`;
}

function processUnsub(url: string): boolean {
  const u = new URL(url);
  const email = (u.searchParams.get("e") || "").trim().toLowerCase();
  const token = (u.searchParams.get("t") || "").trim();
  if (!verifyUnsub(email, token)) return false;
  try {
    unsubscribeByEmail(email);
    return true;
  } catch {
    return false;
  }
}

// Clic humano desde el pie del correo → procesa y muestra confirmación.
export async function GET(req: Request) {
  const ok = processUnsub(req.url);
  const html = ok
    ? page(
        "Suscripción cancelada",
        "Listo, ya no recibirás más correos de seguimiento. Si fue un error o cambias de opinión, escríbenos a contacto@tecnoiglesia.com."
      )
    : page(
        "Enlace no válido",
        "No pudimos procesar la cancelación. Si sigues recibiendo correos y quieres darte de baja, escríbenos a contacto@tecnoiglesia.com."
      );
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// One-click de Gmail/Yahoo (header List-Unsubscribe-Post) → POST, sin UI.
export async function POST(req: Request) {
  processUnsub(req.url);
  return new Response(null, { status: 200 });
}
