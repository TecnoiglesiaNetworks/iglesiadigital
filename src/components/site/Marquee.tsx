const items = [
  ["Los eventos presenciales ahora son ", "transmisiones en vivo"],
  ["Las invitaciones físicas ahora son ", "links compartidos"],
  ["Las campañas impresas se volvieron ", "publicaciones en redes"],
  ["Los anuncios en la calle ahora son ", "Ads en Google"],
  ["El discipulado ahora incluye ", "Zoom y WhatsApp"],
  ["El primer contacto es ", "digital antes de entrar al templo"],
];

export function Marquee() {
  const loop = [...items, ...items];
  return (
    <div className="marquee-mask overflow-hidden border-y border-line bg-gradient-to-b from-bg2 to-bg py-[22px]">
      <div className="animate-marquee flex w-max">
        {loop.map((it, i) => (
          <span key={i} className="flex items-center whitespace-nowrap px-[34px] font-display text-[19px] font-semibold text-muted">
            <span>
              {it[0]}
              <b className="text-ink">{it[1]}</b>
            </span>
            <span className="ml-[34px] h-1.5 w-1.5 rounded-full bg-accent opacity-70" />
          </span>
        ))}
      </div>
    </div>
  );
}
