// Prepara les imatges del web a partir del material del client (_source/, fora del repositori).
// Cada foto surt en tres amplades WebP (640, 1080, 1600) perquè no cal l'optimitzador de Next:
// el loader (src/lib/image-loader.ts) demana el fitxer que toca. També fa les mostres d'esmalt i
// la imatge per a xarxes socials. Es pot tornar a executar: sobreescriu el que ja hi ha.
import { mkdir, readFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const WIDTHS = [640, 1080, 1600];
const manifests = ["scripts/images.main.json", "scripts/images.products.json"];

const exists = (path) => access(path).then(() => true, () => false);

async function photo({ out, src }) {
  const input = join(root, src);
  if (!(await exists(input))) return console.warn(`  falta ${src}`);
  for (const width of WIDTHS) {
    const target = join(root, "public/images", `${out}-${width}.webp`);
    await mkdir(dirname(target), { recursive: true });
    await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(target);
  }
}

// Mostres de la carta d'acabats: quadrades, petites, una sola mida.
const SWATCHES = {
  "rojo-15": "Rojo15_terracota_ceramicaferres.jpg",
  "arena-14": "Arena14_terracota_ceramicaferres.jpg",
  "gres-natural": "19_gres_natural_ceramica_ferres_G.jpg",
  "azul-43": "Azul43_vidriado_ceramicaferres.jpg",
  "azul-62": "Azul62_vidriado_ceramicaferres.jpg",
  "azul-64": "Azul64_vidriado_ceramicaferres.jpg",
  "amarillo-50": "Amarillo50_vidriado_ceramicaferres.jpg",
  "amarillo-52": "Amarillo52_vidriado_ceramicaferres.jpg",
  "verde-28": "Verde28_vidriado_ceramicaferres.jpg",
  "verde-31": "Verde31_vidriado_ceramicaferres.jpg",
  "blanco-23": "Blanco23_esmaltado_ceramicaferres.jpg",
  "beig-85": "Beig85_vidriado_ceramicaferres.jpg",
  "paja-10": "Paja10_vidriado_ceramicaferres.jpg",
  "gris-12": "Gris12_vidriado_ceramicaferres.jpg",
  "tabaco-16": "Tabaco16_vidriado_ceramicaferres.jpg",
  "rojo-24": "Rojo24_vidriado_ceramicaferres.jpg",
  "rojo-92": "Rojo92_vidriado_ceramicaferres.jpg",
  "marron-95": "Marron95_vidriado_ceramicaferres.jpg",
  "negro-13": "Negro13_vidriado_ceramicaferres.jpg",
};

async function swatch(name, file) {
  const input = join(root, "_source/web/acabados", file);
  if (!(await exists(input))) return console.warn(`  falta la mostra ${file}`);
  const target = join(root, "public/esmalts", `${name}.webp`);
  await mkdir(dirname(target), { recursive: true });
  // Es retalla la part de dalt de la mostra, on hi ha menys reflex.
  const meta = await sharp(input).metadata();
  const side = Math.min(meta.width, meta.height);
  await sharp(input).extract({ left: 0, top: Math.max(0, meta.height - side), width: side, height: side }).resize(420, 420).webp({ quality: 80 }).toFile(target);
}

async function socialImage() {
  const poster = join(root, "public/video/inici-extrusio.webp");
  if (!(await exists(poster))) return console.warn("  falta el pòster del vídeo d'inici per a og.jpg");
  const logo = (await readFile(join(root, "public/brand/logo-ferres.svg"), "utf8")).replace(/currentColor/g, "#f1eeea");
  const logoPng = await sharp(Buffer.from(logo)).resize({ width: 420 }).png().toBuffer();
  const shade = Buffer.from(
    `<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="#16120f" stop-opacity="0"/><stop offset="1" stop-color="#16120f" stop-opacity="0.92"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`,
  );
  await sharp(poster)
    .resize(1200, 630, { fit: "cover", position: "left" })
    .composite([{ input: shade }, { input: logoPng, left: 64, top: 470 }])
    .jpeg({ quality: 84 })
    .toFile(join(root, "public/og.jpg"));
}

let count = 0;
for (const manifest of manifests) {
  const path = join(root, manifest);
  if (!(await exists(path))) {
    console.warn(`(sense ${manifest})`);
    continue;
  }
  const entries = JSON.parse(await readFile(path, "utf8"));
  console.log(`${manifest}: ${entries.length} imatges`);
  for (const entry of entries) {
    await photo(entry);
    count++;
  }
}
for (const [name, file] of Object.entries(SWATCHES)) await swatch(name, file);
await socialImage();
console.log(`Fet: ${count} fotos × ${WIDTHS.length} amplades, ${Object.keys(SWATCHES).length} mostres i og.jpg.`);
