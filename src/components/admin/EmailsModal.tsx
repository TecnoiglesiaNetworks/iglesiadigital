"use client";
import { useEffect, useState } from "react";
import { X, Mail, Loader2, Eye, EyeOff, Pencil, Save, RotateCcw } from "lucide-react";

type Step = {
  n: number;
  whenLabel: string;
  subjectRaw: string;
  bodyRaw: string;
  subjectPreview: string;
  html: string;
  edited: boolean;
};
type Stats = {
  active: number;
  paused: number;
  done: number;
  stopped: number;
  sentByStep: Record<number, number>;
  totalSent: number;
};

export function EmailsModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [enrollable, setEnrollable] = useState(0);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/sequence")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.ok) return;
        setSteps(d.steps || []);
        setStats(d.stats || null);
        setEnrollable(d.enrollable || 0);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function enrollAll() {
    if (
      !confirm(
        `Vas a inscribir ${enrollable} lead(s) no pagados en la secuencia. Empezarán a recibir los correos (uno por lead cada ~15 min). ¿Continuar?`
      )
    )
      return;
    setEnrolling(true);
    const res = await fetch("/api/admin/sequence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enroll-all" }),
    });
    const d = await res.json().catch(() => ({}));
    setEnrolling(false);
    if (d?.ok) {
      setStats(d.stats || stats);
      setEnrollable(d.enrollable || 0);
      alert(`Listo: ${d.enrolled} lead(s) inscritos. Empezarán a recibir la secuencia.`);
    } else {
      alert(d?.error || "No se pudo inscribir");
    }
  }

  function startEdit(s: Step) {
    setEditing(s.n);
    setOpen(null);
    setForm({ subject: s.subjectRaw, body: s.bodyRaw });
  }

  async function save(step: number, reset = false) {
    setSaving(true);
    const res = await fetch("/api/admin/sequence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        reset ? { step: step - 1, reset: true } : { step: step - 1, subject: form.subject, body: form.body }
      ),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (d?.ok) {
      setSteps(d.steps || []);
      setStats(d.stats || stats);
      setEditing(null);
    } else {
      alert(d?.error || "No se pudo guardar");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[760px] flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Mail size={18} /> Secuencia de emails
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 size={18} className="animate-spin" /> Cargando…
            </div>
          ) : (
            <>
              {stats && (
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="En secuencia" value={stats.active} color="text-green-600" />
                  <Stat label="Pausadas" value={stats.paused} color="text-amber-600" />
                  <Stat label="Completadas" value={stats.done} color="text-violet-600" />
                  <Stat label="Correos enviados" value={stats.totalSent} color="text-slate-800" />
                </div>
              )}

              <p className="mb-4 text-[13px] text-slate-500">
                Estos son los correos que reciben los leads que no pagan. Puedes editar cada texto y
                ver la vista previa.
              </p>

              {enrollable > 0 && (
                <div className="mb-4 flex flex-col gap-2 rounded-xl border border-violet-200 bg-violet-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-[13px] text-violet-900">
                    <b>{enrollable} lead(s)</b> no pagados aún no están en la secuencia (entraron
                    antes). Inscríbelos para que empiecen a recibir el seguimiento.
                  </div>
                  <button
                    onClick={enrollAll}
                    disabled={enrolling}
                    className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    {enrolling ? <Loader2 size={15} className="animate-spin" /> : null}
                    Inscribir a los {enrollable}
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {steps.map((s) => {
                  const sent = stats?.sentByStep[s.n - 1] ?? 0;
                  const isOpen = open === s.n;
                  const isEditing = editing === s.n;
                  return (
                    <div key={s.n} className="rounded-xl border border-slate-200">
                      <div className="flex items-start justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="grid h-6 w-6 flex-none place-items-center rounded-md bg-violet-100 text-[12px] font-bold text-violet-700">
                              {s.n}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11.5px] font-medium text-slate-500">
                              {s.whenLabel}
                            </span>
                            <span className="rounded-md bg-green-50 px-2 py-0.5 text-[11.5px] font-medium text-green-700">
                              {sent} enviado{sent === 1 ? "" : "s"}
                            </span>
                            {s.edited && (
                              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11.5px] font-medium text-amber-700">
                                editado
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 truncate text-sm font-semibold text-slate-800">
                            {s.subjectPreview}
                          </p>
                        </div>
                        {!isEditing && (
                          <div className="flex flex-none gap-1.5">
                            <button
                              onClick={() => setOpen(isOpen ? null : s.n)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
                            >
                              {isOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                              {isOpen ? "Ocultar" : "Ver"}
                            </button>
                            <button
                              onClick={() => startEdit(s)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil size={13} /> Editar
                            </button>
                          </div>
                        )}
                      </div>

                      {isOpen && !isEditing && (
                        <div className="border-t border-slate-100 p-4">
                          <iframe
                            srcDoc={s.html}
                            title={`Correo ${s.n}`}
                            className="h-[460px] w-full rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      )}

                      {isEditing && (
                        <div className="border-t border-slate-100 p-4">
                          <label className="mb-1 block text-[12.5px] font-medium text-slate-500">Asunto</label>
                          <input
                            value={form.subject}
                            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
                          />
                          <label className="mb-1 block text-[12.5px] font-medium text-slate-500">Texto del correo</label>
                          <textarea
                            value={form.body}
                            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                            rows={14}
                            className="w-full rounded-lg border border-slate-300 p-3 font-mono text-[13px] leading-relaxed outline-none focus:border-violet-500"
                          />
                          <div className="mt-2 rounded-lg bg-slate-50 p-3 text-[12px] text-slate-500">
                            <b>Cómo escribir:</b> cada línea es un párrafo · <code>{"{nombre}"}</code> y{" "}
                            <code>{"{iglesia}"}</code> se rellenan solos · <code>**negrita**</code> para resaltar ·
                            una línea con <code>[OFERTA:Texto del botón]</code> pone el botón de pago ·{" "}
                            <code>[ZOOM:Texto del botón]</code> pone el botón de la llamada.
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => save(s.n)}
                              disabled={saving}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                            >
                              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                              Cancelar
                            </button>
                            {s.edited && (
                              <button
                                onClick={() => save(s.n, true)}
                                disabled={saving}
                                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                              >
                                <RotateCcw size={13} /> Restaurar original
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 text-center">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[12px] text-slate-500">{label}</div>
    </div>
  );
}
