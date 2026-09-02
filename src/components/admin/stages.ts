// Etapas del pipeline (columnas del Kanban). El orden define el tablero.
export type StageId =
  | "nuevo"
  | "agendado"
  | "no_asistio"
  | "reagendar"
  | "llamada"
  | "interesado"
  | "seguimiento"
  | "ganado"
  | "perdido";

export const STAGES: { id: StageId; label: string; dot: string }[] = [
  { id: "nuevo", label: "Nuevo lead", dot: "#94a3b8" },
  { id: "agendado", label: "Cita agendada", dot: "#3b82f6" },
  { id: "no_asistio", label: "No asistió", dot: "#f97316" },
  { id: "reagendar", label: "Reagendar", dot: "#0f172a" },
  { id: "llamada", label: "Llamada realizada", dot: "#8b5cf6" },
  { id: "interesado", label: "Interesado", dot: "#22c55e" },
  { id: "seguimiento", label: "Seguimiento", dot: "#3b82f6" },
  { id: "ganado", label: "Cerrado ganado", dot: "#16a34a" },
  { id: "perdido", label: "Cerrado perdido", dot: "#334155" },
];

// Etapas del pipeline del WEBINAR (columnas cuando el panel está en modo webinar).
export const WEBINAR_STAGES: { id: string; label: string; dot: string }[] = [
  { id: "registrado", label: "Registrado", dot: "#94a3b8" },
  { id: "asistio", label: "Asistió", dot: "#22c55e" },
  { id: "no_asistio", label: "No asistió", dot: "#f97316" },
  { id: "seguimiento", label: "En seguimiento", dot: "#3b82f6" },
  { id: "cliente", label: "Cliente", dot: "#16a34a" },
  { id: "perdido", label: "Perdido", dot: "#334155" },
];

export const STAGE_LABEL: Record<string, string> = Object.fromEntries(
  [...STAGES, ...WEBINAR_STAGES].map((s) => [s.id, s.label])
);

export type Temperature = "caliente" | "tibio" | "frio";
export const TEMPS: { id: Temperature; label: string; className: string }[] = [
  { id: "caliente", label: "caliente", className: "bg-red-500 text-white" },
  { id: "tibio", label: "tibio", className: "bg-orange-400 text-white" },
  { id: "frio", label: "frío", className: "bg-sky-400 text-white" },
];
export const TEMP_CLASS: Record<string, string> = Object.fromEntries(
  TEMPS.map((t) => [t.id, t.className])
);

export type Lead = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  church: string | null;
  email: string;
  whatsapp: string | null;
  city: string | null;
  score: number | null;
  level: string | null;
  answers: string | null;
  result: string | null;
  status: string;
  temperature: string;
  source: string;
  notes: string | null;
  scheduled_at: string | null;
  calendly_uri: string | null;
  paid: number;
  paid_at: string | null;
  paid_amount: string | null;
  paypal_order_id: string | null;
  seq_status: string;
  seq_step: number;
  seq_next_at: string | null;
  unsubscribed: number;
};
