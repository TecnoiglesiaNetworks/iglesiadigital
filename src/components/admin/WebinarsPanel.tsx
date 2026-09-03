"use client";
import { useEffect, useMemo, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import {
  Plus, Loader2, Radio, Star, Link2, Copy, Check, Pencil, Trash2, Send, Users, ArrowLeft, Save, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WEBINAR_STAGES, type Lead } from "./stages";

type Webinar = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  starts_at: string;
  youtube_url: string;
  whatsapp_group_url: string;
  join_image: string;
  active: number;
  registrations: number;
  startsAtLocal: string;
  dateLabel: string;
  timeLabel: string;
};

type RegLead = Lead & {
  reg_id: number;
  webinar_id: number;
  reg_status: string;
  reg_attended: number;
};

const emptyForm = { title: "", subtitle: "", startsAtLocal: "", youtubeUrl: "", whatsappGroupUrl: "" };

export function WebinarsPanel() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Webinar | null>(null);
  // Formulario de crear/editar. editingId=null → crear; número → editar.
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/webinars");
    const d = await res.json().catch(() => ({}));
    if (d?.ok) setWebinars(d.webinars);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
  }
  function openEdit(w: Webinar) {
    setEditingId(w.id);
    setForm({
      title: w.title,
      subtitle: w.subtitle,
      startsAtLocal: w.startsAtLocal,
      youtubeUrl: w.youtube_url,
      whatsappGroupUrl: w.whatsapp_group_url,
    });
    setFormOpen(true);
  }

  async function submitForm() {
    if (!form.title.trim() || !form.startsAtLocal.trim()) {
      alert("Falta el nombre o la fecha/hora del webinar.");
      return;
    }
    setSaving(true);
    const url = editingId ? `/api/admin/webinars/${editingId}` : "/api/admin/webinars";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (d?.ok) {
      setFormOpen(false);
      await load();
    } else {
      alert(d?.error || "No se pudo guardar");
    }
  }

  async function activate(w: Webinar) {
    await fetch(`/api/admin/webinars/${w.id}/activate`, { method: "POST" });
    await load();
  }

  async function remove(w: Webinar) {
    if (!confirm(`¿Eliminar el webinar "${w.title}" y sus ${w.registrations} registro(s)? No se puede deshacer.`)) return;
    await fetch(`/api/admin/webinars/${w.id}`, { method: "DELETE" });
    if (selected?.id === w.id) setSelected(null);
    await load();
  }

  if (selected) {
    return <RegistrationsView webinar={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Webinars</h2>
            <p className="text-sm text-slate-500">Crea webinars, comparte su enlace y gestiona sus registros.</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus size={16} /> Nuevo webinar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 size={18} className="animate-spin" /> Cargando…
          </div>
        ) : webinars.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
            Aún no hay webinars. Crea el primero con “Nuevo webinar”.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {webinars.map((w) => (
              <WebinarCard
                key={w.id}
                w={w}
                onOpen={() => setSelected(w)}
                onEdit={() => openEdit(w)}
                onActivate={() => activate(w)}
                onDelete={() => remove(w)}
              />
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <WebinarFormModal
          editing={editingId != null}
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={submitForm}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}

function WebinarCard({
  w, onOpen, onEdit, onActivate, onDelete,
}: {
  w: Webinar;
  onOpen: () => void;
  onEdit: () => void;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [inviteEligible, setInviteEligible] = useState<number | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const landingUrl = `/webinar/${w.slug}`;

  useEffect(() => {
    fetch(`/api/admin/webinars/${w.id}/invite`)
      .then((r) => r.json())
      .then((d) => d?.ok && setInviteEligible(d.eligible))
      .catch(() => {});
  }, [w.id]);

  function copyLink() {
    const abs = `${window.location.origin}${landingUrl}`;
    navigator.clipboard?.writeText(abs).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  async function invite() {
    const total = inviteEligible ?? 0;
    if (total <= 0) return;
    if (!confirm(`Vas a invitar a ${total} lead(s) a "${w.title}" por correo. ¿Continuar?`)) return;
    setInviting(true);
    setInviteMsg("Enviando…");
    let sentTotal = 0;
    try {
      for (let i = 0; i < 100; i++) {
        const res = await fetch(`/api/admin/webinars/${w.id}/invite`, { method: "POST" });
        const d = await res.json().catch(() => ({}));
        if (!d?.ok) {
          setInviteMsg(d?.error || "No se pudo enviar");
          break;
        }
        sentTotal += d.sent || 0;
        setInviteEligible(d.remaining ?? 0);
        setInviteMsg(`Enviadas ${sentTotal}… (quedan ${d.remaining ?? 0})`);
        if ((d.remaining ?? 0) <= 0 || (d.sent ?? 0) === 0) break;
      }
      setInviteMsg(`✅ Invitaciones enviadas: ${sentTotal}`);
    } catch {
      setInviteMsg("Error de conexión");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {w.active === 1 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                <Star size={11} /> Activo
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate text-[15px] font-bold text-slate-800">{w.title}</h3>
          <p className="text-[12.5px] text-slate-500">{w.dateLabel} · {w.timeLabel} (CDMX)</p>
        </div>
        <span className="flex flex-none items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[12.5px] font-semibold text-violet-700">
          <Users size={13} /> {w.registrations}
        </span>
      </div>

      {/* Enlace del landing */}
      <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
        <Link2 size={14} className="flex-none text-slate-400" />
        <span className="truncate text-[12.5px] text-slate-600">{landingUrl}</span>
        <button onClick={copyLink} title="Copiar enlace" className="ml-auto flex-none rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
        <a href={landingUrl} target="_blank" rel="noopener" title="Abrir landing" className="flex-none rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-violet-700"
        >
          <Users size={13} /> Registros
        </button>
        <button
          onClick={invite}
          disabled={inviting || (inviteEligible ?? 0) <= 0}
          title="Invitar por correo a leads que aún no están registrados"
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {inviting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Invitar{inviteEligible != null ? ` (${inviteEligible})` : ""}
        </button>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
        >
          <Pencil size={13} /> Editar
        </button>
        {w.active !== 1 && (
          <button
            onClick={onActivate}
            title="Marcar como el webinar destacado en /webinar"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <Star size={13} /> Activar
          </button>
        )}
        <button
          onClick={onDelete}
          title="Eliminar webinar"
          className="ml-auto rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {inviteMsg && <p className="mt-2 text-[11.5px] text-slate-500">{inviteMsg}</p>}
    </div>
  );
}

function WebinarFormModal({
  editing, form, setForm, saving, onSave, onClose,
}: {
  editing: boolean;
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = (k: keyof typeof emptyForm, v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[90vh] w-full max-w-[520px] flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Radio size={18} /> {editing ? "Editar webinar" : "Nuevo webinar"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">✕</button>
        </div>
        <div className="space-y-3 overflow-y-auto p-5">
          <Field label="Nombre del webinar">
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="La Gran Comisión también es Digital" className={inputCls} />
          </Field>
          <Field label="Subtítulo">
            <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Cómo usar Google, redes, publicidad e IA…" className={inputCls} />
          </Field>
          <Field label="Fecha y hora (CDMX)">
            <input type="datetime-local" value={form.startsAtLocal} onChange={(e) => set("startsAtLocal", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Link de YouTube (se envía 30 min antes)">
            <input value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/live/…" className={inputCls} />
          </Field>
          <Field label="Link del grupo de WhatsApp">
            <input value={form.whatsappGroupUrl} onChange={(e) => set("whatsappGroupUrl", e.target.value)} placeholder="https://chat.whatsapp.com/…" className={inputCls} />
          </Field>
          <p className="rounded-lg bg-slate-50 p-2.5 text-[12px] text-slate-500">
            {editing ? "El enlace del landing no cambia al editar." : "Se generará un enlace único (/webinar/nombre) al crear."} Los horarios por país se calculan solos.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-4">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {editing ? "Guardar cambios" : "Crear webinar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-[12px] font-medium text-slate-500">{label}</span>
      {children}
    </div>
  );
}

// ── Registros de un webinar (kanban por etapa) ────────────────────────────────
function RegistrationsView({ webinar, onBack }: { webinar: Webinar; onBack: () => void }) {
  const [regs, setRegs] = useState<RegLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [editing, setEditing] = useState<RegLead | null>(null);

  async function load() {
    const res = await fetch(`/api/admin/webinars/${webinar.id}/registrations`);
    const d = await res.json().catch(() => ({}));
    if (d?.ok) setRegs(d.registrations);
    setLoading(false);
  }

  // Guarda los datos editados del lead (nombre, WhatsApp, ciudad, iglesia).
  async function saveLead(leadId: number, fields: Partial<RegLead>) {
    setRegs((rs) => rs.map((r) => (r.id === leadId ? { ...r, ...fields } : r)));
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  }

  // Quita a la persona de ESTE webinar (no borra el lead ni sus otros embudos).
  async function removeReg(leadId: number) {
    setRegs((rs) => rs.filter((r) => r.id !== leadId));
    setEditing(null);
    await fetch(`/api/admin/webinars/${webinar.id}/registrations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
  }
  useEffect(() => {
    load();
  }, [webinar.id]);

  const byStage = useMemo(() => {
    const map: Record<string, RegLead[]> = {};
    for (const s of WEBINAR_STAGES) map[s.id] = [];
    for (const r of regs) (map[r.reg_status || "registrado"] ??= []).push(r);
    return map;
  }, [regs]);

  async function move(leadId: number, status: string) {
    setRegs((rs) => rs.map((r) => (r.id === leadId ? { ...r, reg_status: status } : r)));
    await fetch(`/api/admin/webinars/${webinar.id}/registrations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status }),
    });
  }

  function onDrop(stage: string) {
    if (dragId == null) return;
    const r = regs.find((x) => x.id === dragId);
    if (r && (r.reg_status || "registrado") !== stage) move(dragId, stage);
    setDragId(null);
    setOverStage(null);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-100">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={15} /> Webinars
        </button>
        <div>
          <h2 className="text-[15px] font-bold text-slate-800">{webinar.title}</h2>
          <p className="text-[12.5px] text-slate-500">{webinar.dateLabel} · {webinar.timeLabel} (CDMX) · {regs.length} registro(s)</p>
        </div>
        <a href={`/webinar/${webinar.slug}`} target="_blank" rel="noopener" className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <ExternalLink size={14} /> Ver landing
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Cargando registros…
        </div>
      ) : (
        <LayoutGroup>
          <div className="flex flex-1 gap-3 overflow-x-auto p-4">
            {WEBINAR_STAGES.map((s) => {
              const items = byStage[s.id] || [];
              const over = overStage === s.id;
              return (
                <section
                  key={s.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (overStage !== s.id) setOverStage(s.id);
                  }}
                  onDragLeave={() => setOverStage((cur) => (cur === s.id ? null : cur))}
                  onDrop={() => onDrop(s.id)}
                  className={cn(
                    "flex w-[260px] flex-none flex-col rounded-xl p-1 transition-all duration-200",
                    over && "bg-violet-50 ring-2 ring-inset ring-violet-300"
                  )}
                >
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.dot }} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</span>
                    <span className="ml-auto rounded-full bg-slate-200 px-2 text-xs font-semibold text-slate-600">{items.length}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-0.5 pb-2">
                    {items.map((r) => (
                      <motion.article
                        key={r.id}
                        layout
                        draggable
                        onDragStart={() => setDragId(r.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverStage(null);
                        }}
                        animate={{ opacity: dragId === r.id ? 0.35 : 1 }}
                        className={cn(
                          "group cursor-grab select-none rounded-xl border bg-white p-3 active:cursor-grabbing",
                          dragId === r.id ? "border-dashed border-violet-400" : "border-slate-200 hover:shadow-md"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-slate-800">{r.name}</h3>
                          <div className="flex flex-none gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => setEditing(r)}
                              title="Editar datos"
                              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Quitar a ${r.name} de este webinar?`)) removeReg(r.id);
                              }}
                              title="Quitar del webinar"
                              className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className="mt-0.5 truncate text-[12px] text-slate-500">{r.email}</p>
                        {(r.city || r.church) && (
                          <p className="mt-0.5 truncate text-[11.5px] text-slate-400">{r.church || r.city}</p>
                        )}
                        {r.paid === 1 && (
                          <span className="mt-2 inline-block rounded-md bg-green-100 px-1.5 py-0.5 text-[11px] font-semibold text-green-700">✓ pagado</span>
                        )}
                      </motion.article>
                    ))}
                    {over && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 44 }}
                        className="rounded-xl border-2 border-dashed border-violet-300 bg-violet-100/50"
                      />
                    )}
                    {items.length === 0 && !over && (
                      <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-[12px] text-slate-300">
                        —
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </LayoutGroup>
      )}

      {editing && (
        <RegEditModal
          reg={editing}
          onClose={() => setEditing(null)}
          onSave={saveLead}
          onDelete={removeReg}
        />
      )}
    </div>
  );
}

// Editar datos del registrado (o quitarlo del webinar).
function RegEditModal({
  reg, onClose, onSave, onDelete,
}: {
  reg: RegLead;
  onClose: () => void;
  onSave: (leadId: number, fields: Partial<RegLead>) => void;
  onDelete: (leadId: number) => void;
}) {
  const [f, setF] = useState({
    name: reg.name || "",
    whatsapp: reg.whatsapp || "",
    city: reg.city || "",
    church: reg.church || "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(reg.id, f);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex w-full max-w-[440px] flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Pencil size={17} /> Editar registrado
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">✕</button>
        </div>
        <div className="space-y-3 p-5">
          <Field label="Nombre">
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Correo (no editable)">
            <input value={reg.email} disabled className={`${inputCls} bg-slate-50 text-slate-400`} />
          </Field>
          <Field label="WhatsApp">
            <input value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Ciudad / País">
            <input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Iglesia">
            <input value={f.church} onChange={(e) => setF({ ...f, church: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 p-4">
          <button
            onClick={() => {
              if (confirm(`¿Quitar a ${reg.name} de este webinar?`)) onDelete(reg.id);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} /> Quitar del webinar
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
