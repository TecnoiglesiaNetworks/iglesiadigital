import { NextResponse } from "next/server";
import { createToken, SESSION_COOKIE, cookieOptions } from "@/lib/auth";
import { ensureSeedUser, verifyUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const username = (body.username || "").trim();
  const password = body.password || "";

  // Siembra el usuario inicial desde .env la primera vez (migración suave).
  ensureSeedUser();

  if (!verifyUser(username, password)) {
    return NextResponse.json({ ok: false, error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const token = await createToken(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions);
  return res;
}
