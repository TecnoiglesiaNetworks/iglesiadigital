import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "./db";

// Gestión de usuarios del panel. Contraseñas hasheadas con scrypt + salt.
// (Módulo solo de servidor: usa better-sqlite3 y crypto de Node.)

// Aseguramos la tabla aquí también (la conexión es singleton y puede haberse
// creado antes de agregar este esquema a db.ts).
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL UNIQUE,
    salt       TEXT NOT NULL,
    hash       TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

export type PublicUser = { id: number; username: string; created_at: string };
type UserRow = { id: number; username: string; salt: string; hash: string; created_at: string };

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function countUsers(): number {
  return (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
}

export function listUsers(): PublicUser[] {
  return db
    .prepare("SELECT id, username, created_at FROM users ORDER BY id ASC")
    .all() as PublicUser[];
}

export function createUser(username: string, password: string): PublicUser {
  const u = username.trim();
  if (!u) throw new Error("El usuario no puede estar vacío");
  if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
  const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(u);
  if (exists) throw new Error("Ese usuario ya existe");
  const { salt, hash } = hashPassword(password);
  const info = db
    .prepare("INSERT INTO users (username, salt, hash, created_at) VALUES (?, ?, ?, ?)")
    .run(u, salt, hash, new Date().toISOString());
  return { id: Number(info.lastInsertRowid), username: u, created_at: new Date().toISOString() };
}

export function setPassword(id: number, password: string): void {
  if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
  const { salt, hash } = hashPassword(password);
  db.prepare("UPDATE users SET salt = ?, hash = ? WHERE id = ?").run(salt, hash, id);
}

export function renameUser(id: number, username: string): void {
  const u = username.trim();
  if (!u) throw new Error("El usuario no puede estar vacío");
  const exists = db.prepare("SELECT id FROM users WHERE username = ? AND id != ?").get(u, id);
  if (exists) throw new Error("Ese usuario ya existe");
  db.prepare("UPDATE users SET username = ? WHERE id = ?").run(u, id);
}

export function deleteUser(id: number): void {
  if (countUsers() <= 1) throw new Error("No puedes eliminar el único usuario");
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
}

export function verifyUser(username: string, password: string): boolean {
  const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username.trim()) as
    | UserRow
    | undefined;
  if (!row) return false;
  const attempt = scryptSync(password, row.salt, 64);
  const stored = Buffer.from(row.hash, "hex");
  return attempt.length === stored.length && timingSafeEqual(attempt, stored);
}

// Siembra el primer usuario desde .env (ADMIN_USER/ADMIN_PASS) si la tabla está
// vacía, para no perder acceso al migrar del login por variables de entorno.
export function ensureSeedUser(): void {
  if (countUsers() > 0) return;
  const u = process.env.ADMIN_USER || "admin";
  const p = process.env.ADMIN_PASS;
  if (!p) return;
  try {
    createUser(u, p);
  } catch {
    /* ignora si ya existe por carrera */
  }
}
