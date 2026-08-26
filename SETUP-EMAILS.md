# Activar el sistema de emails (Resend + secuencia automática)

Guía para el developer. Al terminar, el sitio enviará:
1. El **reporte del diagnóstico** (cuando alguien termina el quiz).
2. La **secuencia de seguimiento** (6 correos a los leads que no pagan; se detiene sola al pagar).

Todo el envío usa **Resend**. La secuencia se dispara con una **tarea programada** que llama a un endpoint cada 15 minutos.

---

## 1. Resend: cuenta y dominio

1. Crear cuenta en https://resend.com
2. **Verificar un dominio** (Domains → Add Domain): p. ej. `iglesiadigital.net` o `tecnoiglesia.com`.
   - Resend da unos registros **DNS** (SPF/DKIM). Agrégalos en el DNS del dominio y espera a que Resend los marque como *Verified*.
   - ⚠️ El remitente (`LEAD_FROM_EMAIL`) **debe** pertenecer a ese dominio verificado.
3. **API Keys → Create API Key**. Recomendado: permiso **"Sending access"** (solo enviar). Copia la key (`re_...`).

---

## 2. Variables de entorno en Coolify

En Coolify → la aplicación → **Environment Variables**, agrega/verifica:

```
# Correos (Resend)
RESEND_API_KEY     = re_...                       # la API key de Resend
LEAD_FROM_EMAIL    = hola@iglesiadigital.net      # correo del dominio verificado en Resend
LEAD_FROM_NAME     = Pedro Abiú · Iglesia Digital
LEAD_NOTIFY_EMAIL  = correo@tudominio.com         # (opcional) aviso de cada lead nuevo

# Secuencia de emails
CRON_SECRET        = <cadena-larga-aleatoria>     # p. ej. `openssl rand -hex 24`
PUBLIC_BASE_URL    = https://iglesiadigital.net   # para los enlaces de los correos
```

> Ya deberían existir de antes (no borrar): `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`,
> `PAYPAL_ENV=live`, `PAYPAL_PRICE=97.00`, `PAYPAL_CURRENCY=USD`, `PAYPAL_PRODUCT_NAME`,
> `ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET`, `DB_PATH=/app/data/leads.db`, etc.

Después de guardar, haz **Redeploy** (o Restart) para que tome las variables.

---

## 3. Almacenamiento persistente (¡importante!)

La base de datos (leads, pagos, estado de la secuencia y textos editados de los correos) es
SQLite en `/app/data`. **Debe haber un volumen persistente montado ahí**, o se borra en cada deploy.

- Coolify → **Storages / Persistent Storage** → Mount Path: `/app/data`

---

## 4. Tarea programada (dispara la secuencia)

El endpoint que procesa y envía los correos que ya tocan es:

```
GET/POST  /api/cron/email-sequence?key=<CRON_SECRET>
```

Configúralo para que se llame **cada 15 minutos**. Dos opciones:

### Opción A — Coolify Scheduled Task
Coolify → la aplicación → **Scheduled Tasks** → New:
- **Command:** `curl -fsS "https://iglesiadigital.net/api/cron/email-sequence?key=EL_MISMO_CRON_SECRET"`
- **Frequency (cron):** `*/15 * * * *`

> ⚠️ Usa la **URL pública** (no `localhost:3000`). Las Scheduled Tasks de Coolify pueden
> correr en un contenedor donde la app no escucha en localhost, y el curl fallaría.

### Opción B — Cron externo (más confiable)
Un servicio como https://cron-job.org o https://console.cron-job.org apuntando a:
```
https://iglesiadigital.net/api/cron/email-sequence?key=EL_MISMO_CRON_SECRET
```
cada 15 minutos. (Método independiente de Coolify; suele ser el más estable.)

### Verificación rápida del cron (hazlo a mano una vez)
Ejecuta en cualquier terminal (con la key real):
```
curl "https://iglesiadigital.net/api/cron/email-sequence?key=EL_CRON_SECRET"
```
Debe responder `{"ok":true,"sent":N,"errors":0}`. Si `sent` es mayor a 0, mandó los correos
que estaban pendientes → el endpoint funciona y solo faltaba que algo lo llamara cada 15 min.

Respuesta esperada del endpoint: `{"ok":true,"sent":N,"errors":0}`.

---

## 5. Verificación

1. **Reporte:** completa el diagnóstico con un correo propio → debe llegar el reporte (confirma Resend).
2. **Secuencia manual:** en `/admin`, abre tu lead → tarjeta *Secuencia de emails* → **"Enviar siguiente ahora"**. Debe llegar el correo y registrarse en el historial.
3. **Automático:** dispara el endpoint del cron a mano una vez:
   ```
   curl "https://iglesiadigital.net/api/cron/email-sequence?key=EL_CRON_SECRET"
   ```
   Debe responder `{"ok":true,...}`.
4. En `/admin` → botón **✉ Emails**: ahí se ve el estado, cuántos correos se enviaron y se pueden **editar los textos**.

---

## Notas de operación

- La secuencia se **detiene sola** cuando el lead paga.
- Un lead entra a la secuencia al **terminar el quiz** (primer correo ~2 h después). Los leads
  ya existentes se pueden iniciar manualmente desde su ficha ("Iniciar secuencia").
- Los tiempos son: al momento, día 1, 2, 3, 5 y 7.
- Los textos de los correos se editan desde `/admin` → **✉ Emails** → *Editar* (no requiere tocar código).
- **Seguridad:** `RESEND_API_KEY` y `PAYPAL_SECRET` son solo del servidor (nunca llegan al navegador
  porque no tienen prefijo `NEXT_PUBLIC_`). No los subas al repo; van solo en Coolify.
