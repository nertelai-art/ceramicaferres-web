"use client";

import { useRef } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { sectionPath } from "@/lib/routes";
import { ScrollVideo, type ScrollVideoFrame } from "@/components/video/ScrollVideo";

const CLIPS = [
  {
    src: "/video/inici-volta.mp4",
    srcMobile: "/video/inici-volta-m.mp4",
    poster: "/video/inici-volta.webp",
    posterMobile: "/video/inici-volta-m.webp",
    scroll: 1.4,
  },
] as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Primera pantalla: la barra de fang surt de l'extrusora amb «CERAMICA FERRES» imprès, i el scroll
 * en mou el temps. El text és HTML real i es veu sense JS ni vídeo; només s'esvaeix en baixar.
 */
export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  const copy = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);

  // Estils escrits directament al DOM a cada fotograma: res de setState.
  const onFrame = ({ progress }: ScrollVideoFrame) => {
    const out = clamp((progress - 0.45) / 0.4);
    if (copy.current) {
      copy.current.style.opacity = String(1 - out);
      copy.current.style.transform = `translate3d(0, ${-out * 8}vh, 0)`;
    }
    if (hint.current) hint.current.style.opacity = String(1 - clamp(progress / 0.15));
  };

  return (
    <section id="inici" aria-labelledby="inici-titol" className="relative">
      <ScrollVideo clips={CLIPS} label={t.hero.videoLabel} onFrame={onFrame} stageClassName="bg-calc">
        {/* Vel per llegir el text sobre el vídeo */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-calc via-calc/30 to-transparent sm:from-calc/80 sm:via-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-calc/95 via-calc/55 to-transparent sm:block" />

        <div className="container-x relative flex h-full flex-col justify-end pb-[max(2.5rem,7vh)] pt-[var(--header-h)]">
          <div ref={copy} className="max-w-[62rem] will-change-transform">
            <p className="eyebrow text-terra">{t.hero.eyebrow}</p>
            <h1 id="inici-titol" className="display mt-5 text-[clamp(3rem,8.4vw,8.5rem)] text-carbo">
              {t.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-carbo/80 sm:text-xl">{t.hero.lead}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={sectionPath(locale, "contact")} className="btn btn-primary">
                {t.hero.primary}
                <span aria-hidden="true">→</span>
              </a>
              <a href={sectionPath(locale, "collections")} className="btn btn-ghost bg-calc/60 text-carbo backdrop-blur-sm">
                {t.hero.secondary}
              </a>
            </div>
            <p className="mt-8 flex items-center gap-3 text-sm text-carbo/70">
              <span aria-hidden="true" className="inline-block h-px w-10 bg-terra" />
              {t.hero.proof}
            </p>
          </div>
          <div ref={hint} className="absolute bottom-6 right-[max(1rem,4vw)] hidden text-right sm:block">
            <p className="eyebrow text-carbo/60">
              {t.hero.scroll} <span aria-hidden="true">↓</span>
            </p>
            <p className="mt-2 max-w-[15rem] text-[0.68rem] leading-snug text-carbo/50">{t.workshop.note}</p>
          </div>
        </div>
      </ScrollVideo>
    </section>
  );
}
