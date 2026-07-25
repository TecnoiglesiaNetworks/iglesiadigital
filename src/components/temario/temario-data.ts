export type Week = { n: number; title: string; items: string[] };
export type Month = { label: string; title: string; weeks: Week[] };

export const modulo0 = {
  title: "Módulo 0 · Bienvenida general",
  items: [
    "Video de bienvenida al curso",
    "Guía de uso de la plataforma",
    "Introducción a la estructura del programa y el acompañamiento",
  ],
};

export const months: Month[] = [
  {
    label: "Mes 1",
    title: "Fundamentos y estructura digital",
    weeks: [
      { n: 1, title: "Introducción + Formación de equipos", items: ["Cómo armar el equipo ideal", "Documentos editables para definir roles, seguimientos y responsables del equipo digital"] },
      { n: 2, title: "Cultura digital + Diagnóstico actual", items: ["Errores comunes en la digitalización", "Checklist para diagnosticar el estado digital actual de tu iglesia"] },
      { n: 3, title: "Documentación para Google Grant", items: ["Registro paso a paso en las plataformas requeridas", "Lista de requisitos y documentación para obtener el Google Ad Grant"] },
      { n: 4, title: "Estructura operativa", items: ["Herramientas para el trabajo en equipo digital", "Plantilla para definir la estructura operativa del ministerio digital"] },
    ],
  },
  {
    label: "Mes 2",
    title: "Construcción digital",
    weeks: [
      { n: 5, title: "Sitio web base", items: ["Cómo estructurar un sitio web efectivo", "Checklist con los elementos esenciales"] },
      { n: 6, title: "Desarrollo web + Church Online Platform", items: ["Conoce y entiende Church Online Platform", "Guía paso a paso para configurarla y usarla en tu iglesia"] },
      { n: 7, title: "Streaming y staff técnico", items: ["Roles clave en transmisiones y producción de video", "Evaluación de capacidades y equipo técnico"] },
      { n: 8, title: "Simulacro de servicio en vivo", items: ["Errores comunes en las transmisiones", "Checklist para realizar simulacros en vivo"] },
    ],
  },
  {
    label: "Mes 3",
    title: "Tráfico, publicidad y embudo digital",
    weeks: [
      { n: 9, title: "Activación de Google Grant", items: ["Configuración inicial de Google Ads", "Guía práctica para obtener el beneficio de $10,000 USD mensuales", "Uso de la herramienta de IA SmartReach Ads"] },
      { n: 10, title: "Embudo de conversión", items: ["Formularios de seguimiento para decisiones espirituales", "Plantilla para diseñar tu embudo de conversión digital"] },
      { n: 11, title: "Publicidad orgánica", items: ["Ideas de contenido con impacto emocional", "Checklist de acciones gratuitas para crecer en redes"] },
      { n: 12, title: "Monitoreo y ajustes", items: ["Cómo evaluar tus resultados digitales", "Plantilla de reporte de métricas"] },
    ],
  },
  {
    label: "Mes 4",
    title: "Lanzamiento y seguimiento",
    weeks: [
      { n: 13, title: "Preparación del lanzamiento", items: ["Planificación de la semana de impacto", "Checklist de preparativos para el evento digital"] },
      { n: 14, title: "Lanzamiento", items: ["Cómo maximizar el día del evento", "Guía práctica para ejecutar tu servicio de lanzamiento"] },
      { n: 15, title: "Seguimiento y afirmación", items: ["Organización de grupos de afirmación online", "Protocolo para el seguimiento espiritual y la conexión"] },
      { n: 16, title: "Evaluación final y certificación", items: ["Cómo presentar tus resultados", "Checklist de cierre y certificado de culminación"] },
    ],
  },
];
