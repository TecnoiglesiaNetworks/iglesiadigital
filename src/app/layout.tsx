import type { Metadata } from "next";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { ChatwootSiteWidget } from "@/components/ChatwootWidget";
import { SITE, KEYWORDS } from "@/lib/site";
import { siteGraph } from "@/lib/structured-data";

const TITLE = "Iglesia Digital | Haz crecer tu iglesia en internet y redes — Tecnoiglesia";
const DESCRIPTION =
  "Programa de Tecnoiglesia (Pedro Abiú) para hacer crecer tu iglesia en internet y redes sociales. Aprende evangelismo digital: cómo usar las redes para llevar personas a tu iglesia, activar el Google Ad Grant ($10,000 USD/mes gratis), tu servicio en línea y el seguimiento. Diagnóstico gratis.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: TITLE,
    template: "%s · Iglesia Digital",
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: "Pedro Abiú" }, { name: "Tecnoiglesia", url: SITE.url }],
  creator: "Pedro Abiú",
  publisher: "Tecnoiglesia",
  applicationName: "Iglesia Digital",
  category: "Religión, Tecnología, Educación",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: "Iglesia Digital",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: SITE.ogImage, width: SITE.ogImageWidth, height: SITE.ogImageHeight, alt: "Iglesia Digital · Tecnoiglesia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SITE.ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={siteGraph()} />
      </head>
      <body>
        {children}
        <ChatwootSiteWidget />
      </body>
    </html>
  );
}
