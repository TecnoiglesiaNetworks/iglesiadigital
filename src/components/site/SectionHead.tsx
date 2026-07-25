import { Reveal } from "./Reveal";

export function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="mx-auto mb-14 max-w-[640px] text-center">
      <span className="mb-5 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent before:h-px before:w-5 before:bg-accent before:opacity-70 before:content-['']">
        {eyebrow}
      </span>
      <h2 className="font-display text-[clamp(28px,4.4vw,44px)] font-bold leading-[1.08] tracking-tight">
        {title}
      </h2>
      {sub && <p className="mt-4 text-[17.5px] text-muted">{sub}</p>}
    </Reveal>
  );
}
