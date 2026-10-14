/**
 * Coreografia de la primera pantalla: les peces de la foto d'estudi de les gelosies Empúries entren
 * una a una fent saltirons, com si caminessin, i s'aturen al lloc exacte de la foto. TypeScript pur
 * (sense DOM) perquè les proves el puguin llegir; el component només ho passa a variables CSS i
 * l'animació és CSS: corre abans que la pàgina sigui interactiva i no necessita JavaScript.
 *
 * Les posicions són en píxels de la foto original (2048 × 1152), com el manifest que escriu
 * `scripts/prepare-hero.mjs`.
 */

import manifest from "@/data/hero-pieces.json";

export const STAGE = { width: manifest.width, height: manifest.height } as const;

export type PieceId = "fons-1" | "fons-2" | "fons-3" | "davant-1" | "davant-2" | "petita" | "mur-1" | "mur-2" | "mur-3" | "mur-4";
export type ShadowId = "ombra-esquerra" | "ombra-dreta";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Durada d'un saltiró (s). */
export const HOP = 0.21;
/** Alçada d'un saltiró, en px de la foto. */
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
  "mur-3": { kind: "walk", delay: 0.2, hops: 7, from: { x: 800, y: 0 } },
  "mur-4": { kind: "walk", delay: 0.55, hops: 6, from: { x: 680, y: 0 } },
  "davant-1": { kind: "walk", delay: 1, hops: 4, from: fromFront },
  "davant-2": { kind: "walk", delay: 1.16, hops: 4, from: fromFront },
  "mur-1": { kind: "drop", delay: 1.75, from: { y: -900 } },
  "mur-2": { kind: "drop", delay: 1.95, from: { y: -900 } },
  petita: { kind: "walk", delay: 1.5, hops: 7, from: { x: 920, y: 0 } },
};

/** Ordre de profunditat: les de davant tapen les del fons. */
export const DEPTH: Record<PieceId, number> = {
  "fons-1": 1,
  "fons-2": 1,
  "fons-3": 1,
  "mur-1": 1,
  "mur-2": 1,
  "mur-3": 1,
  "mur-4": 1,
  "davant-1": 3,
  "davant-2": 3,
  petita: 3,
};

/** Quines peces fan cada ombra llarga: l'ombra s'encén quan totes han arribat. */
export const SHADOW_OF: Record<ShadowId, readonly PieceId[]> = {
  "ombra-esquerra": ["fons-1", "fons-2", "fons-3", "davant-1", "davant-2"],
  "ombra-dreta": ["mur-1", "mur-2", "mur-3", "mur-4", "petita"],
};
export const SHADOW_FADE = 0.6;

export function duration(entry: Entry): number {
  return entry.kind === "walk" ? entry.hops * HOP : DROP;
}

/** Quan arriba (s, des de la càrrega). */
export function arrival(id: PieceId): number {
  const entry = ENTRIES[id];
  return entry.delay + duration(entry);
}

export function shadowTiming(id: ShadowId): { delay: number; duration: number } {
  return { delay: Math.max(...SHADOW_OF[id].map(arrival)) - SHADOW_FADE / 3, duration: SHADOW_FADE };
}

/** Final de tota l'entrada (s). */
export function sequenceEnd(): number {
  const pieces = (Object.keys(ENTRIES) as PieceId[]).map(arrival);
  const shadows = (Object.keys(SHADOW_OF) as ShadowId[]).map((id) => {
    const t = shadowTiming(id);
    return t.delay + t.duration;
  });
  return Math.max(...pieces, ...shadows);
}

export const PIECES = manifest.pieces as readonly (Box & { id: PieceId; group: string })[];
export const SHADOWS = manifest.shadows as readonly (Box & { id: ShadowId })[];

/** Percentatges de la caixa dins l'escenari (per a `left`, `top` i `width`). */
export function placement(box: Box) {
  return {
    left: (box.x / STAGE.width) * 100,
    top: (box.y / STAGE.height) * 100,
    width: (box.w / STAGE.width) * 100,
  };
}
