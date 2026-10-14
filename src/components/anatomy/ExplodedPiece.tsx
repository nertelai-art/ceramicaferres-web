import type { CSSProperties } from "react";
import { MATERIALS, type GlazeFile, type MaterialKey } from "@/data/materials";

/**
 * Peça ceràmica explosionada en CSS 3D (sense WebGL): esmalt, cos ceràmic i porus, amb les mostres
 * reals de la carta d'acabats com a textura. La separació la governa la variable CSS `--spread`
 * (0 = peça muntada, 1 = capes separades), que posa el component pare; les etiquetes la segueixen.
 */

/** Separació màxima entre capes, en px. */
const SPREAD = 110;
/** Gruix de cada capa i on comença, en px dins la peça muntada. */
const LAYERS = [
  { z: 34, thickness: 5, spread: 1 }, // esmalt
  { z: 18, thickness: 16, spread: 0 }, // cos ceràmic
  { z: 0, thickness: 18, spread: -1 }, // porus
] as const;
/** Inclinació de la vista: la mateixa al 3D i al càlcul de les etiquetes. */
const TILT_X = 57;
const SIN_TILT = Math.sin((TILT_X * Math.PI) / 180);

const BODY_SWATCH: Record<MaterialKey, string> = {
  rojo15: "/esmalts/rojo-15.webp",
  arena14: "/esmalts/arena-14.webp",
  gres: "/esmalts/gres-natural.webp",
  vidriat: "/esmalts/rojo-15.webp",
};

/** Porositat dibuixada per CSS: punts de diverses mides, sempre iguals (sense atzar). */
const PORES = {
  image: [
    "radial-gradient(circle at 20% 30%, rgba(30,14,6,.55) 0 2px, transparent 3px)",
    "radial-gradient(circle at 70% 60%, rgba(30,14,6,.5) 0 1.5px, transparent 2.5px)",
    "radial-gradient(circle at 45% 80%, rgba(30,14,6,.45) 0 3px, transparent 4px)",
    "radial-gradient(circle at 85% 15%, rgba(30,14,6,.4) 0 1px, transparent 2px)",
  ].join(","),
  size: "23px 23px, 31px 31px, 47px 47px, 13px 13px",
};

const layerZ = (i: number) => `calc(${LAYERS[i]!.z}px + var(--spread, 0) * ${LAYERS[i]!.spread * SPREAD}px)`;

/** Reserva sense WebGL: només la cara de dalt de cada capa, amb ombra suau (sense cantells). */
function Slab({ top }: { top: CSSProperties }) {
  return <div className="absolute inset-0 rounded-[4px] bg-cover bg-center shadow-[0_18px_30px_-12px_rgba(46,32,22,0.45)]" style={top} />;
}

export interface PieceLabel {
  title: string;
  text?: string;
}

export function ExplodedPiece({
  material,
  glaze,
  labels,
  active,
  className = "",
}: {
  material: MaterialKey;
  glaze: GlazeFile;
  /** Una etiqueta per capa (esmalt, cos, porus). Sense etiquetes, només la peça. */
  labels?: readonly PieceLabel[];
  /** Capa ressaltada; les altres s'esvaeixen una mica. */
  active?: number;
  className?: string;
}) {
  const glazed = MATERIALS[material].glazed;
  const dim = (i: number) => (active === undefined || active === i ? 1 : 0.5);
  const tops: CSSProperties[] = [
    {
      backgroundImage: `linear-gradient(125deg, rgba(255,255,255,.4), rgba(255,255,255,0) 38%), url(/esmalts/${glaze}.webp)`,
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,.2)",
    },
    { backgroundImage: `url(${BODY_SWATCH[material]})` },
    { backgroundImage: `${PORES.image}, url(${BODY_SWATCH[material]})`, backgroundSize: `${PORES.size}, cover` },
  ];

  return (
    <div className={`relative grid place-items-center [--piece:min(52vw,18rem)] ${className}`} aria-hidden="true">
      <div className="[perspective:1800px]">
        <div className="relative size-[var(--piece)] [transform-style:preserve-3d]" style={{ transform: `rotateX(${TILT_X}deg) rotateZ(-40deg)` }}>
          {[2, 1, 0].map((i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-500 [transform-style:preserve-3d]"
              style={{ transform: `translateZ(${layerZ(i)})`, opacity: i === 0 && !glazed ? 0 : dim(i) }}
            >
              <Slab top={tops[i]!} />
            </div>
          ))}
        </div>
      </div>
      {labels && (
        <ol className="pointer-events-none absolute left-[calc(50%+var(--piece)*0.62)] top-1/2 hidden w-[min(16rem,30vw)] md:block">
          {labels.map((label, i) => (
            <li
              key={label.title}
              className="absolute left-0 flex -translate-y-1/2 items-start gap-3 transition-opacity duration-500"
              style={
                {
                  top: `calc((${LAYERS[i]!.z + LAYERS[i]!.thickness}px + var(--spread, 0) * ${LAYERS[i]!.spread * SPREAD}px) * ${-SIN_TILT})`,
                  opacity: i === 0 && !glazed ? 0.35 : dim(i),
                } as CSSProperties
              }
            >
              <span className="mt-2.5 h-px w-8 shrink-0 bg-terra" />
              <span>
                <span className="flex items-baseline gap-2">
                  <span className="num text-xs font-semibold text-terra">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`font-semibold ${i === 0 && !glazed ? "line-through decoration-carbo/40" : ""}`}>{label.title}</span>
                </span>
                {label.text && <span className="mt-1 block text-xs leading-snug text-carbo/70">{label.text}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
