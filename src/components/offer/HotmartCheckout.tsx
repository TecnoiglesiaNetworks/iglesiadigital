import { HOTMART_CHECKOUT_URL, OFFER_PRICE, OFFER_CURRENCY } from "./config";

/* CTA que lleva al checkout de Hotmart a pantalla completa (checkoutMode=10).
   Preferimos el redirect en lugar de un iframe embebido porque el checkout
   embebido suele fallar dentro del navegador de Instagram/apps. Prellenamos el
   nombre y correo del lead para que Hotmart ya venga con esos datos. */
export function HotmartCheckout({
  lead,
}: {
  lead: { name: string; email: string; church?: string };
}) {
  const url = new URL(HOTMART_CHECKOUT_URL);
  if (lead.name) url.searchParams.set("name", lead.name);
  if (lead.email) url.searchParams.set("email", lead.email);

  return (
    <div>
      <a
        href={url.toString()}
        className="block w-full rounded-full bg-[#039606] px-6 py-4 text-center font-display text-[17px] font-bold leading-tight text-white shadow-[0_14px_30px_-10px_rgba(0,0,0,0.6)] transition hover:brightness-110 active:scale-[0.99]"
      >
        <span className="whitespace-nowrap">Comprar ahora</span>{" "}
        <span className="whitespace-nowrap">
          ${OFFER_PRICE} {OFFER_CURRENCY}
        </span>
      </a>
      <p className="mt-3 text-[12px] text-white/70">
        Pago seguro con Hotmart · Tarjeta de crédito/débito, PayPal y más.
      </p>
    </div>
  );
}
