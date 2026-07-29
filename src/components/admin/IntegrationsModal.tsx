"use client";
import { useState } from "react";
import { X, Webhook, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function IntegrationsModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    { ok: true; callbackUrl: string } | { ok: false; error: string } | null
  >(null);

  async function registerWebhook() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/calendly-webhook-setup", { method: "POST" });
      const json = await res.json();
      if (json.ok) setResult({ ok: true, callbackUrl: json.callbackUrl });
      else setResult({ ok: false, error: json.error || "No se pudo registrar" });
    } catch {
      setResult({ ok: false, error: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Webhook size={18} /> Integración con Calendly
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Registra el webhook para que, cuando alguien agende la{" "}
          <b>&quot;Asesoría Iglesia Digital&quot;</b> en Calendly, el lead pase solo a{" "}
          <b>Cita agendada</b>. Se hace <b>una sola vez</b>, después de desplegar el sitio.
        </p>

        <button
          onClick={registerWebhook}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Webhook size={16} />}
          Registrar webhook de Calendly
        </button>

        {result?.ok && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={16} /> Webhook registrado
            </div>
            <p className="mt-1 break-all text-green-600">{result.callbackUrl}</p>
            <p className="mt-1 text-xs text-green-600">
              Ya está activo. Puedes verificarlo en Calendly → Integraciones → Webhooks.
            </p>
          </div>
        )}

        {result && !result.ok && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle size={16} /> No se pudo registrar
            </div>
            <p className="mt-1 text-red-600">{result.error}</p>
            <p className="mt-2 text-xs text-red-500">
              Revisa que en el servidor estén <code>CALENDLY_TOKEN</code>,{" "}
              <code>CALENDLY_WEBHOOK_SIGNING_KEY</code> y <code>PUBLIC_BASE_URL</code> (URL pública).
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Nota: en local no funciona (Calendly necesita una URL pública). Úsalo ya desplegado.
        </p>
      </div>
    </div>
  );
}
