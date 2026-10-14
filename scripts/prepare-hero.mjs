// Retalla les fotos de producte de les gelosies Empúries (fotos pròpies de Ferrés, una peça sencera
// sobre fons blanc) per a la primera pantalla. Cada peça surt en dues capes: la peça i la seva
// ombra, perquè l'ombra es quedi a terra quan la peça salta. La composició (on va cada peça i com hi
// arriba) és a src/components/sections/hero-phases.ts.
//
// Ús: node scripts/prepare-hero.mjs [--debug]
//   Llegeix _source/web/productos/celosias/empuries/*.jpg (ceramicaferres.com, fitxa d'Empúries).
//   Escriu public/images/inici/*.webp (dues amplades) i src/data/hero-pieces.json.
//   Amb --debug deixa a _source/hero-debug/ cada retall sobre el color de fons de la web.

import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(root, "_source/web/productos/celosias/empuries");
const OUT_DIR = join(root, "public/images/inici");
const MANIFEST = join(root, "src/data/hero-pieces.json");
const DEBUG_DIR = join(root, "_source/hero-debug");
const DEBUG = process.argv.includes("--debug");

const SOURCES = [
  { id: "a-arena", file: "EmpuriesA_TerracotaArena14CeramicaFerres.jpg" },
  { id: "b-arena", file: "EmpuriesB_TerracotaArena14CeramicaFerres.jpg" },
  { id: "b-rojo", file: "EmpuriesB_TerracotaRojo15CeramicaFerres.jpg" },
];
/** Mides de sortida (factor sobre l'original). */
const SCALES = [
  { suffix: "1x", factor: 0.5 },
  { suffix: "2x", factor: 1 },
];

/** Dilata o erosiona una màscara binària amb un quadrat de costat 2r+1 (per tancar forats petits). */
function morph(mask, width, height, r, grow) {
  const pass = (source, horizontal) => {
    const out = new Uint8Array(source.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let hit = grow ? 0 : 1;
        for (let d = -r; d <= r; d++) {
          const xx = horizontal ? x + d : x;
          const yy = horizontal ? y : y + d;
          const v = xx < 0 || yy < 0 || xx >= width || yy >= height ? 0 : source[yy * width + xx];
          if (grow ? v : !v) {
            hit = grow ? 1 : 0;
            break;
          }
        }
        out[y * width + x] = hit;
      }
    }
    return out;
  };
  return pass(pass(mask, true), false);
}

async function cut({ id, file }) {
  const { data, info } = await sharp(join(SOURCE_DIR, file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const n = width * height;

  // Cromaticitat relativa: la terracota en té (fins i tot a l'ombra); el fons blanc i les ombres, no.
  // Contorn net (un llindar, no una rampa): la rampa deixava blocs de la compressió JPEG.
  let solid = new Uint8Array(n);
  for (let p = 0; p < n; p++) {
    const r = data[p * 3];
    const g = data[p * 3 + 1];
    const b = data[p * 3 + 2];
    solid[p] = (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(1, (r + g + b) / 3) > 0.13 ? 1 : 0;
  }
  // Els reflexos de la tapa són gairebé blancs: es tanquen els forats petits de dins la peça (les
  // obertures de la gelosia són molt més grans). Després es treuen els punts solts.
  solid = morph(morph(solid, width, height, 3, true), width, height, 3, false);
  solid = morph(morph(solid, width, height, 1, false), width, height, 1, true);
  // Vora suau d'un píxel.
  const alpha = new Float32Array(n);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += solid[Math.min(height - 1, Math.max(0, y + dy)) * width + Math.min(width - 1, Math.max(0, x + dx))];
      alpha[y * width + x] = solid[y * width + x] ? 0.55 + (0.45 * sum) / 9 : (0.45 * sum) / 9;
    }
  }
  const interior = morph(solid, width, height, 1, false);

  // Mides de la peça (per alinear-les a terra i apilar-les).
  let x0 = width;
  let x1 = 0;
  let y0 = height;
  let y1 = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (alpha[y * width + x] < 0.5) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  const edge = (from, to) => {
    let top = height;
    let bottom = 0;
    for (let x = from; x <= to; x++) {
      for (let y = 0; y < height; y++) {
        if (alpha[y * width + x] < 0.5) continue;
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    return { x: (from + to) / 2, top, bottom };
  };
  const left = edge(x0, x0 + 10);
  const right = edge(x1 - 10, x1);

  // Ombra: com de fosc és el terra respecte del blanc del fons. Només a prop de la peça.
  const shadow = new Float32Array(n);
  const near = (x, y) => x > x0 - 170 && x < x1 + 30 && y > y0 + 80 && y < y1 + 60;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (!near(x, y) || alpha[p] > 0.999) continue;
      const lum = 0.2126 * data[p * 3] + 0.7152 * data[p * 3 + 1] + 0.0722 * data[p * 3 + 2];
      shadow[p] = Math.min(1, Math.max(0, (1 - lum / 255 - 0.012) / 0.988)) * (1 - alpha[p]);
    }
  }

  // Retall: la peça i la seva ombra, amb marge.
  let bx0 = x0;
  let bx1 = x1;
  let by0 = y0;
  let by1 = y1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (shadow[y * width + x] < 0.02) continue;
      bx0 = Math.min(bx0, x);
      bx1 = Math.max(bx1, x);
      by0 = Math.min(by0, y);
      by1 = Math.max(by1, y);
    }
  }
  const box = { x: Math.max(0, bx0 - 4), y: Math.max(0, by0 - 4) };
  box.w = Math.min(width, bx1 + 5) - box.x;
  box.h = Math.min(height, by1 + 5) - box.y;

  const piece = Buffer.alloc(box.w * box.h * 4);
  const shade = Buffer.alloc(box.w * box.h * 4);
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      const p = (box.y + y) * width + box.x + x;
      const o = (y * box.w + x) * 4;
      const a = alpha[p];
      if (a > 0.002) {
        // A la vora, el color de la peça de just al costat: el del píxel barreja el blanc del fons.
        let rgb = [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]];
        if (!interior[p]) {
          const sum = [0, 0, 0];
          let count = 0;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const xx = box.x + x + dx;
              const yy = box.y + y + dy;
              if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
              const q = yy * width + xx;
              if (!interior[q]) continue;
              for (let c = 0; c < 3; c++) sum[c] += data[q * 3 + c];
              count++;
            }
          }
          if (count) rgb = sum.map((v) => v / count);
        }
        for (let c = 0; c < 3; c++) piece[o + c] = Math.round(rgb[c]);
        piece[o + 3] = Math.round(a * 255);
      }
      shade[o + 3] = Math.round(shadow[p] * 255);
    }
  }

  for (const [layer, buffer] of [
    ["", piece],
    ["-ombra", shade],
  ]) {
    // L'ombra es suavitza una mica: la compressió JPEG de l'original hi deixa blocs.
    const raw = sharp(buffer, { raw: { width: box.w, height: box.h, channels: 4 } });
    const image = layer ? sharp(await raw.blur(1.6).png().toBuffer()) : raw;
    for (const { suffix, factor } of SCALES) {
      await image
        .clone()
        .resize(Math.round(box.w * factor), Math.round(box.h * factor))
        .webp({ quality: 84, alphaQuality: 90, effort: 6 })
        .toFile(join(OUT_DIR, `${id}${layer}-${suffix}.webp`));
    }
  }

  if (DEBUG) {
    const bg = { r: 236, g: 231, b: 225, alpha: 1 };
    const pieceImg = await sharp(piece, { raw: { width: box.w, height: box.h, channels: 4 } }).png().toBuffer();
    const shadeImg = await sharp(shade, { raw: { width: box.w, height: box.h, channels: 4 } }).png().toBuffer();
    await sharp({ create: { width: box.w, height: box.h, channels: 4, background: bg } })
      .composite([{ input: shadeImg }, { input: pieceImg }])
      .png()
      .toFile(join(DEBUG_DIR, `${id}.png`));
  }

  // Punts de referència, relatius al retall: on toca a terra i on comença la tapa, a cada costat.
  const point = (x, y) => [Math.round(x - box.x), Math.round(y - box.y)];
  return {
    id,
    w: box.w,
    h: box.h,
    footLeft: point(left.x, left.bottom),
    footRight: point(right.x, right.bottom),
    capLeft: point(left.x, left.top),
    capRight: point(right.x, right.top),
  };
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });
if (DEBUG) await mkdir(DEBUG_DIR, { recursive: true });
const sources = {};
for (const source of SOURCES) {
  const { id, ...metrics } = await cut(source);
  sources[id] = metrics;
}
await writeFile(MANIFEST, `${JSON.stringify({ sources }, null, 2)}\n`);
console.log(`Fet: ${SOURCES.length} peces (amb ombra) a ${OUT_DIR}`);
console.log(JSON.stringify(sources));
