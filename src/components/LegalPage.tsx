import { PageHeader } from "@/components/PageHeader";

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: React.ReactNode }[] }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} />
      <section className="bg-cream py-14 md:py-20">
        <div className="container-x max-w-3xl">
          <p className="mb-10 border-l-4 border-cobalt bg-white p-4 text-sm">
            Template wording — last updated {updated}. Please have this reviewed and adapted by a qualified professional before relying on it.
          </p>
          <div className="space-y-9">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="display text-2xl">{s.h}</h2>
                <div className="mt-3 space-y-3 leading-relaxed text-espresso/80">{s.p}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
