"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Widget de chat (Chatwoot). Burbuja minimizada; no se abre sola.
const BASE_URL = "https://support.tecnoiglesia.net";
const WEBSITE_TOKEN = "1ozHKsZszetSZjzfagpQXbMS";

// Carga el SDK de Chatwoot (una sola vez por página).
export function ChatwootWidget() {
  useEffect(() => {
    if (document.getElementById("chatwoot-sdk")) return;

    (window as any).chatwootSettings = {
      position: "right",
      type: "standard",
      launcherTitle: "¿Dudas? Escríbenos",
    };

    const g = document.createElement("script");
    g.id = "chatwoot-sdk";
    g.src = `${BASE_URL}/packs/js/sdk.js`;
    g.async = true;
    g.onload = () => {
      (window as any).chatwootSDK?.run({
        websiteToken: WEBSITE_TOKEN,
        baseUrl: BASE_URL,
      });
    };
    document.body.appendChild(g);
  }, []);

  return null;
}

// Para el layout global: muestra el chat en todo el sitio público, EXCEPTO en
// el panel /admin y en /diagnostico (ahí se controla aparte, solo en resultados).
export function ChatwootSiteWidget() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/diagnostico")) return null;
  return <ChatwootWidget />;
}
