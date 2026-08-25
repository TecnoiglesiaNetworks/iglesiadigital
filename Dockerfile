# ─────────────────────────────────────────────────────────────────────────────
# Iglesia Digital — imagen para Coolify (Next.js standalone + better-sqlite3)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-slim AS base
# Dependencias de compilación para módulos nativos (better-sqlite3) por si no hay
# binario precompilado para la plataforma.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ curl \
  && rm -rf /var/lib/apt/lists/*

# ── Dependencias ─────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Build ────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Las variables NEXT_PUBLIC_* se "hornean" en el bundle del cliente durante el
# build, así que deben estar disponibles AQUÍ (Coolify las pasa como build args).
ARG NEXT_PUBLIC_CALENDLY_URL
ARG NEXT_PUBLIC_BOOKING_URL
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ARG NEXT_PUBLIC_PAYPAL_CURRENCY
ENV NEXT_PUBLIC_CALENDLY_URL=$NEXT_PUBLIC_CALENDLY_URL
ENV NEXT_PUBLIC_BOOKING_URL=$NEXT_PUBLIC_BOOKING_URL
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_PAYPAL_CURRENCY=$NEXT_PUBLIC_PAYPAL_CURRENCY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Ruta de la base SQLite (montar un volumen persistente en /app/data en Coolify).
ENV DB_PATH=/app/data/leads.db

# Copiamos la salida standalone + estáticos + assets públicos.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Aseguramos el módulo nativo de SQLite dentro del standalone (por si el trazado
# de Next no copió el binario .node). En v11 better-sqlite3 no depende de
# `bindings`, así que basta con copiar el paquete completo (incluye build/Release).
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# Carpeta para la base de datos (se montará un volumen persistente encima).
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "server.js"]
