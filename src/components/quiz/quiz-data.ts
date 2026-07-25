export type Option = { label: string; value: string | number; points: number | null };
export type Question = {
  id: string;
  scored: boolean;
  dim: string;
  q: string;
  options: Option[];
};

const opt = (label: string, value: string | number, points: number | null = null): Option => ({
  label,
  value,
  points,
});

export const questions: Question[] = [
  {
    id: "rol",
    scored: false,
    dim: "Para conocerte",
    q: "¿Cuál es tu rol en la iglesia?",
    options: [opt("Pastor(a) principal", "pastor"), opt("Líder o voluntario", "lider"), opt("Encargado de medios / tecnología", "medios"), opt("Otro", "otro")],
  },
  {
    id: "tam",
    scored: false,
    dim: "Para conocerte",
    q: "¿Qué tamaño tiene tu congregación?",
    options: [opt("Menos de 50", "xs"), opt("50 a 150", "s"), opt("150 a 500", "m"), opt("Más de 500", "l")],
  },
  {
    id: "web",
    scored: true,
    dim: "Presencia web",
    q: "¿Tu iglesia tiene un sitio web propio?",
    options: [opt("No, ninguno", 0, 0), opt("Solo redes sociales", 1, 1), opt("Sí, pero básico o desactualizado", 2, 2), opt("Sí, pensado para recibir visitantes", 3, 3)],
  },
  {
    id: "legal",
    scored: true,
    dim: "Google Grant",
    q: "¿Tu iglesia está registrada como organización sin fines de lucro (donataria)?",
    options: [opt("No", 0, 0), opt("No estoy seguro", 1, 1), opt("En trámite", 2, 2), opt("Sí, ya está registrada", 3, 3)],
  },
  {
    id: "grant",
    scored: true,
    dim: "Google Grant",
    q: "Google regala hasta $10,000 USD/mes en publicidad a iglesias que califican. ¿Dónde estás?",
    options: [opt("No lo sabía", 0, 0), opt("Lo conozco, pero no lo he solicitado", 1, 1), opt("Lo estoy tramitando", 2, 2), opt("Ya lo tengo activo", 3, 3)],
  },
  {
    id: "redes",
    scored: true,
    dim: "Redes sociales",
    q: "¿Con qué frecuencia publica tu iglesia en redes?",
    options: [opt("Casi nunca o no tenemos", 0, 0), opt("De vez en cuando, sin plan", 1, 1), opt("Cada semana", 2, 2), opt("Con calendario y estrategia", 3, 3)],
  },
  {
    id: "stream",
    scored: true,
    dim: "Transmisiones",
    q: "¿Transmiten sus servicios en vivo?",
    options: [opt("No transmitimos", 0, 0), opt("A veces, con el celular", 1, 1), opt("Cada domingo, de forma básica", 2, 2), opt("Con equipo y producción cuidada", 3, 3)],
  },
  {
    id: "seg",
    scored: true,
    dim: "Embudo y seguimiento",
    q: "Cuando alguien nuevo te descubre en línea, ¿qué pasa después?",
    options: [opt("Nada, no hay paso siguiente", 0, 0), opt("Ve el contenido y ahí queda", 1, 1), opt("Le damos seguimiento a mano", 2, 2), opt("Un sistema capta sus datos y da seguimiento", 3, 3)],
  },
  {
    id: "equipo",
    scored: true,
    dim: "Equipo digital",
    q: "¿Quién se encarga de lo digital en tu iglesia?",
    options: [opt("Nadie fijo", 0, 0), opt("El pastor en sus ratos", 1, 1), opt("Un voluntario", 2, 2), opt("Un equipo con roles definidos", 3, 3)],
  },
];

export const tips: Record<string, [string, string]> = {
  "Presencia web": ["Crea una página para el visitante, no para el que ya asiste", "Horarios, ubicación, qué esperar y un botón de “planear mi visita” convierten curiosos en asistentes."],
  "Google Grant": ["Aprovecha (o solicita) el Google Ad Grant", "Si estás registrado como donataria aplicas a $10,000 USD/mes gratis; si no, empieza el registro: es el mayor retorno posible."],
  "Redes sociales": ["Cambia volumen por constancia con propósito", "Un plan simple de 3 publicaciones semanales con intención rinde más que 20 improvisadas."],
  Transmisiones: ["Prioriza el audio y la constancia", "No necesitas un estudio: buen audio y una transmisión fija cada semana retienen a quien te descubre en línea."],
  "Embudo y seguimiento": ["Deja de perder a quien ya te encontró", "Sin un sistema que capte datos y dé seguimiento, cada visita en línea se evapora. Aquí se pierde la mayoría del fruto."],
  "Equipo digital": ["Asigna 3 roles básicos", "Contenido, transmisión y seguimiento: lo digital sin responsables no avanza por más herramientas que tengas."],
};
