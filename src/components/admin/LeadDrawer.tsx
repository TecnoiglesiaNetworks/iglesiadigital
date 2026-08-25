"use client";
import { useEffect, useState } from "react";
import {
  X, Mail, Phone, MapPin, Church, CalendarClock, Trash2, Save, ExternalLink,
  Send, Pause, Play, RotateCcw, Ban, Clock,
} from "lucide-react";
import { STAGES, TEMPS, type Lead } from "./stages";

const SEQ_LABEL: Record<string, string> = {
  active: "En secuencia",
  paused: "Pausada",
  done: "Secuencia completada",
  stopped: "Detenida",
};

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

type QuizResult = {
  pct: number;
  level: string;
  levelSub?: string;
  dims: { name: string; pct: number }[];
  wins: { title: string; body: string }[];
  grantCallout: { title: string; body: string } | null;
};
type QuizAnswers = Record<string, { label: string; value: string | number; points: number | null }>;

export function LeadDrawer({
  lead,
  onClose,
  onPatch,
  onDelete,
  onSequence,
}: {
  lead: Lead;
  onClose: () => void;
  onPatch: (id: number, fields: Record<string, unknown>) => void;
  onDelete: (id: number) => void;
  onSequence: (id: number, action: string) => Promise<any>;
}) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [log, setLog] = useState<{ step: number; subject: string | null; sent_at: string }[]>([]);
  const [seqTotal, setSeqTotal] = useState(6);
  const [seqBusy, setSeqBusy] = useState(false);

  useEffect(() => setNotes(lead.notes || ""), [lead.id, lead.notes]);

  // Carga el historial de correos de la secuencia al abrir/cambiar de lead.
  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/leads/${lead.id}/sequence`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.ok) {
          setLog(d.log || []);
          if (d.total) setSeqTotal(d.total);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [lead.id]);

  async function seqAction(action: string) {
    setSeqBusy(true);
    const res = await onSequence(lead.id, action);
    if (res?.log) setLog(res.log);
    if (res?.total) setSeqTotal(res.total);
    setSeqBusy(false);
  }

  const result: QuizResult | null = lead.result ? safeParse(lead.result) : null;
  const answers: QuizAnswers | null = lead.answers ? safeParse(lead.answers) : null;

  async function saveNotes() {
    setSavingNotes(true);
    await onPatch(lead.id, { notes });
    setSavingNotes(false);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col overflow-y-auto bg-white shadow-2xl">
        {/* Cabecera */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{lead.name}</h2>
            {lead.church && <p className="text-sm text-slate-500">{lead.church}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {/* Estado + temperatura */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Etapa</span>
              <select
                value={lead.status}
                onChange={(e) => onPatch(lead.id, { status: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-violet-500"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Temperatura</span>
              <select
                value={lead.temperature}
                onChange={(e) => onPatch(lead.id, { temperature: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-violet-500"
              >
                {TEMPS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Contacto */}
          <div className="space-y-2 rounded-xl border border-slate-200 p-4">
            <Row icon={<Mail size={15} />}>
              <a href={`mailto:${lead.email}`} className="text-violet-600 hover:underline">{lead.email}</a>
            </Row>
            {lead.whatsapp && (
              <Row icon={<Phone size={15} />}>
                <a
                  href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank" rel="noopener"
                  className="text-violet-600 hover:underline"
                >
                  {lead.whatsapp}
                </a>
              </Row>
            )}
            {lead.city && <Row icon={<MapPin size={15} />}>{lead.city}</Row>}
            {lead.church && <Row icon={<Church size={15} />}>{lead.church}</Row>}
            <Row icon={<CalendarClock size={15} />}>
              Registrado: {fmtDateTime(lead.created_at)}
            </Row>
          </div>

          {/* Compra pagada */}
          {lead.paid ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                ✅ Compra pagada
              </div>
              <p className="mt-1 text-sm font-medium text-green-900">
                {lead.paid_amount || "Pago recibido"}
              </p>
              <p className="text-xs text-green-700">
                {fmtDateTime(lead.paid_at)}
                {lead.paypal_order_id ? ` · Orden ${lead.paypal_order_id}` : ""}
              </p>
            </div>
          ) : null}

          {/* Secuencia de emails (solo si no ha pagado) */}
          {!lead.paid && (
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Send size={15} /> Secuencia de emails
                </span>
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold " +
                    (lead.seq_status === "active"
                      ? "bg-green-100 text-green-700"
                      : lead.seq_status === "paused"
                      ? "bg-amber-100 text-amber-700"
                      : lead.seq_status === "done"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-slate-100 text-slate-500")
                  }
                >
                  {SEQ_LABEL[lead.seq_status] || "Sin secuencia"}
                </span>
              </div>

              <p className="flex items-center gap-1.5 text-[13px] text-slate-500">
                <Clock size={13} />
                {lead.seq_status === "active"
                  ? `Próximo: correo ${Math.min(lead.seq_step + 1, seqTotal)} de ${seqTotal}${
                      lead.seq_next_at ? ` · ${fmtDateTime(lead.seq_next_at)}` : ""
                    }`
                  : lead.seq_status === "paused"
                  ? `Pausada en el correo ${Math.min(lead.seq_step + 1, seqTotal)} de ${seqTotal}.`
                  : lead.seq_status === "done"
                  ? `Se enviaron los ${seqTotal} correos.`
                  : lead.seq_status === "stopped"
                  ? "Secuencia detenida."
                  : "Este lead no está en la secuencia."}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {lead.seq_status === "active" && (
                  <>
                    <SeqBtn onClick={() => seqAction("send-now")} disabled={seqBusy} icon={<Send size={13} />}>
                      Enviar siguiente ahora
                    </SeqBtn>
                    <SeqBtn onClick={() => seqAction("pause")} disabled={seqBusy} icon={<Pause size={13} />}>
                      Pausar
                    </SeqBtn>
                    <SeqBtn onClick={() => seqAction("stop")} disabled={seqBusy} icon={<Ban size={13} />} danger>
                      Detener
                    </SeqBtn>
                  </>
                )}
                {lead.seq_status === "paused" && (
                  <>
                    <SeqBtn onClick={() => seqAction("resume")} disabled={seqBusy} icon={<Play size={13} />}>
                      Reanudar
                    </SeqBtn>
                    <SeqBtn onClick={() => seqAction("stop")} disabled={seqBusy} icon={<Ban size={13} />} danger>
                      Detener
                    </SeqBtn>
                  </>
                )}
                {(lead.seq_status === "done" || lead.seq_status === "stopped") && (
                  <SeqBtn onClick={() => seqAction("restart")} disabled={seqBusy} icon={<RotateCcw size={13} />}>
                    Reiniciar secuencia
                  </SeqBtn>
                )}
                {!lead.seq_status && (
                  <SeqBtn onClick={() => seqAction("restart")} disabled={seqBusy} icon={<Play size={13} />}>
                    Iniciar secuencia
                  </SeqBtn>
                )}
              </div>

              {log.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Correos enviados
                  </span>
                  <ul className="mt-1.5 space-y-1">
                    {log.map((e, i) => (
                      <li key={i} className="text-[12.5px] text-slate-600">
                        <span className="text-slate-400">{fmtDateTime(e.sent_at)}</span> — {e.subject}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Cita de Calendly */}
          {lead.scheduled_at && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <CalendarClock size={16} /> Cita agendada
              </div>
              <p className="mt-1 text-sm text-blue-900">{fmtDateTime(lead.scheduled_at)}</p>
              {lead.calendly_uri && (
                <a
                  href={lead.calendly_uri} target="_blank" rel="noopener"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  Ver en Calendly <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}

          {/* Resultado del diagnóstico */}
          {result && (
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Diagnóstico</span>
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-sm font-bold text-violet-700">
                  {result.pct}%
                </span>
              </div>
              <p className="mb-3 text-sm font-medium text-slate-600">{result.level}</p>
              <div className="space-y-2">
                {result.dims.map((d) => (
                  <div key={d.name}>
                    <div className="mb-0.5 flex justify-between text-xs text-slate-500">
                      <span>{d.name}</span>
                      <span>{d.pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-orange-500" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {result.grantCallout && (
                <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
                  ⚑ {result.grantCallout.title}
                </p>
              )}
            </div>
          )}

          {/* Respuestas del quiz */}
          {answers && Object.keys(answers).length > 0 && (
            <details className="rounded-xl border border-slate-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                Respuestas del quiz ({Object.keys(answers).length})
              </summary>
              <ul className="mt-3 space-y-2">
                {Object.entries(answers).map(([qid, a]) => (
                  <li key={qid} className="text-sm">
                    <span className="block text-xs uppercase tracking-wide text-slate-400">{qid}</span>
                    <span className="text-slate-700">{a.label}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* Notas */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Notas internas</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Anota lo que hablaste, próximos pasos…"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-violet-500"
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
            >
              <Save size={14} /> Guardar notas
            </button>
          </div>

          {/* Eliminar */}
          <button
            onClick={() => {
              if (confirm(`¿Eliminar a ${lead.name}? Esta acción no se puede deshacer.`)) {
                onDelete(lead.id);
              }
            }}
            className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"
          >
            <Trash2 size={15} /> Eliminar lead
          </button>
        </div>
      </aside>
    </>
  );
}

function SeqBtn({
  onClick,
  disabled,
  icon,
  danger,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium transition-colors disabled:opacity-50 " +
        (danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-slate-300 text-slate-700 hover:bg-slate-50")
      }
    >
      {icon}
      {children}
    </button>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-600">
      <span className="text-slate-400">{icon}</span>
      {children}
    </div>
  );
}

function safeParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
