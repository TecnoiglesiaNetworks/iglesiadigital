import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

// Protege todo lo que cuelga de /admin (excepto la propia página de login).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Rutas públicas dentro del área: la página de login y su endpoint.
  if (pathname.startsWith("/admin/login") || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifyToken(token);
  if (!session) {
    // Las rutas de API responden 401 JSON; las páginas redirigen al login.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
