import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { fill, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { productsIn } from "@/data/products";
import { COLLECTION_KEYS, SECTION_IDS, collectionPath } from "@/lib/routes";

/** Graella asimètrica: les gelosies (la família més gran) manen. */
const LAYOUT: Record<(typeof COLLECTION_KEYS)[number], string> = {
  gelosies: "md:col-span-7 md:row-span-2 aspect-[4/5] md:aspect-auto",
  rajoles: "md:col-span-5 aspect-[4/3]",
  lavabos: "md:col-span-5 aspect-[4/3]",
  elements: "md:col-span-12 aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/8]",
};

export function Collections({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id={SECTION_IDS.collections} aria-labelledby="colleccions-titol" className="on-light bg-calc py-[clamp(5rem,11vw,9rem)] text-carbo">
      <div className="container-x">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <div className="reveal">
            <p className="eyebrow text-terra">{t.collections.eyebrow}</p>
            <h2 id="colleccions-titol" className="display mt-4 text-[clamp(2.4rem,5.4vw,5rem)]">
              {t.collections.title}
            </h2>
          </div>
          <p className="reveal max-w-md text-lg text-carbo/75 md:justify-self-end" style={{ "--i": 1 } as CSSProperties}>
            {t.collections.lead}
          </p>
        </div>

        <ul className="mt-14 grid gap-4 md:grid-cols-12 md:grid-rows-[repeat(2,minmax(16rem,1fr))]">
          {COLLECTION_KEYS.map((key, i) => {
            const item = t.collections.items[key];
            const count = productsIn(key).length;
            return (
              <li key={key} className={`reveal relative ${LAYOUT[key]}`} style={{ "--i": i } as CSSProperties}>
                <Link
                  href={collectionPath(locale, key)}
                  className="group relative flex h-full min-w-0 flex-col justify-end overflow-hidden rounded-2xl bg-calc-2 p-6 text-calc sm:p-8 md:min-h-[16rem]"
                >
                  <Image
                    src={`/images/colleccions/${key}.webp`}
                    alt={item.coverAlt}
                    fill
                    sizes={key === "elements" ? "(min-width: 768px) 92vw, 100vw" : "(min-width: 768px) 55vw, 100vw"}
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-forn/85 via-forn/25 to-transparent" />
                  <span className="relative flex items-end justify-between gap-6">
                    <span>
                      <span className="num text-sm font-semibold text-argila">{fill(t.collections.models, { count })}</span>
                      <span className="display mt-2 block text-[clamp(2rem,3.6vw,3.4rem)]">{item.name}</span>
                      <span className="mt-2 block max-w-sm text-sm leading-relaxed text-calc/85">{item.text}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-full border border-calc/40 text-lg transition-colors duration-300 group-hover:border-argila group-hover:bg-argila group-hover:text-forn"
                    >
                      →
                    </span>
                  </span>
                  <span className="sr-only">{t.collections.explore}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
