import Image from "next/image";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { PROJECTS } from "@/data/projects";
import { SECTION_IDS } from "@/lib/routes";

/** Ritme de la graella: alterna peces altes i baixes perquè no sembli un catàleg. */
const SHAPES = ["aspect-[4/5]", "aspect-[4/3]", "aspect-[4/3]", "aspect-[4/5]", "aspect-[4/3]", "aspect-[4/5]", "aspect-[4/3]", "aspect-[4/5]", "aspect-[4/3]"];

export function Projects({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id={SECTION_IDS.projects} aria-labelledby="projectes-titol" className="bg-calc-2 py-[clamp(5rem,11vw,9rem)]">
      <div className="container-x">
        <div className="max-w-3xl">
          <p className="reveal eyebrow text-terra">{t.projects.eyebrow}</p>
          <h2 id="projectes-titol" className="reveal display mt-4 text-[clamp(2.4rem,5.4vw,5rem)]">
            {t.projects.title}
          </h2>
          <p className="reveal mt-5 text-lg text-carbo/75">{t.projects.lead}</p>
        </div>

        <ul className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
          {PROJECTS.map((project, i) => (
            <li key={project.slug} className="reveal break-inside-avoid" style={{ "--i": i % 3 } as CSSProperties}>
              <figure className="group">
                <div className={`relative overflow-hidden rounded-xl bg-calc ${SHAPES[i % SHAPES.length]}`}>
                  <Image
                    src={project.image}
                    alt={`${project.title[locale]} — ${project.products.join(", ")}`}
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="mt-3 grid gap-1">
                  <span className="font-semibold">{project.title[locale]}</span>
                  <span className="text-sm text-terra">
                    {t.projects.product}: {project.products.join(" · ")}
                  </span>
                  <span className="text-xs text-carbo/60">
                    {project.credits.map((credit) => `${t.projects.roles[credit.role]}: ${credit.name}`).join(" · ")}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <a className="btn btn-ghost text-carbo" href="https://ceramicaferres.com/proyectos/" rel="noopener">
            {t.projects.more} <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </section>
  );
}
