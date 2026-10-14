import Image from "next/image";
import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

export function Intro({ t }: { t: Dictionary }) {
  return (
    <section aria-labelledby="intro-titol" className="grain relative overflow-hidden bg-forn py-[clamp(5rem,12vw,10rem)]">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="reveal">
          <p className="eyebrow text-argila">{t.intro.eyebrow}</p>
          <h2 id="intro-titol" className="display mt-5 text-[clamp(2.4rem,5vw,4.6rem)]">
            {t.intro.title}
          </h2>
        </div>
        <p className="reveal text-lg leading-relaxed text-calc/80 lg:pt-12 lg:text-xl" style={{ "--i": 1 } as CSSProperties}>
          {t.intro.body}
        </p>
      </div>

      <div className="container-x mt-16">
        <div className="reveal relative aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <Image src="/images/fabrica-corca.webp" alt={t.intro.imageAlt} fill sizes="92vw" className="object-cover" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-forn/60 to-transparent" />
        </div>
      </div>

      <dl className="container-x mt-6 grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-4">
        {t.intro.stats.map((stat, i) => (
          <div key={stat.label} className="reveal flex flex-col-reverse gap-3 border-t border-calc/15 py-6 pr-6" style={{ "--i": i } as CSSProperties}>
            <dt className="text-sm leading-snug text-fang">{stat.label}</dt>
            <dd className="display num text-[clamp(2.6rem,5vw,4.5rem)] text-argila">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
