import { NextResponse } from "next/server";
import { deleteUser, renameUser, setPassword } from "@/lib/users";

export const runtime = "nodejs";

// PATCH /api/admin/users/:id → cambiar contraseña y/o usuario.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }
  let body: { password?: string; username?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  try {
    if (body.username != null) renameUser(id, body.username);
    if (body.password) setPassword(id, body.password);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ ok: false, error: msg }, { status: 422 });
  }
}

// DELETE /api/admin/users/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }
  try {
    deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ ok: false, error: msg }, { status: 422 });
  }
}
