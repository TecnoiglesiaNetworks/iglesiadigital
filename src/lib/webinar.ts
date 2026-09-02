/* =====================================================================
   Configuración central del Webinar. Cambia aquí los datos del evento y
   se reflejan en el landing, el contador y los correos. La fecha se guarda
   en ISO con offset de CDMX (UTC-6, sin horario de verano desde 2022).
   ===================================================================== */

export const WEBINAR = {
  title: "LA GRAN COMISIÓN TAMBIÉN ES DIGITAL",
  subtitle:
    "Cómo usar Google, redes sociales, publicidad e IA para alcanzar a más personas.",
  // Martes 8 de septiembre de 2026, 8:00 pm hora CDMX.
  startsAt: "2026-09-08T20:00:00-06:00",
  // Duración estimada (minutos). Define cuándo arranca la secuencia post-evento.
  durationMin: 90,
  // Etiqueta humana principal (hora CDMX).
  dateLabel: "Martes 8 de septiembre",
  timeLabel: "8:00 PM",
  timeZoneMain: "Hora de la Ciudad de México (CDMX)",
  // Grupo de WhatsApp del Paso 2 (seguimiento del evento).
  whatsappGroupUrl:
    "https://chat.whatsapp.com/INNZb29g5v216gjgVCnFon?s=sw&p=i&mlu=4&ilr=4",
  // Imagen que muestra cómo unirse al grupo (reemplázala en /public/webinar/).
  joinImage: "/webinar/como-unirte-al-grupo.png",
} as const;

/** Conversiones de horario (8:00 pm CDMX → resto de husos), para el landing. */
export const WEBINAR_TIMES: { region: string; time: string }[] = [
  { region: "🇲🇽 México (CDMX)", time: "8:00 PM" },
  { region: "🇬🇹🇸🇻🇭🇳🇳🇮🇨🇷 Centroamérica", time: "8:00 PM" },
  { region: "🇨🇴🇵🇪🇪🇨 Colombia · Perú · Ecuador", time: "9:00 PM" },
  { region: "🇺🇸 EE.UU. Este (Miami/NY)", time: "10:00 PM" },
  { region: "🇺🇸 EE.UU. Centro", time: "9:00 PM" },
  { region: "🇺🇸 EE.UU. Pacífico (Los Ángeles)", time: "7:00 PM" },
  { region: "🇧🇴🇻🇪🇩🇴 Bolivia · Venezuela · Rep. Dom.", time: "10:00 PM" },
  { region: "🇨🇱🇦🇷🇺🇾 Chile · Argentina · Uruguay", time: "11:00 PM" },
  { region: "🇪🇸 España", time: "4:00 AM (miércoles)" },
];
