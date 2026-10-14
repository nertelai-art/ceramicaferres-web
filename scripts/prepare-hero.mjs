// Separa les peces de la foto d'estudi de les gelosies Empúries (imatge pròpia de Ferrés) en capes,
// perquè la primera pantalla les pugui fer entrar una a una. Cada peça surt amb la seva ombra dins
// el seu contorn; les ombres que queden fora van en dues capes (esquerra i dreta) que s'encenen al
// final. Les parts que una peça amaga d'una altra es reconstrueixen, perquè mentre camina es vegin
// senceres; quan arriba al lloc, la de davant les torna a tapar.
//
// Ús: node scripts/prepare-hero.mjs [--debug]
//   Llegeix _source/web/hero/Ceramica_Ferres_Empuries_NewSunbreak.jpg (ceramicaferres.com, 2023).
//   Escriu public/images/inici/*.webp (dues amplades) i src/data/hero-pieces.json.
//   Amb --debug deixa a _source/hero-debug/ el mapa de peces i la foto recomposta.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "_source/web/hero/Ceramica_Ferres_Empuries_NewSunbreak.jpg");
const OUT_DIR = join(root, "public/images/inici");
const MANIFEST = join(root, "src/data/hero-pieces.json");
const DEBUG_DIR = join(root, "_source/hero-debug");
const DEBUG = process.argv.includes("--debug");
/** Amplades de sortida: la foto original fa 2048 px. */
const SCALES = [
  { suffix: "1024", factor: 0.5 },
  { suffix: "2048", factor: 1 },
];

// Línies mesurades a la foto (px de l'original, 2048 × 1152).
/** Cantell de dalt del parell del davant. */
const frontTop = (x) => 701 - 0.245 * (x - 670);
/** Base de la filera del fons (s'allarga per sota del parell del davant, on no es veu). */
const backBottom = (x) => 853 - 0.31 * (x - 380);
/** Cantell de dalt de la peça petita (davant del mur). */
const SMALL_TOP = [
  [1226, 560],
  [1435, 507],
  [1455, 512],
  [1475, 522],
  [1503, 532],
];
const smallTop = (x) => {
  for (let i = 1; i < SMALL_TOP.length; i++) {
    const [x0, y0] = SMALL_TOP[i - 1];
    const [x1, y1] = SMALL_TOP[i];
    if (x <= x1) return y0 + ((Math.max(x, x0) - x0) * (y1 - y0)) / (x1 - x0);
  }
  return SMALL_TOP.at(-1)[1];
};
/** Píxels a tocar de la peça del davant que barregen les dues: es refan, com les parts amagades. */
const EDGE = 6;
/** Desplaçament entre una peça del mur i la de sota (mateixa columna), trobat per correlació. */
const WALL_ROW = { dx: -4, dy: 282 };
/** Alçada de la cara del davant de la base, i fins on arriba el terra de les obertures. */
const BASE_FACE = 22;
const BASE_FLOOR = 34;

/**
 * Peces en ordre de prioritat (les de davant primer): un píxel és de la primera que el conté.
 * `band` és la franja de dalt del contorn on es comprova el color, perquè el contorn és una mica
 * generós i no s'emporti trossos de la peça del darrere.
 */
const PIECES = [
  { id: "davant-1", group: "davant", tone: "clara", band: 10, polygon: [[667, 705], [934, 640], [934, 655], [958, 670], [963, 690], [961, 1050], [660, 1112], [660, 1038], [673, 1028], [674, 750], [667, 748]] },
  { id: "davant-2", group: "davant", tone: "clara", band: 10, polygon: [[934, 640], [1212, 565], [1212, 978], [961, 1050], [963, 690], [958, 670], [934, 655]] },
  { id: "petita", group: "petita", tone: "vermella", band: 10, polygon: [[1226, 554], [1435, 503], [1455, 508], [1475, 518], [1503, 528], [1503, 870], [1280, 931], [1226, 931]] },
  { id: "mur-1", group: "mur", tone: "clara", polygon: [[1345, 25], [1484, 25], [1488, 85], [1504, 100], [1509, 150], [1508, 390], [1480, 378], [1420, 352], [1345, 320]] },
  { id: "mur-2", group: "mur", tone: "clara", polygon: [[1484, 25], [1760, 25], [1760, 466], [1700, 452], [1600, 427], [1520, 400], [1508, 390], [1509, 150], [1504, 100], [1488, 85]] },
  { id: "mur-3", group: "mur", tone: "clara", polygon: [[1345, 320], [1420, 352], [1480, 378], [1490, 395], [1504, 420], [1507, 600], [1500, 700], [1345, 640]] },
  { id: "mur-4", group: "mur", tone: "clara", polygon: [[1508, 390], [1520, 400], [1600, 427], [1700, 452], [1760, 466], [1760, 752], [1680, 756], [1510, 686], [1500, 700], [1507, 600], [1504, 420], [1490, 395]] },
  { id: "fons-1", group: "fons", tone: "vermella", polygon: [[306, 430], [553, 430], [553, 440], [582, 478], [600, 505], [600, 735], [588, 790], [588, 813], [306, 900]] },
  { id: "fons-2", group: "fons", tone: "vermella", polygon: [[553, 360], [760, 360], [760, 380], [768, 400], [792, 415], [808, 432], [809, 700], [809, 742], [588, 813], [588, 790], [600, 735], [600, 505], [582, 478], [553, 440]] },
  { id: "fons-3", group: "fons", tone: "vermella", polygon: [[760, 320], [1015, 320], [1015, 678], [809, 742], [809, 700], [808, 432], [792, 415], [768, 400], [760, 380]] },
];

function inside(polygon, x, y) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function bounds(polygon) {
  const xs = polygon.map((p) => p[0]);
  const ys = polygon.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

/** Distància de cada punt al cantell de dalt del contorn (per a la franja de color). */
function topEdge(polygon, x) {
  let top = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (x >= Math.min(xi, xj) && x <= Math.max(xi, xj) && xi !== xj) top = Math.min(top, yi + ((x - xi) * (yj - yi)) / (xj - xi));
  }
  return top;
}

const smoothstep = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Ajust de segon grau (per canal) del fons llis, ignorant peces i ombres. */
function fitPlate(data, width, height, isPiece) {
  const terms = (x, y) => {
    const u = x / width - 0.5;
    const v = y / height - 0.5;
    return [1, u, v, u * u, u * v, v * v];
  };
  let coefficients = null;
  const evaluate = (c, x, y) => terms(x, y).reduce((sum, t, i) => sum + t * c[i], 0);
  for (let round = 0; round < 4; round++) {
    const n = 6;
    const ata = Array.from({ length: n }, () => new Float64Array(n));
    const atb = [new Float64Array(n), new Float64Array(n), new Float64Array(n)];
    for (let y = 0; y < height; y += 6) {
      for (let x = 0; x < width; x += 6) {
        if (isPiece(x, y)) continue;
        const i = (y * width + x) * 3;
        const rgb = [data[i], data[i + 1], data[i + 2]];
        // A partir de la segona volta, fora les ombres (més fosques que el fons ajustat).
        if (coefficients && rgb[1] < evaluate(coefficients[1], x, y) * 0.975) continue;
        const t = terms(x, y);
        for (let a = 0; a < n; a++) {
          for (let b = 0; b < n; b++) ata[a][b] += t[a] * t[b];
          for (let c = 0; c < 3; c++) atb[c][a] += t[a] * rgb[c];
        }
      }
    }
    coefficients = atb.map((b) => solve(ata.map((r) => Array.from(r)), Array.from(b)));
  }
  return (x, y) => coefficients.map((c) => evaluate(c, x, y));
}

function solve(a, b) {
  const n = b.length;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    for (let r = col + 1; r < n; r++) {
      const f = a[r][col] / a[col][col];
      for (let k = col; k < n; k++) a[r][k] -= f * a[col][k];
      b[r] -= f * b[col];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= a[r][k] * x[k];
    x[r] = s / a[r][r];
  }
  return x;
}

const { data, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const at = (x, y) => (y * width + x) * 3;

// Cromaticitat relativa: la terracota (fins i tot a l'ombra) en té; el fons gris i les ombres, no.
const ncr = new Float32Array(width * height);
for (let p = 0; p < width * height; p++) {
  const r = data[p * 3];
  const g = data[p * 3 + 1];
  const b = data[p * 3 + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  ncr[p] = (max - min) / Math.max(1, (r + g + b) / 3);
}
const rawAlpha = new Float32Array(width * height);
for (let p = 0; p < width * height; p++) rawAlpha[p] = smoothstep(0.11, 0.22, ncr[p]);
// El terra agafa una mica de color de la terracota (llum rebotada): sense aquest filtre en sortirien
// punts solts que caminarien amb la peça. Un píxel és de peça si al voltant també n'hi ha.
const RADIUS = 4;
const integral = new Float64Array((width + 1) * (height + 1));
for (let y = 0; y < height; y++) {
  let row = 0;
  for (let x = 0; x < width; x++) {
    row += rawAlpha[y * width + x];
    integral[(y + 1) * (width + 1) + x + 1] = integral[y * (width + 1) + x + 1] + row;
  }
}
const alphaMap = new Float32Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const x0 = Math.max(0, x - RADIUS);
    const y0 = Math.max(0, y - RADIUS);
    const x1 = Math.min(width, x + RADIUS + 1);
    const y1 = Math.min(height, y + RADIUS + 1);
    const sum = integral[y1 * (width + 1) + x1] - integral[y0 * (width + 1) + x1] - integral[y1 * (width + 1) + x0] + integral[y0 * (width + 1) + x0];
    const mean = sum / ((x1 - x0) * (y1 - y0));
    alphaMap[y * width + x] = rawAlpha[y * width + x] * smoothstep(0.18, 0.4, mean);
  }
}
const pieceAlpha = (x, y) => alphaMap[y * width + x];

const plate = fitPlate(data, width, height, (x, y) => ncr[y * width + x] > 0.06 || PIECES.some((p) => inside(p.polygon, x, y)));

/** De qui és cada píxel (índex a PIECES, o -1). */
const owner = new Int16Array(width * height).fill(-1);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    for (let k = 0; k < PIECES.length; k++) {
      const piece = PIECES[k];
      if (!inside(piece.polygon, x, y)) continue;
      if (piece.band && y - topEdge(piece.polygon, x) < piece.band && pieceAlpha(x, y) > 0) {
        const i = at(x, y);
        const ratio = data[i + 1] / Math.max(1, data[i]);
        // A la franja de dalt, el color diu si el píxel és d'aquesta peça o de la del darrere.
        const mine = piece.tone === "clara" ? ratio > 0.7 : data[i] > 200 && ratio < 0.75;
        if (!mine) continue;
      }
      owner[y * width + x] = k;
      break;
    }
  }
}

/** Ombra: quant més fosc que el fons és un píxel que no és de cap peça. */
function shadowAt(x, y) {
  const i = at(x, y);
  const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  const [pr, pg, pb] = plate(x, y);
  const plum = 0.2126 * pr + 0.7152 * pg + 0.0722 * pb;
  return Math.min(1, Math.max(0, (1 - lum / plum - 0.022) / 0.978));
}

/** Píxel RGBA d'una peça (color net de fons a les vores) amb l'ombra a la resta. */
function layerPixel(x, y) {
  const i = at(x, y);
  const a = pieceAlpha(x, y);
  const s = shadowAt(x, y);
  const alpha = a + (1 - a) * s;
  if (alpha <= 0.002) return [0, 0, 0, 0];
  const bg = plate(x, y);
  const rgb = [0, 1, 2].map((c) => {
    if (a <= 0) return 0;
    const clean = (data[i + c] - (1 - a) * bg[c]) / a;
    return (Math.min(255, Math.max(0, clean)) * a) / alpha;
  });
  return [...rgb, alpha * 255];
}

/** Reconstrucció de les parts amagades (vegeu la capçalera). Retorna RGBA o null. */
function hiddenPixel(piece, x, y) {
  const covered = owner[y * width + x];
  const nearFront = piece.group === "fons" && x >= 655 && y >= frontTop(x) - EDGE;
  const nearSmall = piece.id === "mur-3" && x >= 1226 && y >= smallTop(x) - EDGE;
  if (!nearFront && !nearSmall && (covered < 0 || PIECES[covered].group === piece.group)) return null;
  if (piece.group === "fons") {
    // La base de la filera del fons queda darrere del parell del davant. Les costelles i les
    // obertures baixen rectes fins a la base; la base (cara del davant i terra de les obertures)
    // es copia de la primera peça, que es veu sencera.
    const bottom = backBottom(x);
    const top = frontTop(x);
    if (y < top - EDGE || y > bottom) return null;
    const depth = bottom - y;
    const base = (d) => {
      const sx = 436 + (x % 30);
      const i = at(sx, Math.round(backBottom(sx) - d));
      return [data[i], data[i + 1], data[i + 2], 255];
    };
    if (depth < BASE_FACE) return base(depth);
    const i = at(x, Math.round(top - EDGE - 3));
    const above = [data[i], data[i + 1], data[i + 2], 255];
    const opening = above[0] + above[1] + above[2] < 330;
    return depth < BASE_FLOOR && opening ? base(depth) : above;
  }
  if (piece.id === "mur-3") {
    // La de baix a l'esquerra del mur és igual que la de sobre.
    const sx = x - WALL_ROW.dx;
    const sy = y - WALL_ROW.dy;
    const source = PIECES.findIndex((p) => p.id === "mur-1");
    if (sy < 0 || owner[sy * width + sx] !== source) return null;
    return layerPixel(sx, sy);
  }
  return null;
}

await mkdir(OUT_DIR, { recursive: true });
const manifest = { width, height, pieces: [], shadows: [] };

async function writeLayer(name, box, pixel) {
  const buffer = Buffer.alloc(box.w * box.h * 4);
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      const value = pixel(box.x + x, box.y + y);
      buffer.set(value.map((v) => Math.round(v)), (y * box.w + x) * 4);
    }
  }
  const image = sharp(buffer, { raw: { width: box.w, height: box.h, channels: 4 } });
  for (const { suffix, factor } of SCALES) {
    await image
      .clone()
      .resize(Math.round(box.w * factor), Math.round(box.h * factor))
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toFile(join(OUT_DIR, `${name}-${suffix}.webp`));
  }
  return buffer;
}

for (const [k, piece] of PIECES.entries()) {
  const box = bounds(piece.polygon);
  box.w = Math.min(box.w, width - box.x);
  box.h = Math.min(box.h, height - box.y);
  await writeLayer(piece.id, box, (x, y) => {
    if (!inside(piece.polygon, x, y)) return [0, 0, 0, 0];
    const hidden = hiddenPixel(piece, x, y);
    if (hidden) return hidden;
    if (owner[y * width + x] === k) return layerPixel(x, y);
    // Píxel que no és de cap peça: ombra o fons (transparent).
    if (owner[y * width + x] < 0) {
      const s = shadowAt(x, y);
      return [0, 0, 0, s * 255];
    }
    return [0, 0, 0, 0];
  });
  manifest.pieces.push({ id: piece.id, group: piece.group, ...box });
}

// Ombres fora de les peces: una capa per a cada meitat de la composició.
const SPLIT = 1010;
for (const side of [
  { id: "ombra-esquerra", x0: 0, x1: SPLIT },
  { id: "ombra-dreta", x0: SPLIT, x1: width },
]) {
  const box = { x: side.x0, y: 0, w: side.x1 - side.x0, h: height };
  await writeLayer(side.id, box, (x, y) => {
    if (owner[y * width + x] >= 0 || PIECES.some((p) => inside(p.polygon, x, y))) return [0, 0, 0, 0];
    return [0, 0, 0, shadowAt(x, y) * 255];
  });
  manifest.shadows.push({ id: side.id, ...box });
}

const corners = [
  [0, 0],
  [width - 1, 0],
  [0, height - 1],
  [width - 1, height - 1],
  [width / 2, height / 2],
].map(([x, y]) => `#${plate(x, y).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`);
manifest.plate = { topLeft: corners[0], topRight: corners[1], bottomLeft: corners[2], bottomRight: corners[3], center: corners[4] };

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Fet: ${PIECES.length} peces i 2 ombres a ${OUT_DIR}; fons ${JSON.stringify(manifest.plate)}`);

if (DEBUG) {
  await mkdir(DEBUG_DIR, { recursive: true });
  // Mapa de peces: cada una d'un color sobre la foto.
  const palette = [[255, 0, 0], [255, 140, 0], [0, 160, 255], [0, 200, 80], [160, 0, 255], [255, 0, 200], [120, 120, 0], [0, 0, 255], [0, 255, 255], [255, 255, 0]];
  const map = Buffer.from(data);
  for (let p = 0; p < width * height; p++) {
    const k = owner[p];
    if (k < 0 || pieceAlpha(p % width, Math.floor(p / width)) < 0.5) continue;
    for (let c = 0; c < 3; c++) map[p * 3 + c] = Math.round(map[p * 3 + c] * 0.55 + palette[k][c] * 0.45);
  }
  await sharp(map, { raw: { width, height, channels: 3 } }).jpeg({ quality: 85 }).toFile(join(DEBUG_DIR, "peces.jpg"));

  // Recomposició: fons ajustat + ombres + peces al seu lloc. Ha de semblar la foto.
  const composite = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) composite.set(plate(x, y).map(Math.round), at(x, y));
  const layers = [
    ...manifest.shadows.map((s) => ({ ...s, file: `${s.id}-2048.webp` })),
    ...[...manifest.pieces].reverse().map((p) => ({ ...p, file: `${p.id}-2048.webp` })),
  ];
  for (const layer of layers) {
    const { data: rgba } = await sharp(join(OUT_DIR, layer.file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let y = 0; y < layer.h; y++) {
      for (let x = 0; x < layer.w; x++) {
        const s = (y * layer.w + x) * 4;
        const a = rgba[s + 3] / 255;
        if (a === 0) continue;
        const d = at(layer.x + x, layer.y + y);
        for (let c = 0; c < 3; c++) composite[d + c] = Math.round(rgba[s + c] * a + composite[d + c] * (1 - a));
      }
    }
  }
  let error = 0;
  for (let i = 0; i < composite.length; i++) error += Math.abs(composite[i] - data[i]);
  console.log(`Diferència mitjana amb la foto: ${(error / composite.length).toFixed(2)} (de 255)`);
  await sharp(composite, { raw: { width, height, channels: 3 } }).jpeg({ quality: 85 }).toFile(join(DEBUG_DIR, "recomposta.jpg"));
}
