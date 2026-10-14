import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

/** Icones de línia pròpies (traç 1,5): una per propietat, en el mateix ordre que el diccionari. */
const ICONS = [
  // durabilitat: rellotge de sorra
  "M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9",
  // manteniment: gota
  "M12 3c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11z",
  // ignífug: flama
  "M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-3-2 2-3 4-3 7a6 6 0 0 0 6 6z",
  // sense COV: fulla
  "M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l7-7",
  // humitat: núvol amb punts
  "M7 15a4 4 0 0 1 .5-8A5 5 0 0 1 17 8a3.5 3.5 0 0 1 0 7H7zM9 19v1M12 18v2M15 19v1",
  // ventilació: ones
  "M3 9c3-2 5 2 8 0s5-2 8 0M3 14c3-2 5 2 8 0s5-2 8 0M3 19c3-2 5 2 8 0s5-2 8 0",
];

export function Sustainability({ t }: { t: Dictionary }) {
  const s = t.sustainability;
  return (
    <section aria-labelledby="sostenibilitat-titol" className="bg-calc py-[clamp(5rem,11vw,9rem)] text-carbo">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="reveal eyebrow text-terra">{s.eyebrow}</p>
            <h2 id="sostenibilitat-titol" className="reveal display mt-4 text-[clamp(2.4rem,5.4vw,5rem)]">
              {s.title}
            </h2>
          </div>
          <div className="reveal rounded-2xl bg-carbo p-6 text-calc sm:p-8">
            <p className="flex items-center gap-3">
              <span className="display text-3xl text-argila">
                CO<sub className="text-lg">2</sub>
              </span>
              <span className="font-semibold">{s.carbon}</span>
            </p>
            <p className="mt-3 text-sm text-calc/75">{s.carbonText}</p>
          </div>
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-carbo/10 bg-carbo/10 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((item, i) => (
            <li key={item.title} className="reveal bg-calc p-7" style={{ "--i": i % 3 } as CSSProperties}>
              <svg viewBox="0 0 24 24" className="size-8 text-terra" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={ICONS[i]} />
              </svg>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-carbo/75">{item.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {s.figures.map((figure, i) => (
              <div key={figure.label} className="reveal flex flex-col border-t-2 border-terra pt-4" style={{ "--i": i } as CSSProperties}>
                <dt className="text-sm text-carbo/70">{figure.label}</dt>
                <dd className="display num order-first text-5xl text-terra">{figure.value}</dd>
              </div>
            ))}
          </dl>
          <div className="reveal grid gap-3 text-sm text-carbo/75">
            <p>{s.heat}</p>
            <p>{s.endOfLife}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
