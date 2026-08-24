import { NextResponse } from "next/server";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal";
import { markPaidByEmail } from "@/lib/db";

export const runtime = "nodejs";

// Captura (cobra) una orden previamente aprobada por el comprador. Devuelve el
// estado final; el frontend muestra "pago recibido" cuando es COMPLETED.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderID = body?.orderID;
    if (!orderID || typeof orderID !== "string") {
      return NextResponse.json({ error: "Falta orderID." }, { status: 400 });
    }

    const token = await getPayPalAccessToken();
    const res = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "No se pudo capturar el pago." },
        { status: 502 }
      );
    }

    console.log("[paypal] pago capturado", {
      orderID,
      status: data.status,
      email: body?.email,
      name: body?.name,
      church: body?.church,
    });

    // Si el cobro se completó, marcamos al lead como pagado en el panel.
    if (data.status === "COMPLETED") {
      try {
        const cap = data?.purchase_units?.[0]?.payments?.captures?.[0];
        const email = String(body?.email || data?.payer?.email_address || "").trim();
        if (email) {
          markPaidByEmail(email, {
            name: body?.name,
            orderId: data.id || orderID,
            amount: cap?.amount?.value,
            currency: cap?.amount?.currency_code,
          });
        }
      } catch (dbErr) {
        console.error("[paypal] no se pudo marcar el lead como pagado:", dbErr);
      }
    }

    return NextResponse.json({ status: data.status, id: data.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error al capturar el pago." },
      { status: 500 }
    );
  }
}
