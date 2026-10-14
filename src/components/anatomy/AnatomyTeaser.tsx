"use client";

// Anatomia a la pàgina d'inici, en versió curta: la peça se separa sola quan entra a la pantalla
// (scroll natural, sense secció enganxada) i cada capa porta la seva explicació. El detall
// interactiu (materials, esmalts, comparativa) és a la pàgina de materials.

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { materialsPath, SECTION_IDS } from "@/lib/routes";
import { useReducedMotion } from "@/components/scroll/scroll-scene";
import { ExplodedPiece } from "./ExplodedPiece";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function AnatomyTeaser({ locale, t }: { locale: Locale; t: Dictionary }) {
  const a = t.anatomy;
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // De 0 a 1 mentre la peça puja des de baix de la pantalla fins al centre. S'escriu a una variable CSS.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    if (reduced) {
      element.style.setProperty("--spread", "1");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = element.getBoundingClientRect();
      const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight * 0.75));
      element.style.setProperty("--spread", easeOutCubic(progress).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section id={SECTION_IDS.material} aria-labelledby="material-titol" className="relative overflow-hidden bg-calc py-[clamp(5rem,11vw,9rem)]">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <div ref={stage} className="order-2 lg:order-1" style={{ "--spread": reduced ? 1 : 0 } as CSSProperties}>
          <ExplodedPiece material="vidriat" glaze="azul-43" labels={a.layers} className="h-[min(100vw,30rem)] md:-translate-x-[12%] lg:h-[34rem]" />
          {/* A mòbil les etiquetes no hi caben al costat: van a sota, en llista. */}
          <ol className="mt-6 grid gap-4 md:hidden">
            {a.layers.map((layer, i) => (
              <li key={layer.title} className="grid grid-cols-[2rem_1fr] gap-2">
                <span className="num text-sm font-semibold text-terra">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong className="block">{layer.title}</strong>
                  <span className="text-sm text-carbo/75">{layer.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="order-1 lg:order-2">
          <p className="reveal eyebrow text-terra">{a.eyebrow}</p>
          <h2 id="material-titol" className="reveal display mt-4 text-[clamp(2.4rem,5vw,4.6rem)]">
            {a.title}
          </h2>
          <p className="reveal mt-5 max-w-lg text-lg text-carbo/75">{a.lead}</p>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
            {a.figures.map((figure, i) => (
              <div key={figure.label} className="reveal flex flex-col border-t border-carbo/15 pt-4" style={{ "--i": i } as CSSProperties}>
                <dt className="text-sm leading-snug text-carbo/65">{figure.label}</dt>
                <dd className="display num order-first text-[clamp(1.9rem,3.2vw,2.8rem)] text-terra">{figure.value}</dd>
              </div>
            ))}
          </dl>
          <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link href={materialsPath(locale)} className="btn btn-primary self-start">
              {a.cta} <span aria-hidden="true">→</span>
            </Link>
            <p className="max-w-xs text-sm text-carbo/65">{a.ctaNote}</p>
          </div>
        </div>
      </div>
      <p className="sr-only">{a.srDescription}</p>
    </section>
  );
}
