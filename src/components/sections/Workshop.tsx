"use client";

import { useRef } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { SECTION_IDS } from "@/lib/routes";
import { ScrollVideo, type ScrollVideoFrame } from "@/components/video/ScrollVideo";

// Un clip per pas, en el mateix ordre que `workshop.steps`. Fos entre clips: és un muntatge, no un recorregut.
const CLIPS = [
  { src: "/video/proces-terra.mp4", poster: "/video/proces-terra.webp", scroll: 1 },
  { src: "/video/proces-tall.mp4", poster: "/video/proces-tall.webp", scroll: 1 },
  { src: "/video/proces-assecat.mp4", poster: "/video/proces-assecat.webp", scroll: 1 },
  { src: "/video/proces-esmalt.mp4", poster: "/video/proces-esmalt.webp", scroll: 1 },
] as const;

export function Workshop({ t }: { t: Dictionary }) {
  const list = useRef<HTMLOListElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  const onFrame = ({ index, blend }: ScrollVideoFrame) => {
    const active = blend > 0.5 ? index + 1 : index;
    list.current?.querySelectorAll("li").forEach((item, i) => {
      item.dataset.state = i === active ? "active" : "idle";
    });
    if (counter.current) counter.current.textContent = String(active + 1).padStart(2, "0");
  };

  return (
    <section id={SECTION_IDS.workshop} aria-labelledby="taller-titol" className="relative bg-forn">
      <ScrollVideo
        clips={CLIPS}
        label={t.workshop.videoLabel}
        onFrame={onFrame}
        fade={0.18}
        stageClassName="bg-forn"
        mediaClassName="absolute overflow-hidden rounded-[1.25rem] max-lg:inset-x-4 max-lg:bottom-6 max-lg:top-[46%] lg:bottom-[9vh] lg:right-[4vw] lg:top-[calc(var(--header-h)+5vh)] lg:w-[min(40vw,34rem)]"
      >
        <div className="container-x relative flex h-full flex-col pt-[calc(var(--header-h)+1rem)] lg:justify-center lg:pt-0">
          <div className="max-w-xl lg:max-w-[44%]">
            <p className="eyebrow text-argila">{t.workshop.eyebrow}</p>
            <h2 id="taller-titol" className="display mt-4 text-[clamp(2.2rem,4.8vw,4.4rem)]">
              {t.workshop.title}
            </h2>
            <p className="mt-4 max-w-md text-calc/75 max-sm:text-sm">{t.workshop.lead}</p>
            <ol ref={list} className="mt-8 hidden gap-4 lg:grid">
              {t.workshop.steps.map((step, i) => (
                <li
                  key={step.title}
                  data-state={i === 0 ? "active" : "idle"}
                  className="border-l-2 border-calc/15 pl-5 transition-[border-color,opacity] duration-500 data-[state=active]:border-argila data-[state=idle]:opacity-40 motion-reduce:data-[state=idle]:opacity-100"
                >
                  <strong className="display block text-2xl font-semibold">{step.title}</strong>
                  <span className="mt-1 block text-sm text-calc/75">{step.text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-8 hidden max-w-xs text-[0.7rem] leading-snug text-calc/45 lg:block">{t.workshop.note}</p>
            <p className="mt-6 flex items-baseline gap-2 lg:hidden" aria-hidden="true">
              <span ref={counter} className="display num text-4xl text-argila">
                01
              </span>
              <span className="text-sm text-calc/60">/ {String(CLIPS.length).padStart(2, "0")}</span>
            </p>
          </div>
        </div>
      </ScrollVideo>
      {/* A mòbil la llista no hi cap: els passos es llegeixen aquí, sota el vídeo. */}
      <div className="container-x pb-16 lg:hidden">
        <ol className="grid gap-5">
          {t.workshop.steps.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-2">
              <span className="num text-sm font-semibold text-argila">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <strong className="block">{step.title}</strong>
                <span className="text-sm text-calc/75">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-xs text-calc/45">{t.workshop.note}</p>
      </div>
    </section>
  );
}
