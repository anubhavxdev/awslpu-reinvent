import Link from "next/link";

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: LegalPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-6 pb-24 pt-36 text-white sm:px-10 md:px-16 md:pt-44 lg:px-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(108,0,255,0.16),transparent_55%)]" />

      <div className="relative mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-12 inline-flex text-xs tracking-[0.18em] text-white/50 transition-colors hover:text-[#FF2D87]"
        >
          ← BACK TO HOME
        </Link>

        <header className="border-b border-white/15 pb-12">
          <p className="mb-6 text-xs tracking-[0.2em] text-[#FF2D87]">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.88] tracking-[-0.075em]">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60">
            {description}
          </p>
          <p className="mt-6 text-xs tracking-[0.12em] text-white/35">
            LAST UPDATED: {updated}
          </p>
        </header>

        <div className="divide-y divide-white/10">
          {sections.map((section) => (
            <section key={section.title} className="py-10">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-5 text-base leading-8 text-white/60"
                >
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-5 space-y-3 pl-5 text-base leading-8 text-white/60">
                  {section.items.map((item) => (
                    <li key={item} className="list-disc pl-2">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
