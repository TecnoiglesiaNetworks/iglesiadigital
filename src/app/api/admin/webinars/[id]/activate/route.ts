import { NextResponse } from "next/server";
import { getWebinarById, setActiveWebinar } from "@/lib/webinars-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST → marca este webinar como el "activo" (el que se muestra en /webinar).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!getWebinarById(id)) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
  setActiveWebinar(id);
  return NextResponse.json({ ok: true });
}
