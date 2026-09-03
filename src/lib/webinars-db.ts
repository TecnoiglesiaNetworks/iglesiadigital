/* =====================================================================
   Consultas para MÚLTIPLES webinars: la tabla `webinars`, sus registros
   (`webinar_registrations`) y las invitaciones (`webinar_invites`).
   ===================================================================== */
import { db, getLead, type LeadRow } from "./db";

export type WebinarRow = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  starts_at: string;
  duration_min: number;
  youtube_url: string;
  whatsapp_group_url: string;
  join_image: string;
  active: number;
  created_at: string;
};

export type WebinarWithCount = WebinarRow & { registrations: number };

// Registro joined con datos del lead (para el pipeline del admin).
export type RegLead = LeadRow & {
  reg_id: number;
  webinar_id: number;
  reg_status: string;
  reg_attended: number;
  reg_seq_status: string;
};

// ── Slug ─────────────────────────────────────────────────────────────────────
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "webinar";
}
function uniqueSlug(base: string): string {
  let slug = base;
  let n = 2;
  while (db.prepare("SELECT 1 FROM webinars WHERE slug=?").get(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

// ── Webinars ─────────────────────────────────────────────────────────────────
export function listWebinars(): WebinarWithCount[] {
  return db
    .prepare(
      `SELECT w.*, (SELECT COUNT(*) FROM webinar_registrations r WHERE r.webinar_id = w.id) AS registrations
       FROM webinars w ORDER BY datetime(w.starts_at) DESC`
    )
    .all() as WebinarWithCount[];
}
export function getWebinarById(id: number): WebinarRow | undefined {
  return db.prepare("SELECT * FROM webinars WHERE id=?").get(id) as WebinarRow | undefined;
}
export function getWebinarBySlug(slug: string): WebinarRow | undefined {
  return db.prepare("SELECT * FROM webinars WHERE slug=?").get(slug) as WebinarRow | undefined;
}
export function getActiveWebinar(): WebinarRow | undefined {
  return (
    (db.prepare("SELECT * FROM webinars WHERE active=1 ORDER BY datetime(starts_at) DESC LIMIT 1").get() as
      | WebinarRow
      | undefined) ||
    (db.prepare("SELECT * FROM webinars ORDER BY datetime(starts_at) DESC LIMIT 1").get() as WebinarRow | undefined)
  );
}

export function createWebinar(input: {
  title: string;
  subtitle?: string;
  startsAt: string;
  youtubeUrl?: string;
  whatsappGroupUrl?: string;
  joinImage?: string;
}): WebinarRow {
  const now = new Date().toISOString();
  const slug = uniqueSlug(slugify(input.title));
  const first = (db.prepare("SELECT COUNT(*) AS c FROM webinars").get() as { c: number }).c === 0;
  const info = db
    .prepare(
      `INSERT INTO webinars
        (slug, title, subtitle, starts_at, duration_min, youtube_url, whatsapp_group_url, join_image, active, created_at)
       VALUES (@slug,@title,@subtitle,@starts_at,90,@yt,@wa,@img,@active,@now)`
    )
    .run({
      slug,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || "",
      starts_at: input.startsAt,
      yt: input.youtubeUrl?.trim() || "",
      wa: input.whatsappGroupUrl?.trim() || "",
      img: input.joinImage?.trim() || "/webinar/como-unirte-al-grupo.png",
      active: first ? 1 : 0,
      now,
    });
  return getWebinarById(Number(info.lastInsertRowid))!;
}

const WEBINAR_FIELDS = ["title", "subtitle", "starts_at", "youtube_url", "whatsapp_group_url", "join_image"] as const;
export function updateWebinar(id: number, fields: Record<string, unknown>): WebinarRow | undefined {
  const keys = Object.keys(fields).filter((k) => (WEBINAR_FIELDS as readonly string[]).includes(k));
  if (keys.length === 0) return getWebinarById(id);
  const setClause = keys.map((k) => `${k} = @${k}`).join(", ");
  const params: Record<string, unknown> = { id };
  for (const k of keys) params[k] = fields[k];
  db.prepare(`UPDATE webinars SET ${setClause} WHERE id = @id`).run(params);
  return getWebinarById(id);
}

export function setActiveWebinar(id: number): void {
  db.prepare("UPDATE webinars SET active=0").run();
  db.prepare("UPDATE webinars SET active=1 WHERE id=?").run(id);
}
export function deleteWebinar(id: number): void {
  db.prepare("DELETE FROM webinar_registrations WHERE webinar_id=?").run(id);
  db.prepare("DELETE FROM webinar_invites WHERE webinar_id=?").run(id);
  db.prepare("DELETE FROM webinars WHERE id=?").run(id);
}

// ── Registros ────────────────────────────────────────────────────────────────
export function registerForWebinar(webinarId: number, leadId: number): void {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO webinar_registrations (webinar_id, lead_id, status, created_at, updated_at)
     VALUES (@w,@l,'registrado',@now,@now)
     ON CONFLICT(webinar_id, lead_id) DO UPDATE SET updated_at=@now`
  ).run({ w: webinarId, l: leadId, now });
}

export function listRegistrations(webinarId: number): RegLead[] {
  return db
    .prepare(
      `SELECT l.*, r.id AS reg_id, r.webinar_id AS webinar_id, r.status AS reg_status,
              r.attended AS reg_attended, r.seq_status AS reg_seq_status
       FROM webinar_registrations r JOIN leads l ON l.id = r.lead_id
       WHERE r.webinar_id = ? ORDER BY datetime(r.created_at) DESC`
    )
    .all(webinarId) as RegLead[];
}

export function setRegistrationStatus(webinarId: number, leadId: number, status: string): void {
  db.prepare(
    "UPDATE webinar_registrations SET status=@s, updated_at=@now WHERE webinar_id=@w AND lead_id=@l"
  ).run({ s: status, w: webinarId, l: leadId, now: new Date().toISOString() });
}
export function setRegistrationAttended(webinarId: number, leadId: number, attended: boolean): void {
  db.prepare(
    "UPDATE webinar_registrations SET attended=@a, updated_at=@now WHERE webinar_id=@w AND lead_id=@l"
  ).run({ a: attended ? 1 : 0, w: webinarId, l: leadId, now: new Date().toISOString() });
}

// ── Recordatorios y secuencia (por registro), para el cron ────────────────────
export type RegRow = {
  reg_id: number;
  webinar_id: number;
  lead_id: number;
  status: string;
  reminders_sent: string;
  seq_status: string;
  seq_step: number;
  seq_next_at: string | null;
};

export function registrationsForWebinar(webinarId: number): RegRow[] {
  return db
    .prepare(
      `SELECT id AS reg_id, webinar_id, lead_id, status, reminders_sent, seq_status, seq_step, seq_next_at
       FROM webinar_registrations WHERE webinar_id=?`
    )
    .all(webinarId) as RegRow[];
}

export function regRemindersSent(rem: string): string[] {
  if (!rem) return [];
  try {
    const a = JSON.parse(rem);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}
export function markRegReminderSent(regId: number, key: string): void {
  const row = db.prepare("SELECT reminders_sent FROM webinar_registrations WHERE id=?").get(regId) as
    | { reminders_sent: string }
    | undefined;
  const sent = regRemindersSent(row?.reminders_sent || "");
  if (!sent.includes(key)) sent.push(key);
  db.prepare("UPDATE webinar_registrations SET reminders_sent=@v, updated_at=@now WHERE id=@id").run({
    id: regId,
    v: JSON.stringify(sent),
    now: new Date().toISOString(),
  });
}
export function setRegSequence(
  regId: number,
  fields: { status?: string; step?: number; next_at?: string | null }
): void {
  const sets: string[] = [];
  const params: Record<string, unknown> = { id: regId, now: new Date().toISOString() };
  if (fields.status !== undefined) { sets.push("seq_status=@status"); params.status = fields.status; }
  if (fields.step !== undefined) { sets.push("seq_step=@step"); params.step = fields.step; }
  if (fields.next_at !== undefined) { sets.push("seq_next_at=@next_at"); params.next_at = fields.next_at; }
  if (sets.length === 0) return;
  db.prepare(`UPDATE webinar_registrations SET ${sets.join(", ")}, updated_at=@now WHERE id=@id`).run(params);
}

// Registros de un webinar cuya secuencia post-evento ya toca enviar.
export function dueRegSeq(webinarId: number, nowIso: string): RegRow[] {
  return db
    .prepare(
      `SELECT r.id AS reg_id, r.webinar_id, r.lead_id, r.status, r.reminders_sent,
              r.seq_status, r.seq_step, r.seq_next_at
       FROM webinar_registrations r JOIN leads l ON l.id=r.lead_id
       WHERE r.webinar_id=@w AND r.seq_status='active' AND l.paid=0 AND l.unsubscribed=0
         AND r.status NOT IN ('cliente','perdido')
         AND r.seq_next_at IS NOT NULL AND r.seq_next_at <= @now
       ORDER BY r.seq_next_at ASC LIMIT 20`
    )
    .all({ w: webinarId, now: nowIso }) as RegRow[];
}

// ── Invitaciones por webinar ──────────────────────────────────────────────────
function inviteWhere() {
  return `l.unsubscribed=0 AND l.email IS NOT NULL AND l.email != ''
    AND NOT EXISTS (SELECT 1 FROM webinar_registrations r WHERE r.webinar_id=@w AND r.lead_id=l.id)
    AND NOT EXISTS (SELECT 1 FROM webinar_invites i WHERE i.webinar_id=@w AND i.lead_id=l.id)`;
}
export function countInviteEligible(webinarId: number): number {
  return (
    db.prepare(`SELECT COUNT(*) AS c FROM leads l WHERE ${inviteWhere()}`).get({ w: webinarId }) as { c: number }
  ).c;
}
export function nextInviteBatch(webinarId: number, limit: number): LeadRow[] {
  return db
    .prepare(`SELECT l.* FROM leads l WHERE ${inviteWhere()} ORDER BY datetime(l.created_at) ASC LIMIT @lim`)
    .all({ w: webinarId, lim: limit }) as LeadRow[];
}
export function markInvitedToWebinar(webinarId: number, leadId: number): void {
  db.prepare("INSERT OR IGNORE INTO webinar_invites (webinar_id, lead_id) VALUES (?,?)").run(webinarId, leadId);
}

export { getLead };
