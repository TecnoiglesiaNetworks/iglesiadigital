import { NextResponse } from "next/server";
import { getWebinarById, updateWebinar, deleteWebinar } from "@/lib/webinars-db";
import { dateLabelFor, timeLabelFor } from "@/lib/webinar-config";
import { localInputToIso, toLocalInput } from "@/lib/webinar-time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withLabels(w: NonNullable<ReturnType<typeof getWebinarById>>) {
  return {
    ...w,
    startsAtLocal: toLocalInput(w.starts_at),
    dateLabel: dateLabelFor(w.starts_at),
    timeLabel: timeLabelFor(w.starts_at),
  };
}

// GET → un webinar con etiquetas legibles.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const w = getWebinarById(Number(params.id));
  if (!w) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
  return NextResponse.json({ ok: true, webinar: withLabels(w) });
}

// PATCH → edita nombre, subtítulo, fecha/hora, link de YouTube o del grupo.
// Body admite: { title?, subtitle?, startsAtLocal?, youtubeUrl?, whatsappGroupUrl?, joinImage? }.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!getWebinarById(id)) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const fields: Record<string, unknown> = {};
  if (typeof body.title === "string") fields.title = body.title.trim();
  if (typeof body.subtitle === "string") fields.subtitle = body.subtitle.trim();
  if (typeof body.youtubeUrl === "string") fields.youtube_url = body.youtubeUrl.trim();
  if (typeof body.whatsappGroupUrl === "string") fields.whatsapp_group_url = body.whatsappGroupUrl.trim();
  if (typeof body.joinImage === "string") fields.join_image = body.joinImage.trim();
  if (typeof body.startsAtLocal === "string" && body.startsAtLocal.trim()) {
    fields.starts_at = localInputToIso(body.startsAtLocal);
  }

  const w = updateWebinar(id, fields);
  return NextResponse.json({ ok: true, webinar: withLabels(w!) });
}

// DELETE → elimina el webinar y sus registros/invitaciones.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!getWebinarById(id)) return NextResponse.json({ ok: false, error: "No existe" }, { status: 404 });
  deleteWebinar(id);
  return NextResponse.json({ ok: true });
}
