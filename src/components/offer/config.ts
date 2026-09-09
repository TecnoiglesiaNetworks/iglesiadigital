// Configuración de la oferta (compartida entre el quiz y la página /oferta).
// El Client ID es público (va en el SDK del navegador). El precio real del cobro
// se define en el servidor (PAYPAL_PRICE); aquí solo son valores para mostrar.
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
export const OFFER_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD";
export const OFFER_PRICE = "97";
export const OFFER_PRICE_OLD = "497";
export const OFFER_PRODUCT = "Programa Iglesia Digital";

// Checkout de Hotmart (redirect a pantalla completa: checkoutMode=10).
// El pago se procesa en Hotmart; el botón solo lleva al comprador allá.
export const HOTMART_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL ||
  "https://pay.hotmart.com/H100082383K?checkoutMode=10&bid=1788979190330";
