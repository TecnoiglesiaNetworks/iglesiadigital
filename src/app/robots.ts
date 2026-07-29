import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Todos los buscadores y bots de IA (ChatGPT/GPTBot, ClaudeBot, PerplexityBot,
      // Google-Extended, etc.) pueden indexar el sitio para dar respuestas.
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
