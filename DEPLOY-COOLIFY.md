# Despliegue en Coolify — Iglesia Digital

Guía para desplegar el sitio + panel de leads en **Coolify** (Docker, servidor propio).

---

## 1. Sube el repositorio a Git
Coolify despliega desde un repo (GitHub/GitLab/Gitea). Asegúrate de que **NO** se suban secretos:
`.env.local` y `data/` ya están en `.gitignore`. ✅

## 2. Crea la aplicación en Coolify
1. **New Resource → Application → Public/Private Repository** y elige este repo.
2. **Build Pack: `Dockerfile`** (ya incluido en la raíz).
3. **Port (puerto expuesto): `3000`**.
4. Asigna tu **dominio** (ej. `https://iglesiadigital.net`) y activa **HTTPS/SSL**.

## 3. Almacenamiento persistente (¡IMPORTANTE!)
La base de datos de leads es SQLite en un archivo. Sin volumen, **se borra en cada deploy**.
- En Coolify → pestaña **Storages / Persistent Storage** → **Add**.
- **Mount Path (dentro del contenedor): `/app/data`**
- Guarda. (El `DB_PATH` ya apunta a `/app/data/leads.db`.)

## 4. Variables de entorno

### 4.1 De **build** (marcar como "Build Variable" / disponible en build)
Estas se hornean en el bundle del navegador; si no están en build, el calendario sale vacío:
```
NEXT_PUBLIC_CALENDLY_URL = https://calendly.com/tecnoiglesianetwork/asesoria-iglesia-digital?hide_event_type_details=1&hide_gdpr_banner=1&text_color=000000&primary_color=ff5200
NEXT_PUBLIC_BOOKING_URL  = https://calendly.com/tecnoiglesianetwork/asesoria-iglesia-digital
```

### 4.2 De **runtime** (normales)
```
ADMIN_USER                    = (tu usuario admin)
ADMIN_PASS                    = (contraseña fuerte — solo siembra el 1er usuario)
SESSION_SECRET                = (cadena larga aleatoria; genera con: openssl rand -hex 32)
PUBLIC_BASE_URL               = https://TU-DOMINIO
DB_PATH                       = /app/data/leads.db

CALENDLY_TOKEN                = (tu Personal Access Token de Calendly)
CALENDLY_WEBHOOK_SIGNING_KEY  = (el que ya generamos, en tu .env.local)
CALENDLY_EVENT_TYPE_URI       = https://api.calendly.com/event_types/b3543931-6342-41e0-bf05-128ed4fbead4

SENDGRID_API_KEY              = (tu API key de SendGrid)
LEAD_FROM_EMAIL               = hola@iglesiadigital.net
LEAD_FROM_NAME                = Iglesia Digital
LEAD_NOTIFY_EMAIL             = (correo donde recibir aviso de nuevos leads)
```
> Copia los valores de Calendly/SendGrid desde tu `.env.local` actual. **No** los subas al repo.

## 5. Deploy
Dale **Deploy**. La primera build tarda unos minutos (compila e instala todo).

## 6. Después del primer deploy: registrar el webhook de Calendly
Esto hace que Calendly avise a tu sitio cuando alguien agenda. Solo se hace **una vez**.

1. Entra al panel: `https://TU-DOMINIO/admin` e inicia sesión.
2. Registra el webhook (elige una opción):

**Opción A — desde tu terminal** (reemplaza dominio, usuario y contraseña):
```bash
# 1) inicia sesión y guarda la cookie
curl -s -c cookie.txt -X POST https://TU-DOMINIO/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"TU_USUARIO","password":"TU_PASSWORD"}'

# 2) registra el webhook
curl -s -b cookie.txt -X POST https://TU-DOMINIO/api/admin/calendly-webhook-setup
```
Debe responder `{"ok":true, "callbackUrl":"https://TU-DOMINIO/api/calendly/webhook", ...}`.

3. Verifícalo en Calendly → **Integraciones → Webhooks** (debe aparecer la suscripción a `invitee.created` / `invitee.canceled`).

## 7. Listo ✅
- Alguien hace el quiz → deja su correo → se guarda como lead.
- Agenda en Calendly (solo la programación **"Asesoría Iglesia Digital"**) → el lead pasa solo a **"Cita agendada"**.
- Cancela → pasa a **"Reagendar"**.
- El botón **"Sincronizar Calendly"** del panel sirve de respaldo manual.

---

## Notas
- **Backups:** respalda el volumen `/app/data` (ahí vive `leads.db`). Un simple copiado del archivo basta.
- **Actualizaciones:** cada `git push` + Deploy reconstruye la imagen; la base persiste en el volumen.
- **Reset de acceso:** si olvidas la contraseña, borra el usuario en la base o crea otro; `ADMIN_USER/ADMIN_PASS` solo siembran el primer usuario cuando la tabla está vacía.
