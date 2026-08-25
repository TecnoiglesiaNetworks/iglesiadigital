"use client";
import { useEffect, useState } from "react";
import { X, Mail, Loader2, Eye, EyeOff } from "lucide-react";

type Step = { n: number; whenLabel: string; subject: string; html: string };
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

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/sequence")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.ok) return;
        setSteps(d.steps || []);
        setStats(d.stats || null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-[720px] flex-col rounded-2xl bg-white shadow-2xl"
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
              {/* Estadísticas */}
              {stats && (
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="En secuencia" value={stats.active} color="text-green-600" />
                  <Stat label="Pausadas" value={stats.paused} color="text-amber-600" />
                  <Stat label="Completadas" value={stats.done} color="text-violet-600" />
                  <Stat label="Correos enviados" value={stats.totalSent} color="text-slate-800" />
                </div>
              )}

              <p className="mb-4 text-[13px] text-slate-500">
                Estos son los correos que reciben los leads que no pagan. Vista previa con datos de
                ejemplo. Para ajustar un texto, dime cuál y lo cambio.
              </p>

              {/* Lista de correos */}
              <div className="space-y-3">
                {steps.map((s) => {
                  const sent = stats?.sentByStep[s.n - 1] ?? 0;
                  const isOpen = open === s.n;
                  return (
                    <div key={s.n} className="rounded-xl border border-slate-200">
                      <div className="flex items-start justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="grid h-6 w-6 flex-none place-items-center rounded-md bg-violet-100 text-[12px] font-bold text-violet-700">
                              {s.n}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11.5px] font-medium text-slate-500">
                              {s.whenLabel}
                            </span>
                            <span className="rounded-md bg-green-50 px-2 py-0.5 text-[11.5px] font-medium text-green-700">
                              {sent} enviado{sent === 1 ? "" : "s"}
                            </span>
                          </div>
                          <p className="mt-1.5 truncate text-sm font-semibold text-slate-800">{s.subject}</p>
                        </div>
                        <button
                          onClick={() => setOpen(isOpen ? null : s.n)}
                          className="inline-flex flex-none items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {isOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                          {isOpen ? "Ocultar" : "Vista previa"}
                        </button>
                      </div>
                      {isOpen && (
                        <div className="border-t border-slate-100 p-4">
                          <iframe
                            srcDoc={s.html}
                            title={`Correo ${s.n}`}
                            className="h-[460px] w-full rounded-lg border border-slate-200 bg-white"
                          />
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
