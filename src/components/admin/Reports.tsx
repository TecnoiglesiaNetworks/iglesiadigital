"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Users2, CalendarCheck, Trophy, Loader, Flame, TrendingUp,
} from "lucide-react";
import { STAGES, type Lead } from "./stages";

const CLOSED_WON = "ganado";
const CLOSED_LOST = "perdido";

export function Reports({ leads }: { leads: Lead[] }) {
  const m = useMemo(() => computeMetrics(leads), [leads]);

  return (
    <div className="min-h-screen">
      {/* Cabecera */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <a href="/admin" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <ArrowLeft size={16} />
          </a>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Reportes</h1>
            <p className="text-sm text-slate-500">Resumen de tu pipeline</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Kpi icon={<Users2 size={18} />} label="Total de leads" value={m.total} color="violet" />
          <Kpi
            icon={<CalendarCheck size={18} />}
            label="Citas agendadas"
            value={m.scheduled}
            sub={pct(m.scheduled, m.total) + "% del total"}
            color="blue"
          />
          <Kpi icon={<Trophy size={18} />} label="Cerrados ganados" value={m.won} color="green" />
          <Kpi icon={<Loader size={18} />} label="En proceso" value={m.pending} color="amber" />
          <Kpi
            icon={<TrendingUp size={18} />}
            label="Tasa de conversión"
            value={pct(m.won, m.total) + "%"}
            sub={`${m.won} de ${m.total}`}
            color="emerald"
          />
          <Kpi icon={<Flame size={18} />} label="Prospectos calientes" value={m.hot} color="red" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Por etapa */}
          <Card title="Leads por etapa" className="xl:col-span-2">
            <div className="space-y-2.5">
              {m.byStage.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="flex w-40 flex-none items-center gap-2 text-sm text-slate-600">
                    <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: s.dot }} />
                    <span className="truncate">{s.label}</span>
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.maxStage ? (s.count / m.maxStage) * 100 : 0}%` }}
                      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
                      className="h-full rounded-full"
                      style={{ background: s.dot }}
                    />
                  </div>
                  <span className="w-8 flex-none text-right text-sm font-semibold text-slate-700">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Por temperatura */}
          <Card title="Por temperatura">
            <Donut
              total={m.total}
              segments={[
                { label: "Caliente", value: m.temp.caliente, color: "#ef4444" },
                { label: "Tibio", value: m.temp.tibio, color: "#fb923c" },
                { label: "Frío", value: m.temp.frio, color: "#38bdf8" },
              ]}
            />
          </Card>

          {/* En el tiempo */}
          <Card title="Leads nuevos por día (últimos 30 días)" className="xl:col-span-2">
            <AreaChart series={m.daily} />
          </Card>

          {/* Por origen */}
          <Card title="Por origen">
            <div className="space-y-3 pt-1">
              {m.bySource.map((s) => (
                <div key={s.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-slate-600">{s.label}</span>
                    <span className="font-semibold text-slate-700">{s.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.total ? (s.count / m.total) * 100 : 0}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    />
                  </div>
                </div>
              ))}
              {m.bySource.length === 0 && <p className="text-sm text-slate-400">Sin datos</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Métricas ────────────────────────────────────────────────────────────────
function computeMetrics(leads: Lead[]) {
  const total = leads.length;
  const stageCount: Record<string, number> = {};
  const temp = { caliente: 0, tibio: 0, frio: 0 };
  const sourceCount: Record<string, number> = {};
  let scheduled = 0;

  for (const l of leads) {
    stageCount[l.status] = (stageCount[l.status] || 0) + 1;
    if (l.temperature === "caliente" || l.temperature === "tibio" || l.temperature === "frio") {
      temp[l.temperature]++;
    }
    // "Cita agendada" = etapa agendada o cita confirmada en Calendly.
    if (l.status === "agendado" || l.scheduled_at) scheduled++;
    const src = l.source === "quiz" ? "diagnóstico" : l.source || "otro";
    sourceCount[src] = (sourceCount[src] || 0) + 1;
  }

  const byStage = STAGES.map((s) => ({ id: s.id, label: s.label, dot: s.dot, count: stageCount[s.id] || 0 }));
  const maxStage = Math.max(1, ...byStage.map((s) => s.count));
  const won = stageCount[CLOSED_WON] || 0;
  const lost = stageCount[CLOSED_LOST] || 0;
  const pending = total - won - lost;
  const hot = temp.caliente;

  const bySource = Object.entries(sourceCount)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // Serie diaria de los últimos 30 días.
  const byDay: Record<string, number> = {};
  for (const l of leads) {
    const d = (l.created_at || "").slice(0, 10);
    if (d) byDay[d] = (byDay[d] || 0) + 1;
  }
  const daily: { label: string; value: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    daily.push({ label: key, value: byDay[key] || 0 });
  }

  return { total, byStage, maxStage, won, lost, pending, scheduled, hot, temp, bySource, daily };
}

function pct(n: number, total: number) {
  return total ? Math.round((n / total) * 100) : 0;
}

// ── Piezas de UI ──────────────────────────────────────────────────────────
const KPI_COLORS: Record<string, string> = {
  violet: "bg-violet-100 text-violet-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  red: "bg-red-100 text-red-600",
};
function Kpi({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${KPI_COLORS[color]}`}>
        {icon}
      </span>
      <div className="mt-3 text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

function Donut({ total, segments }: { total: number; segments: { label: string; value: number; color: string }[] }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const sum = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className="flex items-center gap-5">
      <svg width="130" height="130" viewBox="0 0 130 130" className="flex-none -rotate-90">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {segments.map((s) => {
          const len = (s.value / sum) * c;
          const el = (
            <motion.circle
              key={s.label}
              cx="65" cy="65" r={r} fill="none" stroke={s.color} strokeWidth="16"
              strokeDasharray={`${len} ${c - len}`}
              initial={{ strokeDashoffset: -offset - len }}
              animate={{ strokeDashoffset: -offset }}
              transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-slate-600">{s.label}</span>
            <span className="ml-auto font-semibold text-slate-700">{s.value}</span>
            <span className="w-9 text-right text-xs text-slate-400">{pct(s.value, total)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaChart({ series }: { series: { label: string; value: number }[] }) {
  const W = 640;
  const H = 160;
  const pad = 8;
  const max = Math.max(1, ...series.map((s) => s.value));
  const n = series.length;
  const x = (i: number) => pad + (i / (n - 1)) * (W - pad * 2);
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const line = series.map((s, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(s.value)}`).join(" ");
  const area = `${line} L ${x(n - 1)} ${H - pad} L ${x(0)} ${H - pad} Z`;
  const fmt = (k: string) => {
    const d = new Date(k + "T00:00:00");
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  };
  const totalPeriod = series.reduce((a, s) => a + s.value, 0);
  return (
    <div>
      <p className="mb-2 text-xs text-slate-400">{totalPeriod} leads en el periodo</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#areaFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>{fmt(series[0].label)}</span>
        <span>{fmt(series[Math.floor(n / 2)].label)}</span>
        <span>{fmt(series[n - 1].label)}</span>
      </div>
    </div>
  );
}
