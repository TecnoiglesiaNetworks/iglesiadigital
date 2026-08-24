import { NextResponse } from "next/server";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal";

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

    // Registro básico del pago (aparece en los logs del servidor). Aquí se puede
    // enganchar con la base de datos / pipeline para marcar al lead como pagado.
    console.log("[paypal] pago capturado", {
      orderID,
      status: data.status,
      email: body?.email,
      name: body?.name,
      church: body?.church,
    });

    return NextResponse.json({ status: data.status, id: data.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error al capturar el pago." },
      { status: 500 }
    );
  }
}
