/**
 * Coreografia de la primera pantalla: gelosies Empúries (fotos de producte de Ferrés, cada peça
 * sencera) que entren una a una fent saltirons, com si caminessin, fins a formar una composició
 * d'estudi: una filera al fons, un parell al davant, una peça sola i un mur de quatre. TypeScript pur
 * (sense DOM) perquè les proves el puguin llegir; el component només ho passa a variables CSS i
 * l'animació és CSS: corre abans que la pàgina sigui interactiva i no necessita JavaScript.
 *
 * Les posicions són en unitats de l'escenari (2048 × 1152); les mides de les fotos, en píxels del
 * retall que escriu `scripts/prepare-hero.mjs`.
 */

import manifest from "@/data/hero-pieces.json";

export const STAGE = { width: 2048, height: 1152 } as const;

export type SourceId = keyof typeof manifest.sources;
export type PieceId = "fons-1" | "fons-2" | "fons-3" | "davant-1" | "davant-2" | "petita" | "mur-1" | "mur-2" | "mur-3" | "mur-4";

type Point = readonly [number, number];
interface Source {
  w: number;
  h: number;
  /** On toca a terra la peça i on comença la tapa, a l'esquerra i a la dreta (px del retall). */
  footLeft: Point;
  footRight: Point;
  capLeft: Point;
  capRight: Point;
}
const point = ([x = 0, y = 0]: readonly number[]): Point => [x, y];
export const SOURCES = Object.fromEntries(
  Object.entries(manifest.sources).map(([id, s]) => [id, { w: s.w, h: s.h, footLeft: point(s.footLeft), footRight: point(s.footRight), capLeft: point(s.capLeft), capRight: point(s.capRight) }]),
) as Record<SourceId, Source>;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** On acaba una peça: quina foto, a quina escala i on toca a terra el seu peu esquerre. */
interface Spot {
  source: SourceId;
  scale: number;
  foot: Point;
}

/** Les peces del costat es toquen: es tapa la junta perquè no hi quedi una ratlla de fons. */
const JOINT = 6;
/** Fondària de la cara de dalt de la tapa: la peça de sobre hi recolza la base just al davant. */
const CAP_FACE = 25;

/** La peça que va just a la dreta d'una altra, a la mateixa fila. */
function next(prev: Spot, source: SourceId, scale = prev.scale): Spot {
  const p = SOURCES[prev.source];
  return { source, scale, foot: [prev.foot[0] + (p.footRight[0] - p.footLeft[0]) * prev.scale - JOINT, prev.foot[1]] };
}

/** La peça que va a sobre d'una altra (mur). */
function above(lower: Spot, source: SourceId): Spot {
  const p = SOURCES[lower.source];
  const [dx, dy] = [p.capLeft[0] - p.footLeft[0], p.capLeft[1] + CAP_FACE - p.footLeft[1]];
  return { source, scale: lower.scale, foot: [lower.foot[0] + dx * lower.scale, lower.foot[1] + dy * lower.scale] };
}

const fons1: Spot = { source: "b-rojo", scale: 0.64, foot: [330, 770] };
const fons2 = next(fons1, "b-rojo");
const fons3 = next(fons2, "b-rojo");
const mur3: Spot = { source: "b-arena", scale: 0.6, foot: [1268, 760] };
const mur4 = next(mur3, "a-arena");
const davant1: Spot = { source: "b-arena", scale: 0.76, foot: [585, 1080] };
const davant2 = next(davant1, "a-arena");

export const SPOTS: Record<PieceId, Spot> = {
  "fons-1": fons1,
  "fons-2": fons2,
  "fons-3": fons3,
  "mur-3": mur3,
  "mur-4": mur4,
  "mur-1": above(mur3, "a-arena"),
  "mur-2": above(mur4, "b-arena"),
  "davant-1": davant1,
  "davant-2": davant2,
  petita: { source: "b-rojo", scale: 0.7, foot: [1335, 1005] },
};

/** Ordre de profunditat: les de davant tapen les del fons; les de dalt del mur, la tapa de sota. */
export const DEPTH: Record<PieceId, number> = {
  "fons-1": 1,
  "fons-2": 1,
  "fons-3": 1,
  "mur-3": 2,
  "mur-4": 2,
  "mur-1": 3,
  "mur-2": 3,
  "davant-1": 4,
  "davant-2": 4,
  petita: 4,
};

/** Caixa del retall (peça i ombra) a l'escenari. */
export function boxOf(spot: Spot): Box {
  const s = SOURCES[spot.source];
  return { x: spot.foot[0] - s.footLeft[0] * spot.scale, y: spot.foot[1] - s.footLeft[1] * spot.scale, w: s.w * spot.scale, h: s.h * spot.scale };
}

/** Durada d'un saltiró (s). */
export const HOP = 0.21;
/** Alçada d'un saltiró, en unitats de l'escenari. */
export const HOP_HEIGHT = 26;
/** Durada d'una peça que cau de dalt i rebota (s). */
export const DROP = 0.95;

/**
 * - `walk`: arriba fent saltirons des de `from` (desplaçament i escala de sortida). Si ve del fons
 *   o del davant, apareix a poc a poc (`fade`); si ve de fora de la pantalla, no cal.
 * - `drop`: cau de dalt i rebota (les peces de dalt del mur, que s'hi enfilen).
 */
export type Entry =
  | { kind: "walk"; delay: number; hops: number; from: { x: number; y: number; scale?: number; fade?: boolean } }
  | { kind: "drop"; delay: number; from: { y: number } };

const fromBack = { x: 0, y: -230, scale: 0.82, fade: true };
const fromFront = { x: 0, y: 250, scale: 1.12, fade: true };

/**
 * Ordre: la filera del fons s'acosta des del fons; el mur arriba per la dreta (primer la de baix a
 * l'esquerra, que ha de passar per darrere de l'altra); el parell del davant puja des de baix; les
 * dues de dalt del mur hi salten a sobre; la petita arriba l'última, per davant del mur.
 */
export const ENTRIES: Record<PieceId, Entry> = {
  "fons-1": { kind: "walk", delay: 0, hops: 5, from: fromBack },
  "fons-2": { kind: "walk", delay: 0.16, hops: 5, from: fromBack },
  "fons-3": { kind: "walk", delay: 0.32, hops: 5, from: fromBack },
  "mur-3": { kind: "walk", delay: 0.2, hops: 7, from: { x: 820, y: 0 } },
  "mur-4": { kind: "walk", delay: 0.55, hops: 6, from: { x: 700, y: 0 } },
  "davant-1": { kind: "walk", delay: 1, hops: 4, from: fromFront },
  "davant-2": { kind: "walk", delay: 1.16, hops: 4, from: fromFront },
  "mur-1": { kind: "drop", delay: 1.75, from: { y: -900 } },
  "mur-2": { kind: "drop", delay: 1.95, from: { y: -900 } },
  petita: { kind: "walk", delay: 1.5, hops: 7, from: { x: 940, y: 0 } },
};

export function duration(entry: Entry): number {
  return entry.kind === "walk" ? entry.hops * HOP : DROP;
}

/** Quan arriba (s, des de la càrrega). */
export function arrival(id: PieceId): number {
  const entry = ENTRIES[id];
  return entry.delay + duration(entry);
}

/** Final de tota l'entrada (s). */
export function sequenceEnd(): number {
  return Math.max(...(Object.keys(ENTRIES) as PieceId[]).map(arrival));
}

export interface Piece extends Box {
  id: PieceId;
  source: SourceId;
  /** Les que cauen sobre el mur no fan ombra a terra (la de la foto és la d'una peça a terra). */
  shadow: boolean;
}

export const PIECES: readonly Piece[] = (Object.keys(SPOTS) as PieceId[]).map((id) => ({
  id,
  source: SPOTS[id].source,
  shadow: ENTRIES[id].kind === "walk",
  ...boxOf(SPOTS[id]),
}));

/** Percentatges de la caixa dins l'escenari (per a `left`, `top` i `width`). */
export function placement(box: Box) {
  return {
    left: (box.x / STAGE.width) * 100,
    top: (box.y / STAGE.height) * 100,
    width: (box.w / STAGE.width) * 100,
  };
}
