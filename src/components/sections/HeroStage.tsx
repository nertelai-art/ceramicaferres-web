import type { CSSProperties } from "react";
import { DEPTH, DROP, ENTRIES, HOP, HOP_HEIGHT, PIECES, placement, sequenceEnd, SOURCES, STAGE, type Box, type Piece } from "./hero-phases";

/** Amplada de l'escenari: 70vw a escriptori (o menys si la pantalla és baixa) i 124vw a mòbil. */
function sizes(box: Box) {
  const share = box.w / STAGE.width;
  return `(min-width: 1024px) ${(share * 70).toFixed(2)}vw, ${(share * 124).toFixed(2)}vw`;
}

function Layer({ piece, file }: { piece: Piece; file: string }) {
  const { w, h } = SOURCES[piece.source];
  return (
    // <img> i no next/image: retalls ja preparats a dues mides, i l'escenari en decideix l'amplada.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/inici/${file}-2x.webp`}
      srcSet={`/images/inici/${file}-1x.webp ${Math.round(w / 2)}w, /images/inici/${file}-2x.webp ${w}w`}
      sizes={sizes(piece)}
      alt=""
      width={w}
      height={h}
      decoding="async"
    />
  );
}

/** Estil amb variables CSS (les llegeixen les animacions de globals.css). */
type Style = CSSProperties & Record<`--${string}`, string | number>;
const vars = (style: Style) => style as CSSProperties;

function motion(piece: Piece): Style {
  const p = placement(piece);
  const entry = ENTRIES[piece.id];
  const from: Style =
    entry.kind === "walk"
      ? { "--hops": entry.hops, "--from-x": entry.from.x, "--from-y": entry.from.y, "--from-s": entry.from.scale ?? 1, "--from-o": entry.from.fade ? 0 : 1 }
      : { "--from-y": entry.from.y };
  return { left: `${p.left}%`, top: `${p.top}%`, width: `${p.width}%`, "--delay": `${entry.delay}s`, ...from };
}

/**
 * Gelosies Empúries senceres (fotos de producte de Ferrés) que entren fent saltirons i formen una
 * composició d'estudi. Cada peça té l'ombra en una capa a part, sota totes les peces: camina amb la
 * peça però no salta. L'animació és CSS (vegeu `.hero-stage` a globals.css): sense JavaScript i,
 * amb moviment reduït, directament la composició final.
 */
export function HeroStage({ label, caption }: { label: string; caption: string }) {
  // Peu en dues línies: la peça i el disseny a dalt, el premi a sota.
  const parts = caption.split(" · ");
  return (
    <div role="img" aria-label={label} className="hero-stage" style={vars({ "--hop": `${HOP}s`, "--hop-h": HOP_HEIGHT, "--drop": `${DROP}s`, "--end": `${sequenceEnd().toFixed(2)}s` })}>
      {PIECES.filter((piece) => piece.shadow).map((piece) => (
        <div key={`${piece.id}-ombra`} className="hero-shadow" data-entry={ENTRIES[piece.id].kind} style={vars(motion(piece))}>
          <Layer piece={piece} file={`${piece.source}-ombra`} />
        </div>
      ))}
      {PIECES.map((piece) => (
        <div key={piece.id} className="hero-piece" data-entry={ENTRIES[piece.id].kind} style={vars({ ...motion(piece), zIndex: DEPTH[piece.id] })}>
          <Layer piece={piece} file={piece.source} />
        </div>
      ))}
      <p className="hero-caption">
        {parts.slice(0, -1).join(" · ")}
        <span className="block">{parts.at(-1)}</span>
      </p>
    </div>
  );
}
