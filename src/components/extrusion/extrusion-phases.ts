/**
 * Coreografia de «De la filera a la peça»: TypeScript pur, sense three.js, perquè l'HTML (passos,
 * barra) i les proves la puguin llegir. L'escena 3D només aplica el que aquí es calcula.
 *
 * Tot passa en un món on l'eix d'extrusió és +X: la filera és a `DIE_X` i el fang en surt cap a la
 * dreta. Al final, les peces giren 90° i formen un mur de celosia al pla `WALL_Z`, de cara a la càmera.
 */

export type Range = readonly [number, number];

export const PHASES = {
  profile: [0, 0.12],
  die: [0.06, 0.2],
  extrude: [0.18, 0.44],
  cut: [0.44, 0.56],
  dry: [0.54, 0.66],
  fire: [0.64, 0.8],
  wall: [0.76, 0.98],
  sun: [0.84, 1],
} as const satisfies Record<string, Range>;

/** Passos que llegeix l'HTML, en ordre. `from` és on comença cada pas. */
export const STEPS = [
  { key: "profile", from: 0 },
  { key: "extrude", from: PHASES.extrude[0] },
  { key: "cut", from: PHASES.cut[0] },
  { key: "fire", from: PHASES.dry[0] },
  { key: "wall", from: PHASES.wall[0] },
] as const;
export type StepKey = (typeof STEPS)[number]["key"];

/** Peça Volta en unitats d'escena: 1 = amplada de la cara. */
// Volta real: 12 × 24 × 7 cm (fitxa tècnica de Ferrés). 1 unitat = 12 cm.
export const PIECE = { width: 1, height: 2, depth: 7 / 12, wall: 0.13 } as const;
export const COUNT = 12;
export const COLS = 4;
export const ROWS = COUNT / COLS;
export const DIE_X = -3.6;
export const WALL_Z = -1.5;
const GAP = 0.22;

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const range = (p: number, [a, b]: Range) => clamp((p - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function stepAt(p: number): number {
  let index = 0;
  for (const [i, step] of STEPS.entries()) if (p >= step.from) index = i;
  return index;
}

/**
 * Contorn de la cara d'una peça Volta: un rectangle amb un buit d'arc de mig punt a dalt i pla a baix.
 * Coordenades centrades a la peça. El buit es dona en sentit contrari al contorn, com vol `Shape`.
 */
export function voltaOutline() {
  const { width: w, height: h, wall: t } = PIECE;
  const outer: [number, number][] = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
  const r = w / 2 - t;
  const springLine = h / 2 - t - r; // on comença l'arc
  const hole: [number, number][] = [[-r, -h / 2 + t]];
  hole.push([-r, springLine]);
  const segments = 24;
  for (let i = 1; i < segments; i++) {
    const angle = Math.PI - (i / segments) * Math.PI;
    hole.push([Math.cos(angle) * r, springLine + Math.sin(angle) * r]);
  }
  hole.push([r, springLine], [r, -h / 2 + t]);
  return { outer, hole };
}

/** Llargada del fang que ha sortit de la filera. */
export const columnLength = (p: number) => COUNT * PIECE.depth * easeInOutCubic(range(p, PHASES.extrude));

/** Posició al mur de la peça `i`: de baix a dalt i d'esquerra a dreta, com es posa una celosia. */
export function wallSlot(i: number) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return { x: (col - (COLS - 1) / 2) * PIECE.width, y: PIECE.height / 2 + row * PIECE.height, z: WALL_Z };
}

/** Posició a la cinta, després del tall: la 0 és la que ha quedat més a prop de la filera. */
export function beltSlot(i: number, cut: number) {
  const step = PIECE.depth + GAP * cut;
  return { x: DIE_X + 0.35 * cut + i * step + PIECE.depth / 2, y: PIECE.height / 2, z: 0 };
}

export interface PieceState {
  visible: boolean;
  x: number;
  y: number;
  z: number;
  /** Gir sobre Y. π/2: l'eix d'extrusió mira cap a +X (a la cinta). 0: mira la càmera (al mur). */
  yaw: number;
}

/** Retard de cada peça en el vol cap al mur: primer la fila de baix. */
const flightDelay = (i: number) => (i / (COUNT - 1)) * 0.45;
const FLIGHT = 0.55;

export function pieceAt(i: number, p: number): PieceState {
  const cutStarted = p >= PHASES.cut[0];
  const belt = beltSlot(i, easeOutCubic(range(p, PHASES.cut)));
  const t = easeInOutCubic(clamp((range(p, PHASES.wall) - flightDelay(i)) / FLIGHT));
  const slot = wallSlot(i);
  return {
    visible: cutStarted,
    x: lerp(belt.x, slot.x, t),
    y: lerp(belt.y, slot.y, t) + Math.sin(Math.PI * t) * 1.4,
    z: lerp(belt.z, slot.z, t),
    yaw: lerp(Math.PI / 2, 0, t),
  };
}

/** Color del fang: 0 = humit, 1 = sec, 2 = cuit. La brasa puja i baixa durant la cocció. */
export function clayStage(p: number) {
  const dried = range(p, PHASES.dry);
  const fire = range(p, PHASES.fire);
  return { dried, fired: clamp(fire / 0.6), glow: Math.sin(Math.PI * fire) };
}

export const profileDraw = (p: number) => easeOutCubic(range(p, PHASES.profile));
export const profileOpacity = (p: number) => 1 - range(p, [0.16, 0.24]);
export const dieOpacity = (p: number) => easeOutCubic(range(p, PHASES.die)) * (1 - range(p, [0.72, 0.8]));
export const columnVisible = (p: number) => p < PHASES.cut[0] && columnLength(p) > 0.001;
export const sunAt = (p: number) => easeInOutCubic(range(p, PHASES.sun));

/** Fotogrames clau de la càmera: posició i punt on mira. */
export const CAMERA_KEYS = [
  { at: 0, position: [DIE_X + 5.6, 1.7, 2.8], target: [DIE_X, 1, 0] },
  { at: 0.2, position: [DIE_X + 6.4, 2.6, 7], target: [DIE_X + 1.8, 1, 0] },
  { at: 0.46, position: [1.8, 3.8, 16.5], target: [1.8, 1, 0] },
  { at: 0.72, position: [1.6, 3.5, 15.5], target: [1.6, 1, 0] },
  { at: 1, position: [2.4, 3.8, 15], target: [0, 2.9, WALL_Z] },
] as const;

/** Càmera interpolada entre fotogrames clau, amb corba suau a cada tram. */
export function cameraAt(p: number) {
  const keys = CAMERA_KEYS;
  let k = 0;
  while (k < keys.length - 2 && p >= keys[k + 1]!.at) k++;
  const a = keys[k]!;
  const b = keys[k + 1]!;
  const t = easeInOutCubic(clamp((p - a.at) / (b.at - a.at)));
  const mix = (u: readonly number[], v: readonly number[]) => u.map((value, i) => lerp(value, v[i]!, t)) as [number, number, number];
  return { position: mix(a.position, b.position), target: mix(a.target, b.target) };
}
