import type { CSSProperties } from "react";
import { DEPTH, DROP, ENTRIES, HOP, HOP_HEIGHT, PIECES, placement, sequenceEnd, SHADOWS, shadowTiming, STAGE, type Box } from "./hero-phases";

/** Amplada de l'escenari: 76vw a escriptori (o menys si la pantalla és baixa) i 128vw a mòbil. */
function sizes(box: Box) {
  const share = box.w / STAGE.width;
  return `(min-width: 1024px) ${(share * 76).toFixed(2)}vw, ${(share * 128).toFixed(2)}vw`;
}

function Layer({ id, box, className }: { id: string; box: Box; className?: string }) {
  const half = Math.round(box.w / 2);
  return (
    // <img> i no next/image: capes ja preparades a dues mides, i l'escenari en decideix l'amplada.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/inici/${id}-2048.webp`}
      srcSet={`/images/inici/${id}-1024.webp ${half}w, /images/inici/${id}-2048.webp ${box.w}w`}
      sizes={sizes(box)}
      alt=""
      width={box.w}
      height={box.h}
      decoding="async"
      className={className}
    />
  );
}

/** Estil amb variables CSS (les llegeixen les animacions de globals.css). */
type Style = CSSProperties & Record<`--${string}`, string | number>;
const vars = (style: Style) => style as CSSProperties;

const at = (box: Box): Style => {
  const p = placement(box);
  return { left: `${p.left}%`, top: `${p.top}%`, width: `${p.width}%` };
};

/**
 * Les peces de la foto d'estudi de les Empúries, cadascuna en una capa, que entren fent saltirons.
 * L'animació és CSS (vegeu `.hero-stage` a globals.css): sense JavaScript i, amb moviment reduït,
 * directament la composició final.
 */
export function HeroStage({ label, caption }: { label: string; caption: string }) {
  return (
    <div role="img" aria-label={label} className="hero-stage" style={vars({ "--hop": `${HOP}s`, "--hop-h": HOP_HEIGHT, "--drop": `${DROP}s`, "--end": `${sequenceEnd().toFixed(2)}s` })}>
      {SHADOWS.map((shadow) => {
        const timing = shadowTiming(shadow.id);
        return (
          <div key={shadow.id} className="hero-shadow" style={vars({ ...at(shadow), "--delay": `${timing.delay}s`, "--fade": `${timing.duration}s` })}>
            <Layer id={shadow.id} box={shadow} />
          </div>
        );
      })}
      {PIECES.map((piece) => {
        const entry = ENTRIES[piece.id];
        const from: Style =
          entry.kind === "walk"
            ? { "--hops": entry.hops, "--from-x": entry.from.x, "--from-y": entry.from.y, "--from-s": entry.from.scale ?? 1, "--from-o": entry.from.fade ? 0 : 1 }
            : { "--from-y": entry.from.y };
        return (
          <div key={piece.id} className="hero-piece" data-entry={entry.kind} style={vars({ ...at(piece), zIndex: DEPTH[piece.id], "--delay": `${entry.delay}s`, ...from })}>
            <Layer id={piece.id} box={piece} />
          </div>
        );
      })}
      <p className="hero-caption">{caption}</p>
    </div>
  );
}
