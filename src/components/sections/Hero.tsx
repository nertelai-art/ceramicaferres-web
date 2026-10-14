"use client";

import { useRef } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { sectionPath } from "@/lib/routes";
import { ScrollVideo, type ScrollVideoFrame } from "@/components/video/ScrollVideo";

const CLIPS = [
  {
    src: "/video/inici-extrusio.mp4",
    srcMobile: "/video/inici-extrusio-m.mp4",
    poster: "/video/inici-extrusio.webp",
    posterMobile: "/video/inici-extrusio-m.webp",
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
      <ScrollVideo clips={CLIPS} label={t.hero.videoLabel} onFrame={onFrame} stageClassName="bg-forn">
        {/* Vel per llegir el text sobre el vídeo */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forn via-forn/45 to-forn/10" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forn/70 via-transparent to-transparent" />

        <div className="container-x relative flex h-full flex-col justify-end pb-[max(2.5rem,7vh)] pt-[var(--header-h)]">
          <div ref={copy} className="max-w-[62rem] will-change-transform">
            <p className="eyebrow text-argila">{t.hero.eyebrow}</p>
            <h1 id="inici-titol" className="display mt-5 text-[clamp(3rem,8.4vw,8.5rem)] text-calc">
              {t.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-calc/85 sm:text-xl">{t.hero.lead}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={sectionPath(locale, "contact")} className="btn btn-primary">
                {t.hero.primary}
                <span aria-hidden="true">→</span>
              </a>
              <a href={sectionPath(locale, "collections")} className="btn btn-ghost text-calc">
                {t.hero.secondary}
              </a>
            </div>
            <p className="mt-8 flex items-center gap-3 text-sm text-calc/70">
              <span aria-hidden="true" className="inline-block h-px w-10 bg-argila" />
              {t.hero.proof}
            </p>
          </div>
          <div ref={hint} className="absolute bottom-6 right-[max(1rem,4vw)] hidden text-right sm:block">
            <p className="eyebrow text-calc/60">
              {t.hero.scroll} <span aria-hidden="true">↓</span>
            </p>
            <p className="mt-2 max-w-[15rem] text-[0.68rem] leading-snug text-calc/40">{t.workshop.note}</p>
          </div>
        </div>
      </ScrollVideo>
    </section>
  );
}
