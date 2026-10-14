import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { sectionPath } from "@/lib/routes";
import { HeroStage } from "./HeroStage";

/**
 * Primera pantalla: les gelosies Empúries de la foto d'estudi de Ferrés entren una a una fent
 * saltirons i s'aturen on són a la foto. Text a l'esquerra i escenari a la dreta; a mòbil, l'escenari
 * a dalt. Tot és HTML i CSS: es veu igual sense JavaScript.
 */
export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="inici" aria-labelledby="inici-titol" className="hero relative overflow-hidden lg:h-[100svh] lg:min-h-[42rem]">
      <HeroStage label={t.hero.imageAlt} caption={t.hero.pieceCaption} />

      <div className="container-x relative z-10 flex flex-col pb-14 pt-8 lg:h-full lg:justify-center lg:pb-[8svh] lg:pt-[var(--header-h)]">
        <div className="max-w-xl lg:max-w-[min(36rem,37vw)]">
          <p className="eyebrow text-terra">{t.hero.eyebrow}</p>
          <h1 id="inici-titol" className="display mt-5 text-[clamp(2.7rem,10vw,4.2rem)] text-carbo lg:text-[clamp(3rem,5.2vw,6rem)]">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-carbo/80">{t.hero.lead}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href={sectionPath(locale, "contact")} className="btn btn-primary">
              {t.hero.primary}
              <span aria-hidden="true">→</span>
            </a>
            <a href={sectionPath(locale, "collections")} className="btn btn-ghost bg-blanc/60 text-carbo backdrop-blur-sm">
              {t.hero.secondary}
            </a>
          </div>
          <p className="mt-8 flex items-center gap-3 text-sm text-carbo/70">
            <span aria-hidden="true" className="inline-block h-px w-10 bg-terra" />
            {t.hero.proof}
          </p>
        </div>
      </div>
    </section>
  );
}
