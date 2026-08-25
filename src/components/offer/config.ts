// Configuración de la oferta (compartida entre el quiz y la página /oferta).
// El Client ID es público (va en el SDK del navegador). El precio real del cobro
// se define en el servidor (PAYPAL_PRICE); aquí solo son valores para mostrar.
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
export const OFFER_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD";
export const OFFER_PRICE = "97";
export const OFFER_PRICE_OLD = "497";
export const OFFER_PRODUCT = "Programa Iglesia Digital";
