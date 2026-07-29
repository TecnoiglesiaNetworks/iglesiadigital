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
  `);
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

const ALLOWED_FIELDS = ["status", "temperature", "notes", "name", "church", "whatsapp", "city"] as const;
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
