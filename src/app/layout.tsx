import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iglesia Digital · Multiplica el alcance de tu iglesia",
  description:
    "Formación de 16 semanas para pastores y líderes. Sitio web, Google Ad Grant, embudo espiritual y acompañamiento en vivo. Haz tu diagnóstico digital gratis.",
  openGraph: {
    title: "Iglesia Digital · Multiplica el alcance de tu iglesia",
    description: "La misión sigue igual. Solo cambió el canal.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
