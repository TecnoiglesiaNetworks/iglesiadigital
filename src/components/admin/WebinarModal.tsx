"use client";
import { useEffect, useState } from "react";
import { X, Mail, Loader2, Eye, EyeOff, Pencil, Save, RotateCcw } from "lucide-react";

type Tpl = {
  key: string;
  label: string;
  whenLabel: string;
  subjectRaw: string;
  bodyRaw: string;
  subjectPreview: string;
  html: string;
  edited: boolean;
};

export function WebinarModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Tpl[]>([]);
  const [sequence, setSequence] = useState<Tpl[]>([]);
  const [invite, setInvite] = useState<Tpl[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: "", body: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/webinar/templates")
      .then((r) => r.json())
      .then((tpls) => {
        if (!alive) return;
        if (tpls?.ok) {
          setReminders(tpls.reminders || []);
          setSequence(tpls.sequence || []);
          setInvite(tpls.invite || []);
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  function startEdit(t: Tpl) {
    setEditing(t.key);
    setOpen(null);
    setForm({ subject: t.subjectRaw, body: t.bodyRaw });
  }

  async function save(key: string, reset = false) {
    setSaving(true);
    const res = await fetch("/api/admin/webinar/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reset ? { key, reset: true } : { key, subject: form.subject, body: form.body }),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (d?.ok) {
      setReminders(d.reminders || []);
      setSequence(d.sequence || []);
      setInvite(d.invite || []);
      setEditing(null);
    } else {
      alert(d?.error || "No se pudo guardar");
    }
  }

  function renderCard(t: Tpl) {
    const isOpen = open === t.key;
    const isEditing = editing === t.key;
    return (
      <div key={t.key} className="rounded-xl border border-slate-200">
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11.5px] font-medium text-slate-500">{t.whenLabel}</span>
              <span className="text-[12.5px] font-semibold text-slate-700">{t.label}</span>
              {t.edited && (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11.5px] font-medium text-amber-700">editado</span>
              )}
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-slate-800">{t.subjectPreview}</p>
          </div>
          {!isEditing && (
            <div className="flex flex-none gap-1.5">
              <button
                onClick={() => setOpen(isOpen ? null : t.key)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
              >
                {isOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                {isOpen ? "Ocultar" : "Ver"}
              </button>
              <button
                onClick={() => startEdit(t)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={13} /> Editar
              </button>
            </div>
          )}
        </div>

        {isOpen && !isEditing && (
          <div className="border-t border-slate-100 p-4">
            <iframe srcDoc={t.html} title={t.label} className="h-[460px] w-full rounded-lg border border-slate-200 bg-white" />
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
              rows={12}
              className="w-full rounded-lg border border-slate-300 p-3 font-mono text-[13px] leading-relaxed outline-none focus:border-violet-500"
            />
            <div className="mt-2 rounded-lg bg-slate-50 p-3 text-[12px] text-slate-500">
              <b>Cómo escribir:</b> cada línea es un párrafo · <code>{"{nombre}"}</code> y{" "}
              <code>{"{iglesia}"}</code> se rellenan solos · <code>**negrita**</code> para resaltar ·{" "}
              <code>[GRUPO:Texto]</code> = botón al grupo de WhatsApp · <code>[YOUTUBE:Texto]</code> = botón al link de YouTube ·{" "}
              <code>[OFERTA:Texto]</code> = botón a la oferta del curso.
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => save(t.key)}
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
              {t.edited && (
                <button
                  onClick={() => save(t.key, true)}
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
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[780px] flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Mail size={18} /> Correos del Webinar
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
              <p className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[12.5px] text-slate-500">
                Estos textos son <b>compartidos por todos los webinars</b>. Los datos de cada uno (nombre, fecha, link de YouTube) se toman del webinar correspondiente y se rellenan solos con <code>{"{fecha}"}</code>, <code>{"{hora}"}</code> y los botones.
              </p>

              {/* Invitación (a leads del diagnóstico) */}
              <h3 className="mb-2 text-sm font-bold text-slate-700">Invitación al webinar</h3>
              <p className="mb-3 text-[12.5px] text-slate-500">
                Este es el correo que se envía a los leads cuando usas <b>“Invitar”</b> en un webinar. Puedes editarlo.
              </p>
              <div className="mb-7 space-y-3">{invite.map(renderCard)}</div>

              {/* Recordatorios */}
              <h3 className="mb-2 text-sm font-bold text-slate-700">Recordatorios (antes y durante el evento)</h3>
              <p className="mb-3 text-[12.5px] text-slate-500">
                Se envían automáticamente según la fecha del evento. Puedes editar cada texto.
              </p>
              <div className="space-y-3">{reminders.map(renderCard)}</div>

              {/* Secuencia post-evento */}
              <h3 className="mb-2 mt-7 text-sm font-bold text-slate-700">Secuencia de venta (después del webinar · 7 días)</h3>
              <p className="mb-3 text-[12.5px] text-slate-500">
                Arranca al terminar el evento, 1 correo por día. Se detiene sola cuando el registrado pasa a <b>Cliente</b> (o paga).
              </p>
              <div className="space-y-3">{sequence.map(renderCard)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
