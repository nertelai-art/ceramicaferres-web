import Link from "next/link";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { FROST_SENSITIVE, GLAZES } from "@/data/materials";
import { homePath, sectionPath } from "@/lib/routes";
import { MaterialsCompare, MaterialsExplorer } from "@/components/anatomy/MaterialsExplorer";

/** Pàgina de materials: explorador interactiu, comparativa i carta d'esmalts. */
export function MaterialsView({ locale, t }: { locale: Locale; t: Dictionary }) {
  const m = t.materialsPage;
  return (
    <>
      <section aria-labelledby="materials-titol" className="bg-calc pb-16 pt-[calc(var(--header-h)+3rem)]">
        <div className="container-x">
          <Link href={homePath(locale)} className="text-sm text-carbo/60 hover:text-terra">
            ← {m.back}
          </Link>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:gap-14">
            <div>
              <p className="eyebrow text-terra">{m.eyebrow}</p>
              <h1 id="materials-titol" className="display mt-4 text-[clamp(2.8rem,7vw,6.5rem)]">
                {m.title}
              </h1>
            </div>
            <p className="max-w-xl text-lg text-carbo/75">{m.lead}</p>
          </div>
          <div className="mt-12">
            <MaterialsExplorer locale={locale} t={t} />
          </div>
        </div>
      </section>

      <section aria-labelledby="comparativa-titol" className="bg-calc-2 py-[clamp(4rem,9vw,7rem)]">
        <div className="container-x">
          <h2 id="comparativa-titol" className="display text-[clamp(2.2rem,4.5vw,4rem)]">
            {m.compareTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-carbo/75">{m.compareLead}</p>
          <div className="mt-10">
            <MaterialsCompare locale={locale} t={t} />
          </div>
          <p className="mt-4 text-xs text-carbo/60">{t.anatomy.estimatedNote}</p>
        </div>
      </section>

      <section aria-labelledby="esmalts-titol" className="bg-calc py-[clamp(4rem,9vw,7rem)]">
        <div className="container-x">
          <h2 id="esmalts-titol" className="display text-[clamp(2.2rem,4.5vw,4rem)]">
            {m.glazesTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-carbo/75">{m.glazesLead}</p>
          <ul className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {GLAZES.map((glaze, i) => (
              <li key={glaze.file} className="reveal" style={{ "--i": i % 8 } as CSSProperties}>
                {/* eslint-disable-next-line @next/next/no-img-element -- mostres petites d'una sola mida */}
                <img src={`/esmalts/${glaze.file}.webp`} alt="" width={420} height={420} loading="lazy" className="aspect-square w-full rounded-xl object-cover shadow-sm" />
                <p className="mt-2 text-sm font-semibold">
                  {glaze.code}
                  {FROST_SENSITIVE.includes(glaze.file) && <span className="text-terra"> *</span>}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-carbo/60">
            <span className="text-terra">*</span> {t.anatomy.frostWarning}
          </p>
        </div>
      </section>

      <section aria-label={m.ctaTitle} className="bg-terra py-16 text-calc">
        <div className="container-x flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="display text-4xl">{m.ctaTitle}</p>
            <p className="mt-3 text-sm text-calc/85">{m.ctaText}</p>
          </div>
          <a href={sectionPath(locale, "contact")} className="btn bg-calc text-terra hover:bg-carbo hover:text-calc">
            {t.nav.cta} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </>
  );
}
