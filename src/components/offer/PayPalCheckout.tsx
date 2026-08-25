"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PAYPAL_CLIENT_ID, OFFER_CURRENCY } from "./config";

/* Pago embebido con PayPal (botones inteligentes + tarjeta sin cuenta).
   El SDK se carga con el Client ID público. La orden se crea y se captura en el
   servidor (/api/paypal/*), donde vive el secreto y el precio real del cobro.
   Prellenamos y enviamos los datos del lead para poder ligarlo al pago. */
export function PayPalCheckout({
  lead,
}: {
  lead: { name: string; email: string; church?: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "paid" | "error">("idle");
  const [msg, setMsg] = useState("");
  // Mantiene los datos del lead frescos dentro de los callbacks del SDK.
  const leadRef = useRef(lead);
  leadRef.current = lead;

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) return;
    let cancelled = false;

    const render = () => {
      const paypal = (window as any).paypal;
      if (!paypal || !ref.current || cancelled) return;
      ref.current.innerHTML = "";
      paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "pill", label: "pay" },
          createOrder: async () => {
            const r = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(leadRef.current),
            });
            const d = await r.json();
            if (!d.id) throw new Error(d.error || "No se pudo crear la orden");
            return d.id as string;
          },
          onApprove: async (data: any) => {
            const r = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID, ...leadRef.current }),
            });
            const d = await r.json();
            if (d.status === "COMPLETED") {
              setStatus("paid");
              // Llevamos al comprador a la página de gracias (accesos por correo).
              window.location.assign("/gracias");
            } else {
              setStatus("error");
              setMsg("No pudimos confirmar el pago. Si se te cobró, escríbenos.");
            }
          },
          onError: () => {
            setStatus("error");
            setMsg("Ocurrió un error con el pago. Intenta de nuevo.");
          },
        })
        .render(ref.current);
    };

    if ((window as any).paypal) {
      render();
      return () => {
        cancelled = true;
      };
    }

    const id = "paypal-sdk";
    let s = document.getElementById(id) as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement("script");
      s.id = id;
      s.src =
        `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}` +
        `&currency=${OFFER_CURRENCY}&enable-funding=card&disable-funding=paylater`;
      s.async = true;
      s.addEventListener("load", render);
      document.body.appendChild(s);
    } else {
      s.addEventListener("load", render);
      if ((window as any).paypal) render();
    }
    return () => {
      cancelled = true;
      s?.removeEventListener("load", render);
    };
  }, []);

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="grid place-content-center gap-2 rounded-[14px] border border-dashed border-line2 bg-panel3/40 px-6 py-9 text-center">
        <span className="text-[14.5px] font-medium">Aquí se mostrará el pago con PayPal y tarjeta</span>
        <span className="text-[13px] text-muted">
          Configura <code className="text-accent-soft">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> para activarlo.
        </span>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="grid place-content-center gap-2 rounded-[14px] border border-good/40 bg-good/[0.08] px-6 py-9 text-center">
        <span className="flex items-center justify-center gap-2 text-[15.5px] font-semibold text-good">
          <CheckCircle2 size={18} /> ¡Pago recibido! Gracias por inscribirte.
        </span>
        <span className="text-[13.5px] text-muted">Te enviaremos los siguientes pasos a {lead.email}.</span>
      </div>
    );
  }

  return (
    <div>
      {/* Fondo blanco: el formulario de tarjeta de PayPal usa texto gris oscuro
         (aviso legal, "dirección de facturación", etc.) pensado para fondo claro. */}
      <div className="rounded-2xl bg-white p-2.5 sm:p-4">
        {/* PayPal a veces colapsa el botón de tarjeta a solo el ícono cuando el
           ancho es reducido (p.ej. navegador de Instagram). Esta etiqueta deja
           claro que el botón negro también sirve para pagar con tarjeta. */}
        <p className="mb-2.5 text-center text-[12.5px] font-medium text-slate-600">
          Paga con PayPal o con tarjeta de crédito/débito 💳
        </p>
        <div ref={ref} />
      </div>
      {status === "error" && <p className="mt-2 text-[13px] text-red-400">{msg}</p>}
      <p className="mt-3 text-[12px] text-white/70">Pago seguro con PayPal · No necesitas cuenta, puedes pagar con tarjeta.</p>
    </div>
  );
}
