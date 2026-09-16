"use client";
import { useEffect, useState } from "react";
import { X, Timer, Loader2, RotateCcw } from "lucide-react";

/* Ajusta la fecha límite de la cuenta regresiva de la oferta (quiz y /oferta).
   La hora se interpreta como CDMX. */
export function OfferModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/offer-deadline")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          setLocal(d.deadlineLocal || "");
          setIsDefault(!!d.isDefault);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(reset = false) {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/offer-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset ? { reset: true } : { deadlineLocal: local }),
      });
      const d = await res.json().catch(() => ({}));
      if (d?.ok) {
        setLocal(d.deadlineLocal || "");
        setIsDefault(!!d.isDefault);
        setMsg("✅ Guardado. Ya aplica en el quiz y en /oferta.");
      } else {
        setMsg(d?.error || "No se pudo guardar");
      }
    } catch {
      setMsg("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Timer size={18} /> Cuenta regresiva de la oferta
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Fecha y hora en que <b>termina la oferta</b> (cuenta regresiva del final del quiz y de{" "}
          <b>/oferta</b>). La hora es de <b>CDMX</b>. Al llegar, el contador muestra “La oferta cerró”.
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
            <Loader2 size={18} className="animate-spin" /> Cargando…
          </div>
        ) : (
          <>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Termina el (CDMX)</label>
            <input
              type="datetime-local"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
            {isDefault && (
              <p className="mt-2 text-[12px] text-slate-500">Usando la fecha por defecto (aún no la has personalizado).</p>
            )}
            {msg && <p className="mt-3 text-[13px] text-slate-600">{msg}</p>}

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                onClick={() => save(true)}
                disabled={saving}
                title="Volver a la fecha por defecto"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw size={14} /> Restablecer
              </button>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cerrar
                </button>
                <button
                  onClick={() => save(false)}
                  disabled={saving || !local}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null} Guardar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
