type Tone = "light" | "dark";

/**
 * TEMPEST mark: a geometric T whose stem is a lightning bolt, crowned.
 * tone="light" → for light backgrounds (espresso T). tone="dark" → for dark backgrounds (sand T).
 */
export function LogoMark({ tone = "light", className = "h-10 w-10" }: { tone?: Tone; className?: string }) {
  const bar = tone === "light" ? "#30201D" : "#D8C2A3";
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Tempest icon" fill="none">
      <polygon points="23,13 23,5 28,9 32,3 36,9 41,5 41,13" fill="#315BCE" />
      <polygon points="7,16 57,16 57,23 52,28 7,28" fill={bar} />
      <polygon points="25,28 39,28 34,41 42,41 27,62 31,47 22,47" fill="#315BCE" />
    </svg>
  );
}

export function Logo({ tone = "light", className = "" }: { tone?: Tone; className?: string }) {
  const text = tone === "light" ? "text-espresso" : "text-cream";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark tone={tone} className="h-7 w-7 shrink-0 sm:h-9 sm:w-9" />
      <span className={`flex flex-col leading-none ${text}`}>
        <span className="font-display text-[clamp(0.92rem,4vw,1.35rem)] font-extrabold tracking-[0.08em] sm:tracking-[0.12em]">TEMPEST</span>
        <span className="mt-1 text-[0.38rem] font-semibold tracking-[0.3em] sm:text-[0.5rem] sm:tracking-[0.42em]">BARBER LOUNGE</span>
      </span>
    </span>
  );
}
