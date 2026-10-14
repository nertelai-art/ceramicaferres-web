"use client";

// Pàgina de materials: tria un material (i un esmalt, si és vidriat) i mira'n les capes i les dades.
// El selector és a dalt de tot i la peça queda fixa al costat: no cal fer scroll per triar.
// Triar és estat de React (canvia poc); la peça es separa amb una transició CSS en entrar.

import { useEffect, useId, useState, type CSSProperties } from "react";
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
  type Value,
} from "@/data/materials";
import { barSpan, formatValue } from "@/lib/format-value";
import { ExplodedPiece } from "./ExplodedPiece";

/** Les sis propietats que es veuen en targeta; la resta, en llista. */
const KEY_PROPERTIES: PropertyKey[] = ["flexural", "hardness", "absorption", "frost", "expansion", "firing"];
const OTHER_PROPERTIES: PropertyKey[] = ["abrasion", "chemical", "slip", "fire", "origin"];

const isEstimated = (value: Value) => value.kind === "number" && value.estimated === true;

export function MaterialsExplorer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const a = t.anatomy;
  const [material, setMaterial] = useState<MaterialKey>("vidriat");
  const [glaze, setGlaze] = useState<GlazeFile>("azul-43");
  const groupId = useId();
  const data = MATERIALS[material];
  const labels = { values: a.values, qualifiers: a.qualifiers, slipClass: a.slipClass, missing: a.missing };
  const glazeInfo = GLAZES.find((g) => g.file === glaze) ?? GLAZES[0];
  const anyEstimated = [...KEY_PROPERTIES, ...OTHER_PROPERTIES].some((key) => isEstimated(data.values[key]));

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
      {/* Peça: fixa a escriptori */}
      <div className="lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:h-[calc(100svh-var(--header-h)-2rem)]">
        <div className="h-full rounded-3xl bg-calc-2">
          {/* La peça s'obre en arribar a la pàgina; amb moviment reduït ja hi és oberta. */}
          <SpreadAnimator target={1}>
            <ExplodedPiece material={material} glaze={glaze} labels={a.layers.map((l) => ({ title: l.title }))} className="h-[min(90vw,26rem)] md:-translate-x-[10%] lg:h-full" />
          </SpreadAnimator>
        </div>
      </div>

      <div>
        <fieldset>
          <legend className="eyebrow text-carbo/60">{a.materialLabel}</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MATERIAL_KEYS.map((key) => (
              <label
                key={key}
                className="relative flex cursor-pointer flex-col gap-2 rounded-xl border border-carbo/15 bg-blanc p-3 transition-colors hover:border-carbo/40 has-[:checked]:border-terra has-[:checked]:ring-1 has-[:checked]:ring-terra has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-terra"
              >
                <input type="radio" name={`${groupId}-material`} value={key} checked={material === key} onChange={() => setMaterial(key)} className="sr-only" />
                <span className="block h-12 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${MATERIALS[key].swatch})` }} aria-hidden="true" />
                <span className="text-sm font-semibold leading-tight">{a.materials[key].name}</span>
              </label>
            ))}
          </div>
          <p className="mt-4 text-carbo/75" aria-live="polite">
            {a.materials[material].text}
          </p>
        </fieldset>

        {data.glazed && (
          <fieldset className="mt-8">
            <legend className="eyebrow text-carbo/60">
              {a.glazeLabel} · <span className="normal-case tracking-normal text-carbo">{glazeInfo.code}</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {GLAZES.map((g) => (
                <label
                  key={g.file}
                  title={g.code}
                  className="relative size-10 cursor-pointer overflow-hidden rounded-full ring-1 ring-carbo/20 transition-transform hover:scale-110 has-[:checked]:ring-2 has-[:checked]:ring-terra has-[:checked]:ring-offset-2 has-[:checked]:ring-offset-calc has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-carbo"
                >
                  <input type="radio" name={`${groupId}-glaze`} value={g.file} checked={glaze === g.file} onChange={() => setGlaze(g.file)} className="sr-only" />
                  <span className="sr-only">{g.code}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- mostra petita, una sola mida */}
                  <img src={`/esmalts/${g.file}.webp`} alt="" width={40} height={40} loading="lazy" className="size-full object-cover" />
                </label>
              ))}
            </div>
            {FROST_SENSITIVE.includes(glaze) && (
              <p className="mt-3 rounded-lg border border-terra/30 bg-terra/5 px-3 py-2 text-sm" role="status">
                {a.frostWarning}
              </p>
            )}
          </fieldset>
        )}

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {KEY_PROPERTIES.map((key) => {
            const value = data.values[key];
            const span = barSpan(value, SCALES[key]);
            const missing = value.kind === "missing";
            return (
              <li key={key} className="rounded-2xl border border-carbo/10 bg-blanc p-5">
                <p className="text-sm font-semibold">{a.properties[key]}</p>
                <p className={`display num mt-2 text-3xl ${missing ? "text-carbo/30" : "text-terra"}`}>{formatValue(value, locale, labels)}</p>
                {SCALES[key] !== undefined && (
                  <span className={`mt-3 block h-1.5 overflow-hidden rounded-full ${missing ? "border border-dashed border-carbo/20" : "bg-carbo/10"}`} aria-hidden="true">
                    {span && (
                      <span
                        className={`relative block h-full rounded-full transition-[margin,width] duration-700 ease-[var(--ease-out-expo)] ${isEstimated(value) ? "bg-terra/40" : "bg-terra"}`}
                        style={{ marginLeft: `${span.from * 100}%`, width: `${Math.max(2, (span.to - span.from) * 100)}%` }}
                      />
                    )}
                  </span>
                )}
                <p className="mt-3 text-xs leading-relaxed text-carbo/65">{a.explain[key]}</p>
                {STANDARDS[material]?.[key] && <p className="mt-2 text-[0.7rem] text-carbo/45">{STANDARDS[material]?.[key]}</p>}
              </li>
            );
          })}
        </ul>

        <dl className="mt-6">
          {OTHER_PROPERTIES.map((key) => {
            const value = data.values[key];
            return (
              <div key={key} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-t border-carbo/10 py-3.5">
                <dt className="text-sm">
                  <span className="font-semibold">{a.properties[key]}</span>
                  <span className="mt-0.5 block text-xs text-carbo/60">{a.explain[key]}</span>
                </dt>
                <dd className={`num text-right text-sm font-semibold ${value.kind === "missing" ? "font-normal text-carbo/35" : ""}`}>{formatValue(value, locale, labels)}</dd>
              </div>
            );
          })}
        </dl>

        {anyEstimated && <p className="mt-4 text-xs text-carbo/60">{a.estimatedNote}</p>}
        <p className="mt-2 text-xs text-carbo/55">
          {a.sources}:{" "}
          {data.sources.map((key, i) => (
            <span key={key}>
              {i > 0 && " · "}
              <a className="underline underline-offset-2 hover:text-terra" href={SOURCES[key].url} rel="noopener" target="_blank">
                {SOURCES[key].title}
              </a>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

/**
 * Anima `--spread` de 0 a l'objectiu. Les variables CSS no s'interpolen soles sense @property, així
 * que es fa amb un rAF curt (una sola vegada, en arribar a la pàgina).
 */
function SpreadAnimator({ target, children }: { target: number; children: React.ReactNode }) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.setProperty("--spread", String(target));
      return;
    }
    const from = Number(getComputedStyle(node).getPropertyValue("--spread")) || 0;
    const start = performance.now();
    let raf = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / 1400);
      const eased = 1 - Math.pow(1 - t, 3);
      node.style.setProperty("--spread", (from + (target - from) * eased).toFixed(4));
      if (t < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [node, target]);
  return (
    <div ref={setNode} className="h-full" style={{ "--spread": 0 } as CSSProperties}>
      {children}
    </div>
  );
}

/** Taula comparativa dels quatre materials: es llegeix sense haver de triar res. */
export function MaterialsCompare({ locale, t }: { locale: Locale; t: Dictionary }) {
  const a = t.anatomy;
  const labels = { values: a.values, qualifiers: a.qualifiers, slipClass: a.slipClass, missing: a.missing };
  const rows: PropertyKey[] = ["flexural", "hardness", "absorption", "abrasion", "frost", "expansion", "chemical", "slip", "firing", "fire", "origin"];
  return (
    <div className="overflow-x-auto rounded-2xl border border-carbo/10 bg-blanc">
      <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-carbo/10">
            <th scope="col" className="sticky left-0 bg-blanc p-4 font-semibold">
              {t.materialsPage.propertyColumn}
            </th>
            {MATERIAL_KEYS.map((key) => (
              <th key={key} scope="col" className="p-4 font-semibold">
                <span className="flex items-center gap-2">
                  <span className="size-5 shrink-0 rounded-full bg-cover bg-center ring-1 ring-carbo/15" style={{ backgroundImage: `url(${MATERIALS[key].swatch})` }} aria-hidden="true" />
                  {a.materials[key].name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row} className="border-b border-carbo/5 last:border-0">
              <th scope="row" className="sticky left-0 w-[34%] bg-blanc p-4 align-top font-normal">
                <span className="font-semibold">{a.properties[row]}</span>
                <span className="mt-1 block text-xs leading-snug text-carbo/60">{a.explain[row]}</span>
              </th>
              {MATERIAL_KEYS.map((key) => {
                const value = MATERIALS[key].values[row];
                return (
                  <td key={key} className={`num p-4 align-top ${value.kind === "missing" ? "text-carbo/35" : isEstimated(value) ? "text-carbo/70" : "font-semibold"}`}>
                    {formatValue(value, locale, labels)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
