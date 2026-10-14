"use client";

// Anatomia d'una peça: vista explosionada en CSS 3D (sense WebGL) amb les mostres reals de la carta
// d'acabats com a textura, i les propietats de les fitxes tècniques al costat. El scroll separa les
// capes; triar material o esmalt és estat de React (canvia poques vegades, no a cada fotograma).

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  FROST_SENSITIVE,
  GLAZES,
  MATERIALS,
  MATERIAL_KEYS,
  SCALES,
  SOURCES,
  STANDARDS,
  type GlazeFile,
  type MaterialKey,
  type PropertyKey,
} from "@/data/materials";
import { SECTION_IDS } from "@/lib/routes";
import { barSpan, formatValue } from "@/lib/format-value";
import { useReducedMotion, useScrollProgress } from "@/components/scroll/scroll-scene";

const RIGIDITY: PropertyKey[] = ["flexural", "hardness", "abrasion"];
const OTHERS: PropertyKey[] = ["absorption", "frost", "expansion", "chemical", "slip", "firing", "fire", "origin"];

/** Separació màxima de les capes, en px, quan la peça està del tot explosionada. */
const SPREAD = 120;

const BODY_SWATCH: Record<MaterialKey, string> = {
  rojo15: "/esmalts/rojo-15.webp",
  arena14: "/esmalts/arena-14.webp",
  gres: "/esmalts/gres-natural.webp",
  vidriat: "/esmalts/rojo-15.webp",
};
const BODY_EDGE: Record<MaterialKey, string> = { rojo15: "#9a4524", arena14: "#c79f72", gres: "#8c4a2a", vidriat: "#9a4524" };

function Slab({
  top,
  edge,
  thickness,
  className = "",
  children,
}: {
  top: CSSProperties;
  edge: string;
  thickness: number;
  className?: string;
  children?: React.ReactNode;
}) {
  // Una llosa: cara de dalt i els dos cantells que es veuen des d'aquest angle.
  return (
    <div className={`absolute inset-0 [transform-style:preserve-3d] ${className}`}>
      <div className="absolute inset-0 rounded-[3px] bg-cover bg-center" style={{ ...top, transform: `translateZ(${thickness}px)` }} />
      <div
        className="absolute inset-x-0 bottom-0 origin-bottom"
        style={{ height: thickness, background: `linear-gradient(${edge}, color-mix(in srgb, ${edge} 70%, black))`, transform: "rotateX(-90deg) translateY(100%)" }}
      />
      <div
        className="absolute inset-y-0 right-0 origin-right"
        style={{ width: thickness, background: `linear-gradient(90deg, color-mix(in srgb, ${edge} 80%, black), ${edge})`, transform: "rotateY(90deg) translateX(100%)" }}
      />
      {children}
    </div>
  );
}

/** Porositat dibuixada per CSS: punts de diverses mides, sempre iguals (sense atzar). */
const PORES: CSSProperties = {
  backgroundImage: [
    "radial-gradient(circle at 20% 30%, rgba(30,14,6,.55) 0 2px, transparent 3px)",
    "radial-gradient(circle at 70% 60%, rgba(30,14,6,.5) 0 1.5px, transparent 2.5px)",
    "radial-gradient(circle at 45% 80%, rgba(30,14,6,.45) 0 3px, transparent 4px)",
    "radial-gradient(circle at 85% 15%, rgba(30,14,6,.4) 0 1px, transparent 2px)",
  ].join(","),
  backgroundSize: "23px 23px, 31px 31px, 47px 47px, 13px 13px",
};

export function Anatomy({ locale, t }: { locale: Locale; t: Dictionary }) {
  const a = t.anatomy;
  const [material, setMaterial] = useState<MaterialKey>("vidriat");
  const [glaze, setGlaze] = useState<GlazeFile>("azul-43");
  const [activeLayer, setActiveLayer] = useState(0);
  const section = useRef<HTMLElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const layerList = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const groupId = useId();
  const data = MATERIALS[material];
  const glazed = data.glazed;

  // Explosió de les capes lligada al scroll: s'escriu una variable CSS, no estat.
  useScrollProgress(section, (value) => {
    const spread = reduced ? 1 : Math.min(1, Math.max(0, (value - 0.04) / 0.26));
    stack.current?.style.setProperty("--spread", spread.toFixed(4));
  });

  // Capa activa segons el text que es llegeix a la dreta.
  useEffect(() => {
    const items = layerList.current?.querySelectorAll<HTMLElement>("[data-layer]");
    if (!items?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveLayer(Number((entry.target as HTMLElement).dataset.layer));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const glazeInfo = GLAZES.find((g) => g.file === glaze) ?? GLAZES[0];
  const layerClass = (index: number) =>
    `transition-opacity duration-500 ${activeLayer === index ? "opacity-100" : "opacity-55"} ${index === 0 && !glazed ? "!opacity-0" : ""}`;
  const labels = { values: a.values, qualifiers: a.qualifiers, slipClass: a.slipClass, missing: a.missing };

  const row = (key: PropertyKey) => {
    const value = data.values[key];
    const span = barSpan(value, SCALES[key]);
    const standard = STANDARDS[material]?.[key];
    const isMissing = value.kind === "missing";
    return (
      <div key={key} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 border-t border-calc/10 py-3.5">
        <dt className="text-sm text-calc/80">
          {a.properties[key]}
          {standard && <span className="mt-0.5 block text-[0.7rem] text-calc/40">{standard}</span>}
        </dt>
        <dd className={`num text-right text-sm font-semibold ${isMissing ? "font-normal text-calc/35" : "text-calc"}`}>
          {formatValue(value, locale, labels)}
        </dd>
        {SCALES[key] !== undefined && (
          <dd className="col-span-2" aria-hidden="true">
            <span className={`relative block h-1.5 overflow-hidden rounded-full ${isMissing ? "border border-dashed border-calc/20" : "bg-calc/10"}`}>
              {span && (
                <span
                  className="absolute inset-y-0 rounded-full bg-argila transition-[left,width] duration-700 ease-[var(--ease-out-expo)]"
                  style={{ left: `${span.from * 100}%`, width: `${Math.max(2, (span.to - span.from) * 100)}%` }}
                />
              )}
            </span>
          </dd>
        )}
      </div>
    );
  };

  return (
    <section ref={section} id={SECTION_IDS.material} aria-labelledby="material-titol" className="relative bg-forn-2 py-[clamp(5rem,10vw,8rem)]">
      <div className="container-x grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* Peça explosionada: sticky a escriptori */}
        <div className="lg:sticky lg:top-[var(--header-h)] lg:h-[calc(100svh-var(--header-h))]">
          <div className="relative grid h-[min(92vw,30rem)] place-items-center lg:h-full" aria-hidden="true">
            <div className="[perspective:1800px]">
              <div
                ref={stack}
                className="relative size-[min(56vw,19rem)] [transform-style:preserve-3d] lg:size-[min(24vw,22rem)]"
                style={{ "--spread": reduced ? 1 : 0, transform: "rotateX(57deg) rotateZ(-40deg)" } as CSSProperties}
              >
                {/* 2. Porus (l'interior del cos) */}
                <div className={`absolute inset-0 [transform-style:preserve-3d] ${layerClass(2)}`} style={{ transform: `translateZ(calc(var(--spread) * ${-SPREAD}px))` }}>
                  <Slab thickness={18} edge={BODY_EDGE[material]} top={{ backgroundImage: `${PORES.backgroundImage}, url(${BODY_SWATCH[material]})`, backgroundSize: `${PORES.backgroundSize}, cover` }} />
                </div>
                {/* 1. Cos ceràmic */}
                <div className={`absolute inset-0 [transform-style:preserve-3d] ${layerClass(1)}`} style={{ transform: "translateZ(18px)" }}>
                  <Slab thickness={16} edge={BODY_EDGE[material]} top={{ backgroundImage: `url(${BODY_SWATCH[material]})` }} />
                </div>
                {/* 0. Esmalt */}
                <div
                  className={`absolute inset-0 [transform-style:preserve-3d] ${layerClass(0)}`}
                  style={{ transform: `translateZ(calc(34px + var(--spread) * ${SPREAD}px))` }}
                >
                  <Slab
                    thickness={4}
                    edge={glazeInfo.hex}
                    top={{
                      backgroundImage: `linear-gradient(125deg, rgba(255,255,255,.35), rgba(255,255,255,0) 38%), url(/esmalts/${glaze}.webp)`,
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15)",
                    }}
                  />
                </div>
              </div>
            </div>
            {/* Etiquetes de capa, en 2D perquè siguin llegibles */}
            <ol className="pointer-events-none absolute inset-y-0 right-0 hidden flex-col justify-center gap-[clamp(3rem,9vh,6rem)] sm:flex">
              {a.layers.map((layer, index) => (
                <li
                  key={layer.title}
                  className={`flex items-center gap-3 text-sm transition-opacity duration-500 ${activeLayer === index ? "opacity-100" : "opacity-40"} ${index === 0 && !glazed ? "line-through decoration-calc/40" : ""}`}
                >
                  <span className="h-px w-10 bg-argila" />
                  <span className="num font-semibold text-argila">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-semibold">{layer.title}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="sr-only">{a.srDescription}</p>
        </div>

        {/* Textos, capes i propietats */}
        <div>
          <p className="eyebrow text-argila">{a.eyebrow}</p>
          <h2 id="material-titol" className="display mt-4 text-[clamp(2.4rem,5vw,4.6rem)]">
            {a.title}
          </h2>
          <p className="mt-5 max-w-lg text-lg text-calc/75">{a.lead}</p>

          <ol ref={layerList} className="mt-12 grid gap-6">
            {a.layers.map((layer, index) => (
              <li
                key={layer.title}
                data-layer={index}
                className={`grid grid-cols-[2.5rem_1fr] border-l-2 py-1 pl-4 transition-[border-color,opacity] duration-500 ${activeLayer === index ? "border-argila" : "border-calc/15 opacity-70"}`}
              >
                <span className="num pt-1 text-sm font-semibold text-argila">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong className="display block text-2xl font-semibold">{layer.title}</strong>
                  <span className="mt-1 block text-calc/75">{index === 0 && !glazed ? a.noGlaze : layer.text}</span>
                </span>
              </li>
            ))}
          </ol>

          <fieldset className="mt-14">
            <legend className="eyebrow text-fang">{a.materialLabel}</legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MATERIAL_KEYS.map((key) => (
                <label
                  key={key}
                  className="group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-calc/15 p-3 transition-colors hover:border-calc/40 has-[:checked]:border-argila has-[:checked]:bg-calc/[0.05] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-argila"
                >
                  <input type="radio" name={`${groupId}-material`} value={key} checked={material === key} onChange={() => setMaterial(key)} className="sr-only" />
                  <span className="block h-10 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${MATERIALS[key].swatch})` }} aria-hidden="true" />
                  <span className="text-sm font-semibold leading-tight">{a.materials[key].name}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-sm text-calc/70" aria-live="polite">
              {a.materials[material].text}
            </p>
          </fieldset>

          {glazed && (
            <fieldset className="mt-8">
              <legend className="eyebrow text-fang">
                {a.glazeLabel} · <span className="normal-case tracking-normal text-calc">{glazeInfo.code}</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {GLAZES.map((g) => (
                  <label
                    key={g.file}
                    title={g.code}
                    className="relative size-9 cursor-pointer overflow-hidden rounded-full ring-1 ring-calc/20 transition-transform hover:scale-110 has-[:checked]:ring-2 has-[:checked]:ring-argila has-[:checked]:ring-offset-2 has-[:checked]:ring-offset-forn-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-calc"
                  >
                    <input type="radio" name={`${groupId}-glaze`} value={g.file} checked={glaze === g.file} onChange={() => setGlaze(g.file)} className="sr-only" />
                    <span className="sr-only">{g.code}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mostra petita, una sola mida */}
                    <img src={`/esmalts/${g.file}.webp`} alt="" width={36} height={36} loading="lazy" className="size-full object-cover" />
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-calc/50">{a.glazeNote}</p>
              {FROST_SENSITIVE.includes(glaze) && (
                <p className="mt-3 rounded-lg border border-argila/40 bg-argila/10 px-3 py-2 text-sm text-calc" role="status">
                  {a.frostWarning}
                </p>
              )}
            </fieldset>
          )}

          <div className="mt-12">
            <h3 className="eyebrow text-fang">{a.rigidity}</h3>
            <dl className="mt-2">{RIGIDITY.map(row)}</dl>
            <dl className="mt-6">{OTHERS.map(row)}</dl>
            <p className="mt-4 text-xs text-calc/50">{a.scaleNote}</p>
            <p className="mt-2 text-xs text-calc/50">
              {a.sources}:{" "}
              {data.sources.map((key, i) => (
                <span key={key}>
                  {i > 0 && " · "}
                  <a className="underline underline-offset-2 hover:text-calc" href={SOURCES[key].url} rel="noopener" target="_blank">
                    {SOURCES[key].title}
                  </a>
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
