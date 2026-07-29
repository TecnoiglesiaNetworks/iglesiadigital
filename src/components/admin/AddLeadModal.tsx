"use client";
import { useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";

export function AddLeadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", church: "", whatsapp: "", city: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "No se pudo crear");
        return;
      }
      onCreated();
      onClose();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <UserPlus size={18} /> Agregar lead
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {(["name", "email", "church", "whatsapp", "city"] as const).map((k) => (
          <div key={k} className="mb-3">
            <label className="mb-1 block text-xs font-medium text-slate-500">{LABELS[k]}</label>
            <input
              value={form[k]}
              onChange={set(k)}
              type={k === "email" ? "email" : "text"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
          </div>
        ))}

        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          Crear lead
        </button>
      </form>
    </div>
  );
}

const LABELS: Record<string, string> = {
  name: "Nombre *",
  email: "Correo *",
  church: "Iglesia",
  whatsapp: "WhatsApp",
  city: "Ciudad y país",
};
