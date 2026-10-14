import Image from "next/image";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { SECTION_IDS, sectionPath } from "@/lib/routes";

const STAGE_IMAGES = ["/images/a-mida/dibuix.webp", "/images/a-mida/prototip.webp", "/images/a-mida/produccio.webp", "/images/a-mida/installacio.webp"];

/**
 * Peces a mida, explicades amb un cas real: Garbet, del dibuix a la instal·lació de Milà.
 * A escriptori, les quatre fases es llegeixen en una franja horitzontal que es desplaça amb el ratolí
 * o el dit (scroll natiu amb snap; res de segrestar el scroll vertical).
 */
export function Custom({ locale, t }: { locale: Locale; t: Dictionary }) {
  const c = t.custom;
  return (
    <section id={SECTION_IDS.custom} aria-labelledby="a-mida-titol" className="relative overflow-hidden bg-terra py-[clamp(5rem,11vw,9rem)] text-calc">
      <div
        aria-hidden="true"
        className="extrusion-lines pointer-events-none absolute inset-x-0 top-0 h-40 text-calc/30 [mask-image:linear-gradient(black,transparent)]"
      />
      <div className="container-x relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
        <div>
          <p className="reveal eyebrow text-calc/80">{c.eyebrow}</p>
          <h2 id="a-mida-titol" className="reveal display mt-4 text-[clamp(2.4rem,5.4vw,5rem)]">
            {c.title}
          </h2>
        </div>
        <p className="reveal max-w-lg text-lg text-calc/85">{c.lead}</p>
      </div>

      <div className="container-x relative mt-14">
        <ol className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-color:theme(colors.calc/40%)_transparent] lg:grid lg:grid-cols-4 lg:overflow-visible">
          {c.stages.map((stage, i) => (
            <li key={stage.title} className="reveal w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-auto" style={{ "--i": i } as CSSProperties}>
              <figure>
                <div className={`relative overflow-hidden rounded-xl bg-terra-fosca ${i % 2 ? "aspect-[3/4] lg:mt-16" : "aspect-[3/4]"}`}>
                  <Image src={STAGE_IMAGES[i]!} alt={stage.alt} fill sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 78vw" className="object-cover" />
                </div>
                <figcaption className="mt-3 flex items-baseline gap-3">
                  <span className="num text-sm font-semibold text-calc/70">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display text-2xl font-semibold">{stage.title}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>

      <div className="container-x relative mt-14 grid gap-10 border-t border-calc/25 pt-10 lg:grid-cols-[1fr_1.2fr_auto] lg:items-start">
        <div>
          <p className="display text-5xl">{c.caseTitle}</p>
          <p className="mt-2 text-xs text-calc/70">{c.credit}</p>
        </div>
        <div>
          <p className="text-calc/90">{c.caseText}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {c.awards.map((award) => (
              <li key={award} className="rounded-full border border-calc/40 px-3 py-1.5 text-sm font-semibold">
                {award}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-calc/75">{c.awardsNote}</p>
        </div>
        <a href={sectionPath(locale, "contact")} className="btn bg-calc text-terra hover:bg-carbo hover:text-calc">
          {c.cta} <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
