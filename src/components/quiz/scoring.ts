import { questions, tips } from "./quiz-data";

export type Answer = { label: string; value: string | number; points: number | null };
export type Answers = Record<string, Answer>;

export type Result = {
  pct: number;
  level: string;
  levelSub: string;
  dims: { name: string; pct: number }[];
  wins: { title: string; body: string }[];
  grantCallout: { title: string; body: string } | null;
};

export function computeResult(answers: Answers): Result {
  const dims: Record<string, { sum: number; max: number }> = {};
  for (const q of questions) {
    if (!q.scored) continue;
    const a = answers[q.id];
    if (!dims[q.dim]) dims[q.dim] = { sum: 0, max: 0 };
    dims[q.dim].max += 3;
    dims[q.dim].sum += a?.points ?? 0;
  }
  let sum = 0;
  let max = 0;
  Object.values(dims).forEach((d) => {
    sum += d.sum;
    max += d.max;
  });
  const pct = max ? Math.round((sum / max) * 100) : 0;

  let level: string, levelSub: string;
  if (pct <= 25) {
    level = "Nivel 1 · Iglesia Invisible";
    levelSub = "Tu iglesia casi no aparece para quien la busca desde su celular. La buena noticia: el mayor salto de crecimiento suele venir justo de aquí.";
  } else if (pct <= 50) {
    level = "Nivel 2 · Presencia Básica";
    levelSub = "Ya diste los primeros pasos, pero sin un sistema detrás. Estás dejando sobre la mesa a muchas personas que ya te están buscando.";
  } else if (pct <= 75) {
    level = "Nivel 3 · En Crecimiento";
    levelSub = "Vas por buen camino y tienes bases sólidas. Ahora se trata de conectar las piezas para que trabajen como un solo sistema.";
  } else {
    level = "Nivel 4 · Iglesia Digital";
    levelSub = "Tu iglesia está en el grupo más avanzado. El foco ahora es optimizar, medir y multiplicar lo que ya funciona.";
  }

  const sorted = Object.keys(dims)
    .map((d) => ({ name: d, pct: Math.round((dims[d].sum / dims[d].max) * 100) }))
    .sort((a, b) => a.pct - b.pct);

  const wins = sorted.slice(0, 3).map((r) => {
    const t = tips[r.name] ?? [`Fortalece ${r.name}`, ""];
    return { title: t[0], body: t[1] };
  });

  const legal = answers["legal"];
  const grant = answers["grant"];
  let grantCallout: Result["grantCallout"] = null;
  if (legal && (legal.points ?? 0) >= 2 && grant && (grant.points ?? 0) <= 1) {
    grantCallout = {
      title: "Podrías estar recibiendo $10,000 USD/mes en Google Ads",
      body: "Tu iglesia parece calificar para el Google Ad Grant y aún no lo usas: es el activo digital más desaprovechado por las iglesias que atendemos.",
    };
  } else if (grant && grant.points === 0) {
    grantCallout = {
      title: "El dinero de Google que casi nadie aprovecha",
      body: "Google entrega hasta $10,000 USD/mes en publicidad a iglesias registradas como organización sin fines de lucro. Es de las palancas de crecimiento más grandes que existen hoy.",
    };
  }

  return { pct, level, levelSub, dims: sorted, wins, grantCallout };
}
