"use client";

// Secció alta amb contingut sticky: els passos són HTML real a l'esquerra i l'escena 3D, darrere.
// No importa three.js: l'escena es carrega amb next/dynamic quan la secció és a prop.

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { SECTION_IDS } from "@/lib/routes";
import { useNearViewport, useReducedMotion, useRenderMode, useScrollProgress } from "@/components/scroll/scroll-scene";
import { clayStage, stepAt } from "./extrusion-phases";

const ExtrusionScene = dynamic(() => import("./ExtrusionScene"), { ssr: false });

export function ExtrusionShowcase({ t }: { t: Dictionary }) {
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const mode = useRenderMode();
  const reducedMotion = useReducedMotion();
  const near = useNearViewport(section);
  const steps = t.extrusion.steps;

  // three.js (~250 KB) es baixa i s'avalua quan el navegador està lliure, no a mig scroll.
  useEffect(() => {
    if (mode !== "3d") return;
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => void import("./ExtrusionScene"), { timeout: 4000 });
    return () => cancel(id);
  }, [mode]);

  // Pas actiu, barra i brasa del forn: directament al DOM, mai amb setState.
  const progress = useScrollProgress(section, (value) => {
    const p = reducedMotion ? 1 : value;
    const active = stepAt(p);
    list.current?.querySelectorAll("li").forEach((item, index) => {
      item.dataset.state = index < active ? "done" : index === active ? "active" : "todo";
    });
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    if (glow.current) glow.current.style.opacity = String(clayStage(p).glow);
  });

  const is3d = mode === "3d";
  const animated = is3d && !reducedMotion;

  return (
    <section
      ref={section}
      id={SECTION_IDS.process}
      aria-labelledby="proces-titol"
      className={`relative bg-calc ${animated ? "h-[460vh]" : ""}`}
    >
      <div className={`${animated ? "sticky top-0 h-[100svh]" : "py-24"} overflow-hidden`}>
        {/* Brasa del forn: s'encén durant la cocció */}
        <div
          ref={glow}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{ background: "radial-gradient(60% 55% at 62% 60%, rgba(255,110,40,0.22), rgba(215,121,63,0.10) 45%, transparent 75%)" }}
        />
        {is3d && near && (
          <div className="absolute inset-0">
            <ExtrusionScene progress={progress} reducedMotion={reducedMotion} />
          </div>
        )}

        {/* Vel perquè el text de l'esquerra es llegeixi encara que l'escena hi passi per sota */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-[48%] bg-gradient-to-r from-calc via-calc/80 to-transparent lg:block" />
        <div className="pointer-events-none container-x relative flex h-full flex-col pt-[calc(var(--header-h)+1.5rem)] lg:justify-center lg:pt-0">
          <div className="max-w-md">
            <p className="eyebrow text-terra">{t.extrusion.eyebrow}</p>
            <h2 id="proces-titol" className="display mt-4 text-[clamp(2.4rem,5.2vw,4.8rem)]">
              {t.extrusion.title}
            </h2>
            <p className="mt-5 hidden text-carbo/75 sm:block">{t.extrusion.lead}</p>
            <ol ref={list} className="mt-8 grid gap-1">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  data-state={index === 0 ? "active" : "todo"}
                  className="group grid grid-cols-[2.2rem_1fr] gap-x-2 rounded-xl px-3 py-2.5 transition-[opacity,background-color] duration-500 data-[state=active]:bg-blanc data-[state=active]:shadow-sm data-[state=done]:opacity-45 data-[state=todo]:opacity-30 max-lg:data-[state=done]:hidden max-lg:data-[state=todo]:hidden"
                >
                  <span className="num pt-0.5 text-sm font-semibold text-terra">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong className="block font-semibold">{step.title}</strong>
                    <span className="mt-1 block text-sm leading-relaxed text-carbo/75 group-data-[state=done]:hidden group-data-[state=todo]:hidden">
                      {step.text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {mode === "static" && (
            <div className="relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-2xl lg:absolute lg:right-[4vw] lg:top-1/2 lg:mt-0 lg:w-[52%] lg:-translate-y-1/2">
              <Image src="/images/volta-estudi.webp" alt={t.extrusion.fallbackAlt} fill sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>

        {animated && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-carbo/10" role="presentation">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-terra" />
          </div>
        )}
        <p className="eyebrow pointer-events-none absolute bottom-6 right-[max(1rem,4vw)] text-carbo/45">{t.extrusion.model}</p>
        <p className="sr-only">{t.extrusion.srDescription}</p>
      </div>
    </section>
  );
}
