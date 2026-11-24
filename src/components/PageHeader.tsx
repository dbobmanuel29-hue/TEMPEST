export function PageHeader({ eyebrow, title, intro, tone = "sand" }: { eyebrow: string; title: React.ReactNode; intro?: string; tone?: "sand" | "dark" }) {
  return (
    <section className={tone === "dark" ? "bg-espresso text-cream" : "bg-sand"}>
      <div className="container-x py-16 md:py-24">
        <p className={`eyebrow ${tone === "dark" ? "text-sand" : "text-cobalt"}`} data-reveal>{eyebrow}</p>
        <h1 className="display mt-4 text-[clamp(2.6rem,7vw,5.5rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>{title}</h1>
        {intro && (
          <p className={`mt-6 max-w-xl text-lg leading-relaxed ${tone === "dark" ? "text-cream/75" : "text-espresso/75"}`} data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
