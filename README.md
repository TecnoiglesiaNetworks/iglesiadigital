# Iglesia Digital — Sitio + Auditoría Digital (Next.js)

Landing profesional del programa **Iglesia Digital** con la **Auditoría Digital de tu Iglesia**
(quiz de generación de leads) embebida, y captura de leads por **SendGrid**.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · SendGrid**.

## 1. Instalar y correr

```bash
npm install
cp .env.example .env.local   # y completa tus valores
npm run dev                  # http://localhost:3000
```

## 2. Variables de entorno (`.env.local`)

| Variable | Para qué |
|---|---|
| `SENDGRID_API_KEY` | Tu API key de SendGrid |
| `LEAD_FROM_EMAIL` | Remitente verificado en SendGrid (Single Sender o dominio autenticado) |
| `LEAD_FROM_NAME` | Nombre del remitente |
| `LEAD_NOTIFY_EMAIL` | A dónde te llega el aviso de cada lead nuevo |
| `NEXT_PUBLIC_BOOKING_URL` | Tu link de agenda (Calendly, TidyCal…) para la asesoría |

> El remitente **debe** estar verificado en SendGrid o los correos no salen.

## 3. Personalizar la marca (colores y tipografía)

Todo está parametrizado. Edita el bloque **BRAND TOKENS** en `src/app/globals.css`:

```css
--brand: #5B6EF5;   /* acento principal */
--gold:  #F5B740;   /* color de los botones */
--font-d: "Bricolage Grotesque";  /* titulares */
--font-b: "Inter";                 /* cuerpo */
```

Si cambias la tipografía, actualiza también el `<link>` de Google Fonts en `src/app/layout.tsx`.

## 4. El quiz (Auditoría)

- Preguntas: `src/components/quiz/quiz-data.ts`
- Puntaje / niveles / tips / alerta de Google Grant: `src/components/quiz/scoring.ts`
- UI: `src/components/quiz/AuditQuiz.tsx`

Flujo: intro → 8 preguntas → captura de datos → resultado. Al capturar, se hace `POST /api/lead`,
que **recalcula el puntaje en el servidor**, envía el reporte al prospecto y te avisa a ti.

## 5. Estructura

```
src/
  app/            layout, page, globals.css, api/lead/route.ts
  components/
    site/         Navbar, Hero, Marquee, Bento, Stats, Grant, Pillars, Steps,
                  Testimonials, ForWhom, Pricing, Faq, FinalCta, Footer, Reveal
    quiz/         AuditQuiz, quiz-data, scoring
    ui/           button (primitivo estilo shadcn)
  lib/            utils (cn), sendgrid
  emails/         report-template (correos HTML)
```

## 6. Agregar componentes de 21st.dev / shadcn

Este proyecto es compatible con el registro de shadcn (que usa 21st.dev). Para instalar un componente:

```bash
npx shadcn@latest add "https://21st.dev/r/<autor>/<componente>"
```

Se instala en `src/components/ui`. Úsalos donde quieras subir el nivel visual (marquees,
bento, testimonios animados, etc.). Ya dejamos `cn()` y la estructura que esperan.

## 7. Reemplazar antes de publicar

- **Testimonios reales** (con foto, iglesia y ciudad) → `src/components/site/Testimonials.tsx`
- **Precio** si cambia → `src/components/site/Pricing.tsx`
- **Link de checkout** (Hotmart) donde corresponda
- **Logo**: hoy es una marca tipográfica; sustituye por tu SVG en `Navbar.tsx` y `Footer.tsx`

## 8. Deploy

Recomendado **Vercel**: importa el repo, agrega las variables de entorno y listo.
También corre en cualquier host con Node 18+.
