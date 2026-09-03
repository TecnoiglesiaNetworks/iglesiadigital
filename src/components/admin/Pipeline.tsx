"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";
import {
  Search, Plus, LayoutGrid, Table2, RefreshCw, LogOut, CalendarCheck, Loader2, Trash2, Users, BarChart3, Webhook, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGES, STAGE_LABEL, TEMP_CLASS, type Lead } from "./stages";
import { LeadDrawer } from "./LeadDrawer";
import { AddLeadModal } from "./AddLeadModal";
import { UsersModal } from "./UsersModal";
import { IntegrationsModal } from "./IntegrationsModal";
import { EmailsModal } from "./EmailsModal";
import { WebinarModal } from "./WebinarModal";
import { WebinarsPanel } from "./WebinarsPanel";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}
// Puntos de "calidad" (madurez del diagnóstico) sobre 5.
function dots(score: number | null) {
  if (score == null) return 0;
  return Math.max(1, Math.min(5, Math.round(score / 20)));
}

export function Pipeline({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  // La pestaña activa se guarda en la URL (?vista=webinar) para que sobreviva
  // al recargar la página (F5). Se lee tras montar para no romper la hidratación.
  const [mode, setMode] = useState<"diagnostico" | "webinar">("diagnostico");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("vista") === "webinar") {
      setMode("webinar");
    }
  }, []);
  function changeMode(m: "diagnostico" | "webinar") {
    setMode(m);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (m === "webinar") url.searchParams.set("vista", "webinar");
      else url.searchParams.delete("vista");
      window.history.replaceState(null, "", url.toString());
    }
  }
  const [webinarOpen, setWebinarOpen] = useState(false);
  const [view, setView] = useState<"kanban" | "tabla">("kanban");
  const [search, setSearch] = useState("");
  const [calendlyOnly, setCalendlyOnly] = useState(false);
  const [sort, setSort] = useState<"recent" | "old" | "score">("recent");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [emailsOpen, setEmailsOpen] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  // ── Datos derivados ─────────────────────────────────────────────────────
  // Columnas del diagnóstico (el webinar tiene su propio panel).
  const activeStages = STAGES;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = leads.filter((l) => {
      // Diagnóstico: leads que no son exclusivos de webinar.
      if (l.source === "webinar") return false;
      if (calendlyOnly && !l.scheduled_at) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        (l.church || "").toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    });
    out = [...out].sort((a, b) => {
      if (sort === "score") return (b.score ?? -1) - (a.score ?? -1);
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sort === "recent" ? db - da : da - db;
    });
    return out;
  }, [leads, search, calendlyOnly, sort]);

  const stageOf = (l: Lead) => l.status;

  const byStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    for (const s of activeStages) map[s.id] = [];
    for (const l of filtered) (map[stageOf(l)] ??= []).push(l);
    return map;
  }, [filtered, activeStages]);

  // ── Acciones ────────────────────────────────────────────────────────────
  async function refresh() {
    const res = await fetch("/api/admin/leads");
    if (res.ok) {
      const json = await res.json();
      setLeads(json.leads);
    }
  }

  async function patchLead(id: number, fields: Record<string, unknown>) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...fields } : l))); // optimista
    setSelected((s) => (s && s.id === id ? { ...s, ...fields } : s));
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  }

  async function removeLead(id: number) {
    setLeads((ls) => ls.filter((l) => l.id !== id));
    setSelected(null);
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
  }

  // Controla la secuencia de emails de un lead (pausar, reanudar, detener, etc.).
  async function sequenceAction(id: number, action: string) {
    const res = await fetch(`/api/admin/leads/${id}/sequence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const json = await res.json().catch(() => ({}));
    if (json?.ok && json.lead) {
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...json.lead } : l)));
      setSelected((s) => (s && s.id === id ? { ...s, ...json.lead } : s));
    }
    return json;
  }

  async function syncCalendly() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/admin/calendly-sync", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setSyncMsg(`Revisadas ${json.checked} citas · ${json.matched} leads actualizados`);
        await refresh();
      } else {
        setSyncMsg(json.error || "No se pudo sincronizar");
      }
    } catch {
      setSyncMsg("Error de conexión con Calendly");
    } finally {
      setSyncing(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  function onDrop(stage: string) {
    if (dragId == null) return;
    const lead = leads.find((l) => l.id === dragId);
    if (lead && stageOf(lead) !== stage) {
      patchLead(dragId, { status: stage });
    }
    setDragId(null);
    setOverStage(null);
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col">
      {/* Cabecera */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {mode === "webinar" ? "Registros del Webinar" : "Pipeline de Ventas"}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === "webinar" ? "Seguimiento de los registrados al webinar" : "Gestiona tus leads y oportunidades"}
            </p>
          </div>
          {/* Toggle Diagnóstico | Webinar */}
          <div className="flex overflow-hidden rounded-lg border border-slate-200 text-sm font-medium">
            <button
              onClick={() => changeMode("diagnostico")}
              className={mode === "diagnostico" ? "bg-violet-600 px-3.5 py-2 text-white" : "bg-white px-3.5 py-2 text-slate-600 hover:bg-slate-50"}
            >
              Diagnóstico
            </button>
            <button
              onClick={() => changeMode("webinar")}
              className={mode === "webinar" ? "bg-violet-600 px-3.5 py-2 text-white" : "bg-white px-3.5 py-2 text-slate-600 hover:bg-slate-50"}
            >
              Webinar
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode === "webinar" && (
            <button
              onClick={() => setWebinarOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Mail size={15} /> Correos del webinar
            </button>
          )}
          {mode !== "webinar" && (
            <>
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus size={16} /> Agregar lead
              </button>
              <div className="flex overflow-hidden rounded-lg border border-slate-200">
                <button
                  onClick={() => setView("kanban")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${view === "kanban" ? "bg-violet-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  <LayoutGrid size={15} /> Kanban
                </button>
                <button
                  onClick={() => setView("tabla")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${view === "tabla" ? "bg-violet-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  <Table2 size={15} /> Tabla
                </button>
              </div>
            </>
          )}
          <a
            href="/admin/reportes"
            title="Reportes"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <BarChart3 size={15} /> Reportes
          </a>
          <button
            onClick={() => setEmailsOpen(true)}
            title="Secuencia de emails"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <Mail size={16} />
          </button>
          <button
            onClick={() => setIntegrationsOpen(true)}
            title="Integración Calendly (webhook)"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <Webhook size={16} />
          </button>
          <button
            onClick={() => setUsersOpen(true)}
            title="Usuarios del panel"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <Users size={16} />
          </button>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {mode === "webinar" ? (
        <WebinarsPanel />
      ) : (
      <>
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, iglesia o email…"
            className="w-[280px] max-w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-500"
          />
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={calendlyOnly}
            onChange={(e) => setCalendlyOnly(e.target.checked)}
            className="peer sr-only"
          />
          <span className="relative h-5 w-9 rounded-full bg-slate-300 transition-colors peer-checked:bg-violet-600 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
          Solo con cita Calendly
        </label>

        <label className="ml-auto inline-flex items-center gap-2 text-sm text-slate-600">
          Orden:
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-violet-500"
          >
            <option value="recent">Más recientes primero</option>
            <option value="old">Más antiguos primero</option>
            <option value="score">Mayor madurez primero</option>
          </select>
        </label>

        <button
          onClick={syncCalendly}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Sincronizar Calendly
        </button>
        {syncMsg && <span className="text-xs text-slate-500">{syncMsg}</span>}
      </div>

      {/* Contenido */}
      {view === "kanban" ? (
        <LayoutGroup>
          <div className="flex flex-1 gap-3 overflow-x-auto bg-slate-100 p-4">
            {activeStages.map((s) => {
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
                    "flex w-[280px] flex-none flex-col rounded-xl p-1 transition-all duration-200",
                    over && "bg-violet-50 ring-2 ring-inset ring-violet-300"
                  )}
                >
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.dot }} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</span>
                    <motion.span
                      key={items.length}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="ml-auto rounded-full bg-slate-200 px-2 text-xs font-semibold text-slate-600"
                    >
                      {items.length}
                    </motion.span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-0.5 pb-2">
                    {items.map((l) => (
                      <LeadCard
                        key={l.id}
                        lead={l}
                        dragging={dragId === l.id}
                        onClick={() => setSelected(l)}
                        onDelete={removeLead}
                        onDragStart={() => setDragId(l.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverStage(null);
                        }}
                      />
                    ))}
                    {over && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 44 }}
                        className="rounded-xl border-2 border-dashed border-violet-300 bg-violet-100/50"
                      />
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </LayoutGroup>
      ) : (
        <TableView leads={filtered} onOpen={setSelected} onDelete={removeLead} />
      )}
      </>
      )}

      {selected && (
        <LeadDrawer lead={selected} onClose={() => setSelected(null)} onPatch={patchLead} onDelete={removeLead} onSequence={sequenceAction} />
      )}
      {addOpen && <AddLeadModal onClose={() => setAddOpen(false)} onCreated={refresh} />}
      {usersOpen && <UsersModal onClose={() => setUsersOpen(false)} />}
      {integrationsOpen && <IntegrationsModal onClose={() => setIntegrationsOpen(false)} />}
      {emailsOpen && <EmailsModal onClose={() => setEmailsOpen(false)} />}
      {webinarOpen && <WebinarModal onClose={() => setWebinarOpen(false)} />}
    </div>
  );
}

// ── Tarjeta ─────────────────────────────────────────────────────────────────
function LeadCard({
  lead,
  dragging,
  onClick,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  dragging: boolean;
  onClick: () => void;
  onDelete: (id: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const filled = dots(lead.score);
  const sourceLabel = lead.source === "quiz" ? "diagnóstico" : lead.source;
  const date = lead.scheduled_at || lead.created_at;
  return (
    <motion.article
      layout
      layoutId={`lead-${lead.id}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      whileHover={{ y: -3 }}
      animate={{
        opacity: dragging ? 0.35 : 1,
        scale: dragging ? 0.97 : 1,
        boxShadow: dragging
          ? "0 20px 40px -12px rgba(124,58,237,0.45)"
          : "0 1px 2px 0 rgba(0,0,0,0.05)",
      }}
      transition={{ type: "spring", stiffness: 550, damping: 38, mass: 0.6 }}
      className={cn(
        "group relative cursor-grab select-none rounded-xl border bg-white p-3.5 active:cursor-grabbing",
        dragging ? "border-dashed border-violet-400" : "border-slate-200 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">{lead.name}</h3>
        <div className="mt-1 flex flex-none gap-0.5" title={`Madurez ${lead.score ?? "—"}%`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i < filled ? "bg-orange-400" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {lead.paid ? (
          <span className="rounded-md bg-green-100 px-1.5 py-0.5 text-[11px] font-semibold text-green-700">✓ pagado</span>
        ) : lead.seq_status === "active" ? (
          <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600">✉ secuencia</span>
        ) : null}
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${TEMP_CLASS[lead.temperature] || "bg-slate-300 text-white"}`}>
          {lead.temperature === "frio" ? "frío" : lead.temperature}
        </span>
        {lead.scheduled_at && (
          <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600">calendly</span>
        )}
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{sourceLabel}</span>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
        <CalendarCheck size={12} /> {fmtDate(date)}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`¿Eliminar a ${lead.name}? Esta acción no se puede deshacer.`)) {
              onDelete(lead.id);
            }
          }}
          title="Eliminar lead"
          className="ml-auto rounded-md p-1 text-slate-300 opacity-0 transition-colors hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.article>
  );
}

// ── Vista Tabla ───────────────────────────────────────────────────────────
function TableView({
  leads,
  onOpen,
  onDelete,
}: {
  leads: Lead[];
  onOpen: (l: Lead) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Iglesia</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Madurez</th>
              <th className="px-4 py-3">Etapa</th>
              <th className="px-4 py-3">Cita</th>
              <th className="px-4 py-3">Registrado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l) => (
              <tr key={l.id} onClick={() => onOpen(l)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{l.name}</td>
                <td className="px-4 py-3 text-slate-600">{l.church || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{l.email}</td>
                <td className="px-4 py-3 text-slate-600">{l.score != null ? `${l.score}%` : "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {STAGE_LABEL[l.status] || l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{l.scheduled_at ? fmtDate(l.scheduled_at) : "—"}</td>
                <td className="px-4 py-3 text-slate-500">{fmtDate(l.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Eliminar a ${l.name}? Esta acción no se puede deshacer.`)) {
                        onDelete(l.id);
                      }
                    }}
                    title="Eliminar lead"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">Sin leads todavía</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
