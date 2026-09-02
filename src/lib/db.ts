import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import path from "path";

// ── Ubicación del archivo SQLite ────────────────────────────────────────────
// Se guarda en /data/leads.db (ignorado por git). Configurable con DB_PATH.
const DB_FILE = process.env.DB_PATH || path.join(process.cwd(), "data", "leads.db");
const DB_DIR = path.dirname(DB_FILE);
if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });

// Singleton: en dev, Next recarga módulos y crearía múltiples conexiones.
const g = globalThis as unknown as { __leadsDb?: Database.Database };

function init(): Database.Database {
  const db = new Database(DB_FILE);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL,
      name          TEXT NOT NULL,
      church        TEXT,
      email         TEXT NOT NULL,
      whatsapp      TEXT,
      city          TEXT,
      score         INTEGER,
      level         TEXT,
      answers       TEXT,            -- JSON de respuestas del quiz
      result        TEXT,            -- JSON del resultado calculado
      status        TEXT NOT NULL DEFAULT 'nuevo',
      temperature   TEXT NOT NULL DEFAULT 'tibio',
      source        TEXT NOT NULL DEFAULT 'quiz',
      notes         TEXT,
      scheduled_at  TEXT,            -- fecha/hora de la cita de Calendly
      calendly_uri  TEXT             -- URI del evento en Calendly
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE,
      salt       TEXT NOT NULL,
      hash       TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_log (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id  INTEGER NOT NULL,
      step     INTEGER NOT NULL,
      subject  TEXT,
      sent_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_email_log_lead ON email_log(lead_id);

    CREATE TABLE IF NOT EXISTS email_templates (
      step       INTEGER PRIMARY KEY,
      subject    TEXT NOT NULL,
      body       TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Plantillas editables de los correos del WEBINAR (clave por string:
    -- 'confirm', 'r1', 'r2', 'r3', 's1'..'s7').
    CREATE TABLE IF NOT EXISTS webinar_templates (
      key        TEXT PRIMARY KEY,
      subject    TEXT NOT NULL,
      body       TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Ajustes generales editables desde el admin (p. ej. el link de YouTube
    -- del webinar). Clave/valor simple.
    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migración: columnas de pago (para bases creadas antes de esta versión).
  // Envuelto en try/catch por si dos procesos (workers del build) corren a la vez
  // y uno alcanza a agregar la columna primero ("duplicate column name").
  const addColumn = (ddl: string) => {
    try {
      db.exec(ddl);
    } catch (e) {
      if (!String((e as Error)?.message || "").includes("duplicate column")) throw e;
    }
  };
  const cols = db.prepare("PRAGMA table_info(leads)").all() as { name: string }[];
  const has = (c: string) => cols.some((x) => x.name === c);
  if (!has("paid")) addColumn("ALTER TABLE leads ADD COLUMN paid INTEGER NOT NULL DEFAULT 0");
  if (!has("paid_at")) addColumn("ALTER TABLE leads ADD COLUMN paid_at TEXT");
  if (!has("paid_amount")) addColumn("ALTER TABLE leads ADD COLUMN paid_amount TEXT");
  if (!has("paypal_order_id")) addColumn("ALTER TABLE leads ADD COLUMN paypal_order_id TEXT");
  // Secuencia de emails para leads no pagados.
  if (!has("seq_status")) addColumn("ALTER TABLE leads ADD COLUMN seq_status TEXT NOT NULL DEFAULT ''");
  if (!has("seq_step")) addColumn("ALTER TABLE leads ADD COLUMN seq_step INTEGER NOT NULL DEFAULT 0");
  if (!has("seq_next_at")) addColumn("ALTER TABLE leads ADD COLUMN seq_next_at TEXT");
  if (!has("unsubscribed")) addColumn("ALTER TABLE leads ADD COLUMN unsubscribed INTEGER NOT NULL DEFAULT 0");
  // ── Webinar (aislado de la secuencia del diagnóstico) ──────────────────────
  // Recordatorios anclados a la fecha del evento ya enviados (JSON de claves).
  if (!has("wb_reminders_sent")) addColumn("ALTER TABLE leads ADD COLUMN wb_reminders_sent TEXT NOT NULL DEFAULT ''");
  // Marca de asistencia (para el pipeline del webinar).
  if (!has("wb_attended")) addColumn("ALTER TABLE leads ADD COLUMN wb_attended INTEGER NOT NULL DEFAULT 0");
  // Secuencia de venta POST-evento (independiente de la del quiz).
  if (!has("wb_seq_status")) addColumn("ALTER TABLE leads ADD COLUMN wb_seq_status TEXT NOT NULL DEFAULT ''");
  if (!has("wb_seq_step")) addColumn("ALTER TABLE leads ADD COLUMN wb_seq_step INTEGER NOT NULL DEFAULT 0");
  if (!has("wb_seq_next_at")) addColumn("ALTER TABLE leads ADD COLUMN wb_seq_next_at TEXT");
  // Registro y etapa del webinar (independientes del pipeline del diagnóstico,
  // para que un mismo lead pueda estar en ambos embudos).
  if (!has("wb_registered")) addColumn("ALTER TABLE leads ADD COLUMN wb_registered INTEGER NOT NULL DEFAULT 0");
  if (!has("wb_status")) addColumn("ALTER TABLE leads ADD COLUMN wb_status TEXT NOT NULL DEFAULT ''");
  // Invitación masiva al webinar (para no invitar dos veces al mismo lead).
  if (!has("wb_invited")) addColumn("ALTER TABLE leads ADD COLUMN wb_invited INTEGER NOT NULL DEFAULT 0");
  // Backfill: registros del webinar creados antes del flag (source='webinar').
  try {
    db.exec(
      "UPDATE leads SET wb_registered=1, wb_status='registrado' WHERE source='webinar' AND wb_registered=0"
    );
  } catch {}

  return db;
}

export const db = g.__leadsDb ?? (g.__leadsDb = init());

// ── Tipos ───────────────────────────────────────────────────────────────────
export type LeadRow = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  church: string | null;
  email: string;
  whatsapp: string | null;
  city: string | null;
  score: number | null;
  level: string | null;
  answers: string | null;
  result: string | null;
  status: string;
  temperature: string;
  source: string;
  notes: string | null;
  scheduled_at: string | null;
  calendly_uri: string | null;
  paid: number;
  paid_at: string | null;
  paid_amount: string | null;
  paypal_order_id: string | null;
  seq_status: string;
  seq_step: number;
  seq_next_at: string | null;
  unsubscribed: number;
  wb_reminders_sent: string;
  wb_attended: number;
  wb_seq_status: string;
  wb_seq_step: number;
  wb_seq_next_at: string | null;
  wb_registered: number;
  wb_status: string;
  wb_invited: number;
};

export type LeadInput = {
  name: string;
  church?: string;
  email: string;
  whatsapp?: string;
  city?: string;
  score?: number | null;
  level?: string | null;
  answers?: unknown;
  result?: unknown;
  status?: string;
  temperature?: string;
  source?: string;
};

// Temperatura por defecto según la madurez del diagnóstico:
// menor madurez = mayor necesidad = prospecto más "caliente".
export function tempFromScore(score?: number | null): string {
  if (score == null) return "tibio";
  if (score <= 40) return "caliente";
  if (score <= 70) return "tibio";
  return "frio";
}

// ── Operaciones ─────────────────────────────────────────────────────────────

// Inserta o actualiza por email. Conserva status/notes/temperature si el lead
// ya existía (no queremos regresar a "nuevo" a alguien que ya está en pipeline).
export function upsertLead(input: LeadInput): LeadRow {
  const now = new Date().toISOString();
  const existing = db.prepare("SELECT * FROM leads WHERE email = ?").get(input.email) as
    | LeadRow
    | undefined;

  const answers = input.answers != null ? JSON.stringify(input.answers) : null;
  const result = input.result != null ? JSON.stringify(input.result) : null;

  if (existing) {
    db.prepare(
      `UPDATE leads SET
        updated_at = @updated_at, name = @name, church = @church, whatsapp = @whatsapp,
        city = @city, score = @score, level = @level, answers = @answers, result = @result
       WHERE id = @id`
    ).run({
      id: existing.id,
      updated_at: now,
      name: input.name,
      church: input.church ?? existing.church,
      whatsapp: input.whatsapp ?? existing.whatsapp,
      city: input.city ?? existing.city,
      score: input.score ?? existing.score,
      level: input.level ?? existing.level,
      answers: answers ?? existing.answers,
      result: result ?? existing.result,
    });
    return db.prepare("SELECT * FROM leads WHERE id = ?").get(existing.id) as LeadRow;
  }

  const info = db
    .prepare(
      `INSERT INTO leads
        (created_at, updated_at, name, church, email, whatsapp, city, score, level,
         answers, result, status, temperature, source)
       VALUES
        (@created_at, @updated_at, @name, @church, @email, @whatsapp, @city, @score, @level,
         @answers, @result, @status, @temperature, @source)`
    )
    .run({
      created_at: now,
      updated_at: now,
      name: input.name,
      church: input.church ?? null,
      email: input.email,
      whatsapp: input.whatsapp ?? null,
      city: input.city ?? null,
      score: input.score ?? null,
      level: input.level ?? null,
      answers,
      result,
      status: input.status ?? "nuevo",
      temperature: input.temperature ?? tempFromScore(input.score),
      source: input.source ?? "quiz",
    });
  return db.prepare("SELECT * FROM leads WHERE id = ?").get(info.lastInsertRowid) as LeadRow;
}

export function listLeads(): LeadRow[] {
  return db.prepare("SELECT * FROM leads ORDER BY datetime(created_at) DESC").all() as LeadRow[];
}

export function getLead(id: number): LeadRow | undefined {
  return db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as LeadRow | undefined;
}

const ALLOWED_FIELDS = ["status", "temperature", "notes", "name", "church", "whatsapp", "city", "wb_attended", "wb_status"] as const;
export function updateLead(id: number, fields: Record<string, unknown>): LeadRow | undefined {
  const keys = Object.keys(fields).filter((k) => (ALLOWED_FIELDS as readonly string[]).includes(k));
  if (keys.length === 0) return getLead(id);
  const setClause = keys.map((k) => `${k} = @${k}`).join(", ");
  const params: Record<string, unknown> = { id, updated_at: new Date().toISOString() };
  for (const k of keys) params[k] = fields[k];
  db.prepare(`UPDATE leads SET ${setClause}, updated_at = @updated_at WHERE id = @id`).run(params);
  return getLead(id);
}

export function deleteLead(id: number): void {
  db.prepare("DELETE FROM leads WHERE id = ?").run(id);
}

// Marca una cita de Calendly sobre el lead con ese email (si existe).
export function markScheduledByEmail(
  email: string,
  scheduledAt: string | null,
  calendlyUri: string | null,
  canceled = false
): LeadRow | undefined {
  const lead = db.prepare("SELECT * FROM leads WHERE email = ?").get(email) as LeadRow | undefined;
  if (!lead) return undefined;
  const now = new Date().toISOString();
  if (canceled) {
    // Se canceló la cita: limpiamos y, si estaba "agendado", lo regresamos a seguimiento.
    const nextStatus = lead.status === "agendado" ? "reagendar" : lead.status;
    db.prepare(
      "UPDATE leads SET scheduled_at = NULL, status = ?, updated_at = ? WHERE id = ?"
    ).run(nextStatus, now, lead.id);
  } else {
    // Nueva cita: no pisamos estados finales (ganado/perdido).
    const keep = lead.status === "ganado" || lead.status === "perdido";
    const nextStatus = keep ? lead.status : "agendado";
    db.prepare(
      "UPDATE leads SET scheduled_at = ?, calendly_uri = ?, status = ?, updated_at = ? WHERE id = ?"
    ).run(scheduledAt, calendlyUri, nextStatus, now, lead.id);
  }
  return getLead(lead.id);
}

// Marca como pagado al lead con ese email (lo crea si no existía, para no perder
// la venta). Al pagar lo movemos a "ganado" salvo que ya estuviera "perdido".
export function markPaidByEmail(
  email: string,
  info: { name?: string; orderId?: string; amount?: string; currency?: string }
): LeadRow {
  const now = new Date().toISOString();
  const norm = email.trim().toLowerCase();
  let lead = db.prepare("SELECT * FROM leads WHERE email = ?").get(norm) as LeadRow | undefined;
  if (!lead) {
    lead = upsertLead({ name: info.name?.trim() || norm, email: norm, source: "pago" });
  }
  const amount =
    info.amount != null && info.currency
      ? `${info.amount} ${info.currency}`
      : info.amount ?? null;
  const nextStatus = lead.status === "perdido" ? lead.status : "ganado";
  // Al pagar detenemos la secuencia de emails (ya no tiene sentido seguir).
  db.prepare(
    `UPDATE leads SET paid = 1, paid_at = @paid_at, paid_amount = @amount,
       paypal_order_id = @order, status = @status, seq_status = 'stopped',
       seq_next_at = NULL, updated_at = @now WHERE id = @id`
  ).run({
    id: lead.id,
    paid_at: now,
    amount,
    order: info.orderId ?? null,
    status: nextStatus,
    now,
  });
  return getLead(lead.id) as LeadRow;
}

// ── Secuencia de emails ───────────────────────────────────────────────────────

// Inscribe al lead en la secuencia (si no ha pagado y no está ya activo/terminado).
export function enrollLeadInSequence(leadId: number, firstAt: string): void {
  const lead = getLead(leadId);
  if (!lead || lead.paid || lead.unsubscribed) return;
  if (lead.seq_status === "active" || lead.seq_status === "done") return;
  db.prepare(
    "UPDATE leads SET seq_status='active', seq_step=0, seq_next_at=@at, updated_at=@now WHERE id=@id"
  ).run({ id: leadId, at: firstAt, now: new Date().toISOString() });
}

// Actualiza el estado de la secuencia de un lead (status / paso / próximo envío).
export function setSequence(
  leadId: number,
  fields: { status?: string; step?: number; next_at?: string | null }
): LeadRow | undefined {
  const sets: string[] = [];
  const params: Record<string, unknown> = { id: leadId, now: new Date().toISOString() };
  if (fields.status !== undefined) { sets.push("seq_status=@status"); params.status = fields.status; }
  if (fields.step !== undefined) { sets.push("seq_step=@step"); params.step = fields.step; }
  if (fields.next_at !== undefined) { sets.push("seq_next_at=@next_at"); params.next_at = fields.next_at; }
  if (sets.length === 0) return getLead(leadId);
  db.prepare(`UPDATE leads SET ${sets.join(", ")}, updated_at=@now WHERE id=@id`).run(params);
  return getLead(leadId);
}

// Registra un correo enviado (para el historial en el panel).
export function logSequenceEmail(leadId: number, step: number, subject: string): void {
  db.prepare("INSERT INTO email_log (lead_id, step, subject, sent_at) VALUES (?,?,?,?)").run(
    leadId,
    step,
    subject,
    new Date().toISOString()
  );
}

// Leads a los que ya les toca el siguiente correo de la secuencia.
// Límite por corrida (20) para no exceder el timeout del servicio de cron cuando
// hay muchos pendientes; el resto sale en la siguiente corrida (cada 15 min).
export function dueSequenceLeads(nowIso: string): LeadRow[] {
  return db
    .prepare(
      `SELECT * FROM leads
       WHERE seq_status='active' AND paid=0 AND unsubscribed=0
         AND seq_next_at IS NOT NULL AND seq_next_at <= ?
       ORDER BY seq_next_at ASC LIMIT 20`
    )
    .all(nowIso) as LeadRow[];
}

// Da de baja (unsubscribe) al lead con ese correo: no recibe más correos y se
// detiene su secuencia. Devuelve true si existía el lead.
export function unsubscribeByEmail(email: string): boolean {
  const norm = email.trim().toLowerCase();
  const info = db
    .prepare(
      `UPDATE leads SET unsubscribed=1, seq_status='stopped', seq_next_at=NULL, updated_at=@now
       WHERE email=@email`
    )
    .run({ email: norm, now: new Date().toISOString() });
  return info.changes > 0;
}

// Cuántos leads no pagados se pueden inscribir (nunca inscritos o detenidos).
export function countEnrollableLeads(): number {
  const r = db
    .prepare(
      "SELECT COUNT(*) AS c FROM leads WHERE source != 'webinar' AND paid=0 AND unsubscribed=0 AND (seq_status='' OR seq_status='stopped')"
    )
    .get() as { c: number };
  return r.c;
}

// Inscribe en la secuencia a todos los leads no pagados que no estén ya activos.
// Devuelve cuántos se inscribieron. El primer correo sale en la próxima corrida.
export function enrollAllUnpaid(firstAt: string): number {
  const now = new Date().toISOString();
  const info = db
    .prepare(
      `UPDATE leads SET seq_status='active', seq_step=0, seq_next_at=@at, updated_at=@now
       WHERE source != 'webinar' AND paid=0 AND unsubscribed=0 AND (seq_status='' OR seq_status='stopped')`
    )
    .run({ at: firstAt, now });
  return info.changes;
}

// Historial de correos enviados a un lead.
export function getEmailLog(
  leadId: number
): { step: number; subject: string | null; sent_at: string }[] {
  return db
    .prepare("SELECT step, subject, sent_at FROM email_log WHERE lead_id=? ORDER BY sent_at ASC")
    .all(leadId) as { step: number; subject: string | null; sent_at: string }[];
}

// ── Plantillas editables de los correos ───────────────────────────────────────
// Si un paso tiene override guardado, el motor lo usa en vez del texto por defecto.
export function getTemplate(step: number): { subject: string; body: string } | undefined {
  return db.prepare("SELECT subject, body FROM email_templates WHERE step=?").get(step) as
    | { subject: string; body: string }
    | undefined;
}

export function setTemplate(step: number, subject: string, body: string): void {
  db.prepare(
    `INSERT INTO email_templates (step, subject, body, updated_at)
     VALUES (@step, @subject, @body, @now)
     ON CONFLICT(step) DO UPDATE SET subject=@subject, body=@body, updated_at=@now`
  ).run({ step, subject, body, now: new Date().toISOString() });
}

export function resetTemplate(step: number): void {
  db.prepare("DELETE FROM email_templates WHERE step=?").run(step);
}

// Estadísticas globales de la secuencia (para la vista general del admin).
export function sequenceStats(): {
  active: number;
  paused: number;
  done: number;
  stopped: number;
  sentByStep: Record<number, number>;
  totalSent: number;
} {
  const rows = db
    .prepare("SELECT seq_status AS s, COUNT(*) AS c FROM leads WHERE seq_status != '' GROUP BY seq_status")
    .all() as { s: string; c: number }[];
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.s] = r.c;

  // step >= 0 excluye los correos del webinar (registrados con step = -1).
  const steps = db
    .prepare("SELECT step, COUNT(*) AS c FROM email_log WHERE step >= 0 GROUP BY step")
    .all() as { step: number; c: number }[];
  const sentByStep: Record<number, number> = {};
  let totalSent = 0;
  for (const s of steps) {
    sentByStep[s.step] = s.c;
    totalSent += s.c;
  }

  return {
    active: counts["active"] || 0,
    paused: counts["paused"] || 0,
    done: counts["done"] || 0,
    stopped: counts["stopped"] || 0,
    sentByStep,
    totalSent,
  };
}

// ════════════════════════════════════════════════════════════════════════════
//  WEBINAR — datos aislados del pipeline del diagnóstico
// ════════════════════════════════════════════════════════════════════════════

// Todos los registrados del webinar (marcados con wb_registered=1, sin importar
// su source, para que un lead del diagnóstico que también se registra aparezca).
export function listWebinarLeads(): LeadRow[] {
  return db
    .prepare("SELECT * FROM leads WHERE wb_registered=1 ORDER BY datetime(created_at) DESC")
    .all() as LeadRow[];
}

// ── Invitación masiva al webinar (a los leads del diagnóstico) ────────────────
// Elegibles: leads que NO son del webinar, no dados de baja, aún no registrados
// al webinar y aún no invitados.
function inviteWhere() {
  return "source != 'webinar' AND unsubscribed=0 AND wb_registered=0 AND wb_invited=0 AND email IS NOT NULL AND email != ''";
}
export function countInviteEligible(): number {
  const r = db.prepare(`SELECT COUNT(*) AS c FROM leads WHERE ${inviteWhere()}`).get() as { c: number };
  return r.c;
}
export function nextInviteBatch(limit: number): LeadRow[] {
  return db
    .prepare(`SELECT * FROM leads WHERE ${inviteWhere()} ORDER BY datetime(created_at) ASC LIMIT ?`)
    .all(limit) as LeadRow[];
}
export function markInvited(leadId: number): void {
  db.prepare("UPDATE leads SET wb_invited=1, updated_at=@now WHERE id=@id").run({
    id: leadId,
    now: new Date().toISOString(),
  });
}

// Marca a un lead como registrado al webinar (nuevo o existente). Conserva su
// etapa del webinar si ya la tenía; si no, lo pone en "registrado".
export function markWebinarRegistered(leadId: number): void {
  db.prepare(
    `UPDATE leads SET
       wb_registered = 1,
       wb_status = CASE WHEN wb_status = '' THEN 'registrado' ELSE wb_status END,
       updated_at = @now
     WHERE id = @id`
  ).run({ id: leadId, now: new Date().toISOString() });
}

// ── Ajustes clave/valor (p. ej. link de YouTube del webinar) ──────────────────
export function getSetting(key: string): string | null {
  const r = db.prepare("SELECT value FROM app_settings WHERE key=?").get(key) as
    | { value: string | null }
    | undefined;
  return r?.value ?? null;
}
export function setSetting(key: string, value: string): void {
  db.prepare(
    `INSERT INTO app_settings (key, value) VALUES (@key, @value)
     ON CONFLICT(key) DO UPDATE SET value=@value`
  ).run({ key, value });
}

// ── Plantillas editables de los correos del webinar (clave string) ────────────
export function getWebinarTemplate(key: string): { subject: string; body: string } | undefined {
  return db.prepare("SELECT subject, body FROM webinar_templates WHERE key=?").get(key) as
    | { subject: string; body: string }
    | undefined;
}
export function setWebinarTemplate(key: string, subject: string, body: string): void {
  db.prepare(
    `INSERT INTO webinar_templates (key, subject, body, updated_at)
     VALUES (@key, @subject, @body, @now)
     ON CONFLICT(key) DO UPDATE SET subject=@subject, body=@body, updated_at=@now`
  ).run({ key, subject, body, now: new Date().toISOString() });
}
export function resetWebinarTemplate(key: string): void {
  db.prepare("DELETE FROM webinar_templates WHERE key=?").run(key);
}

// ── Recordatorios anclados al evento (marca cuáles ya se enviaron) ─────────────
export function getWebinarRemindersSent(lead: LeadRow): string[] {
  if (!lead.wb_reminders_sent) return [];
  try {
    const arr = JSON.parse(lead.wb_reminders_sent);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
export function markWebinarReminderSent(leadId: number, key: string): void {
  const lead = getLead(leadId);
  if (!lead) return;
  const sent = getWebinarRemindersSent(lead);
  if (!sent.includes(key)) sent.push(key);
  db.prepare("UPDATE leads SET wb_reminders_sent=@v, updated_at=@now WHERE id=@id").run({
    id: leadId,
    v: JSON.stringify(sent),
    now: new Date().toISOString(),
  });
}

export function markWebinarAttended(leadId: number, attended: boolean): LeadRow | undefined {
  db.prepare("UPDATE leads SET wb_attended=@a, updated_at=@now WHERE id=@id").run({
    id: leadId,
    a: attended ? 1 : 0,
    now: new Date().toISOString(),
  });
  return getLead(leadId);
}

// ── Secuencia de venta POST-evento del webinar ────────────────────────────────
export function setWebinarSequence(
  leadId: number,
  fields: { status?: string; step?: number; next_at?: string | null }
): LeadRow | undefined {
  const sets: string[] = [];
  const params: Record<string, unknown> = { id: leadId, now: new Date().toISOString() };
  if (fields.status !== undefined) { sets.push("wb_seq_status=@status"); params.status = fields.status; }
  if (fields.step !== undefined) { sets.push("wb_seq_step=@step"); params.step = fields.step; }
  if (fields.next_at !== undefined) { sets.push("wb_seq_next_at=@next_at"); params.next_at = fields.next_at; }
  if (sets.length === 0) return getLead(leadId);
  db.prepare(`UPDATE leads SET ${sets.join(", ")}, updated_at=@now WHERE id=@id`).run(params);
  return getLead(leadId);
}

// Inscribe al registrado en la secuencia post-evento (si no es cliente aún).
export function enrollWebinarSequence(leadId: number, firstAt: string): void {
  const lead = getLead(leadId);
  if (!lead || lead.paid || lead.unsubscribed) return;
  if (lead.wb_seq_status === "active" || lead.wb_seq_status === "done") return;
  db.prepare(
    "UPDATE leads SET wb_seq_status='active', wb_seq_step=0, wb_seq_next_at=@at, updated_at=@now WHERE id=@id"
  ).run({ id: leadId, at: firstAt, now: new Date().toISOString() });
}

// Registrados del webinar a los que ya toca el siguiente correo de venta.
export function dueWebinarSeqLeads(nowIso: string): LeadRow[] {
  return db
    .prepare(
      `SELECT * FROM leads
       WHERE wb_registered=1 AND wb_seq_status='active' AND paid=0 AND unsubscribed=0
         AND wb_status NOT IN ('cliente','perdido')
         AND wb_seq_next_at IS NOT NULL AND wb_seq_next_at <= ?
       ORDER BY wb_seq_next_at ASC LIMIT 20`
    )
    .all(nowIso) as LeadRow[];
}
