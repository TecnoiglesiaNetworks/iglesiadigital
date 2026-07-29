import { NextResponse } from "next/server";
import { createUser, ensureSeedUser, listUsers } from "@/lib/users";

export const runtime = "nodejs";

// GET /api/admin/users → lista de usuarios (sin contraseñas).
export async function GET() {
  ensureSeedUser();
  return NextResponse.json({ ok: true, users: listUsers() });
}

// POST /api/admin/users → crea un usuario nuevo.
export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  try {
    const user = createUser(body.username || "", body.password || "");
    return NextResponse.json({ ok: true, user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ ok: false, error: msg }, { status: 422 });
  }
}
