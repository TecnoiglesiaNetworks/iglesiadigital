import { NextResponse } from "next/server";
import {
  getPayPalAccessToken,
  PAYPAL_BASE,
  PAYPAL_CURRENCY,
  PAYPAL_PRICE,
  PAYPAL_PRODUCT_NAME,
} from "@/lib/paypal";

export const runtime = "nodejs";

// Crea una orden de pago en PayPal. El monto se define en el servidor (no se
// acepta desde el cliente) para que no se pueda manipular el precio.
export async function POST() {
  try {
    const token = await getPayPalAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: PAYPAL_PRODUCT_NAME,
            amount: { currency_code: PAYPAL_CURRENCY, value: PAYPAL_PRICE },
          },
        ],
      }),
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok || !data.id) {
      return NextResponse.json(
        { error: data.message || "No se pudo crear la orden." },
        { status: 502 }
      );
    }
    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error al crear la orden." },
      { status: 500 }
    );
  }
}
