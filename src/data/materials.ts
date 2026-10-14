/**
 * Propietats dels materials de Ferrés, copiades de les seves fitxes tècniques (descarregades de
 * ceramicaferres.com el 14-10-2026). Res d'aquí és un valor «típic» del sector: si la fitxa no
 * el dona, el valor és `missing` i la web ho diu.
 *
 * - Fitxa Volta (terracota Rojo 15 i Arena 14, i peça vidriada): ceramicaferres.com/download/20641/
 * - Fitxa Gres Natural («Gres Girona»): ceramicaferres.com/download/14433/
 * - Dossier de sostenibilitat (origen de les argiles): ceramicaferres.com/download/12010/
 */

export const MATERIAL_KEYS = ["rojo15", "arena14", "gres", "vidriat"] as const;
export type MaterialKey = (typeof MATERIAL_KEYS)[number];

export const PROPERTY_KEYS = [
  "absorption",
  "flexural",
  "hardness",
  "abrasion",
  "frost",
  "expansion",
  "chemical",
  "slip",
  "firing",
  "fire",
  "origin",
] as const;
export type PropertyKey = (typeof PROPERTY_KEYS)[number];

/** Textos que depenen de l'idioma (es tradueixen al diccionari, a `anatomy.values`). */
export type TextValueKey =
  | "resists"
  | "noDefects"
  | "complies"
  | "frostGlazed"
  | "chemicalGres"
  | "singleFiring"
  | "origin.bisbal"
  | "origin.teruel";

export type Value =
  | { kind: "number"; value: number; max?: number; unit: Unit; qualifier?: "average" | "above" }
  | { kind: "code"; value: string }
  | { kind: "text"; key: TextValueKey }
  | { kind: "missing" };

export type Unit = "%" | "N/mm²" | "Mohs" | "mm³" | "×10⁻⁶/°C" | "°C" | "Rd";

export type SourceKey = "volta" | "gres" | "sustainability" | "ara";

export const SOURCES: Record<SourceKey, { title: string; url: string }> = {
  volta: { title: "Fitxa tècnica Volta · Ceràmica Ferrés", url: "https://ceramicaferres.com/download/20641/" },
  gres: { title: "Fitxa tècnica Gres Natural · Ceràmica Ferrés", url: "https://ceramicaferres.com/download/14433/" },
  sustainability: { title: "Sostenibilitat · Ceràmica Ferrés", url: "https://ceramicaferres.com/download/12010/" },
  // Entrevista a la direcció: «dos forns continus a 1.024 °C durant 22 hores».
  ara: { title: "Ara, 2024 · «El ressorgiment de la rajola de la Bisbal»", url: "https://es.ara.cat/girona/resurgimiento-ladrillo-bisbal-emporda_130_5193745.html" },
};

/** Norma de l'assaig, tal com surt a la fitxa. */
export const STANDARDS: Partial<Record<MaterialKey, Partial<Record<PropertyKey, string>>>> = {
  rojo15: {
    absorption: "UNE-EN ISO 10545-3",
    frost: "UNE-EN ISO 10545-12",
    chemical: "UNE-EN ISO 10545-13",
    abrasion: "UNE-EN ISO 10545-7",
  },
  arena14: { absorption: "UNE-EN ISO 10545-3", expansion: "UNE-EN ISO 10545-8" },
  gres: {
    absorption: "UNE 67099 (EN 99)",
    frost: "UNE 67202 (EN 202)",
    flexural: "UNE 67100 (EN 100)",
    hardness: "UNE 67101 (EN 101)",
    chemical: "UNE 67106 (EN 106)",
    abrasion: "UNE 67102 (EN 102)",
    expansion: "UNE 67103 (EN 103)",
    slip: "UNE-ENV 12633",
  },
  vidriat: {
    absorption: "UNE-EN ISO 10545-3",
    frost: "UNE-EN ISO 10545-12",
    chemical: "UNE-EN ISO 10545-13",
    abrasion: "UNE-EN ISO 10545-7",
    expansion: "UNE-EN ISO 10545-8",
  },
};

/**
 * Escala de les barres: on és el màxim de cada propietat numèrica. Per a l'absorció, menys és més
 * dens; la barra només compara materials, no diu què és bo.
 */
export const SCALES: Partial<Record<PropertyKey, number>> = {
  absorption: 15,
  flexural: 60,
  hardness: 10,
  expansion: 10,
};

export interface Material {
  /** Mostra real de l'acabat (carta d'acabats de Ferrés). */
  swatch: string;
  /** El material porta capa d'esmalt? */
  glazed: boolean;
  sources: SourceKey[];
  values: Record<PropertyKey, Value>;
}

const missing = { kind: "missing" } as const;
const A1 = { kind: "code", value: "A1" } as const;

export const MATERIALS: Record<MaterialKey, Material> = {
  rojo15: {
    swatch: "/esmalts/rojo-15.webp",
    glazed: false,
    sources: ["volta", "sustainability", "ara"],
    values: {
      absorption: { kind: "number", value: 10, max: 13, unit: "%" },
      flexural: missing,
      hardness: missing,
      abrasion: { kind: "text", key: "complies" },
      frost: { kind: "text", key: "resists" },
      expansion: missing,
      chemical: { kind: "code", value: "UA · ULA · UHA" },
      slip: missing,
      firing: { kind: "number", value: 1024, unit: "°C" },
      fire: A1,
      origin: { kind: "text", key: "origin.bisbal" },
    },
  },
  arena14: {
    swatch: "/esmalts/arena-14.webp",
    glazed: false,
    sources: ["volta", "sustainability", "ara"],
    values: {
      absorption: { kind: "number", value: 14.03, unit: "%" },
      flexural: missing,
      hardness: missing,
      abrasion: missing,
      frost: { kind: "text", key: "noDefects" },
      expansion: { kind: "number", value: 5.2, max: 5.9, unit: "×10⁻⁶/°C" },
      chemical: missing,
      slip: missing,
      firing: { kind: "number", value: 1024, unit: "°C" },
      fire: A1,
      origin: { kind: "text", key: "origin.teruel" },
    },
  },
  gres: {
    swatch: "/esmalts/gres-natural.webp",
    glazed: false,
    sources: ["gres"],
    values: {
      absorption: { kind: "number", value: 3.1, unit: "%", qualifier: "average" },
      flexural: { kind: "number", value: 52.4, unit: "N/mm²" },
      hardness: { kind: "number", value: 7, unit: "Mohs" },
      abrasion: { kind: "number", value: 334, unit: "mm³" },
      frost: { kind: "text", key: "resists" },
      // A la fitxa surt «5,6 x 10,6»: és 5,6 × 10⁻⁶/°C amb l'exponent perdut en maquetar-la.
      expansion: { kind: "number", value: 5.6, unit: "×10⁻⁶/°C" },
      chemical: { kind: "text", key: "chemicalGres" },
      slip: { kind: "number", value: 60, unit: "Rd" },
      firing: { kind: "number", value: 1300, unit: "°C", qualifier: "above" },
      fire: A1,
      origin: missing,
    },
  },
  vidriat: {
    swatch: "/esmalts/azul-43.webp",
    glazed: true,
    sources: ["volta"],
    values: {
      absorption: { kind: "number", value: 13, unit: "%", qualifier: "average" },
      flexural: missing,
      hardness: missing,
      abrasion: { kind: "code", value: "PEI 1–2" },
      frost: { kind: "text", key: "frostGlazed" },
      expansion: { kind: "number", value: 6, unit: "×10⁻⁶/°C" },
      chemical: { kind: "code", value: "GA · GLA · GHA" },
      slip: missing,
      firing: { kind: "number", value: 1000, unit: "°C", qualifier: "above" },
      fire: A1,
      origin: missing,
    },
  },
};

/**
 * Esmalts de la carta real de Ferrés (mostres d'una sola tinta). `code` és el codi del client i no es
 * tradueix: les fitxes en català també diuen «Terracota - Rojo 15».
 */
export const GLAZES = [
  { code: "Azul 43", file: "azul-43", hex: "#1f2c6b" },
  { code: "Azul 62", file: "azul-62", hex: "#8fa5b5" },
  { code: "Azul 64", file: "azul-64", hex: "#3c5a95" },
  { code: "Amarillo 50", file: "amarillo-50", hex: "#efcd76" },
  { code: "Amarillo 52", file: "amarillo-52", hex: "#e8b42c" },
  { code: "Verde 28", file: "verde-28", hex: "#b8cf95" },
  { code: "Verde 31", file: "verde-31", hex: "#56803c" },
  { code: "Blanco 23", file: "blanco-23", hex: "#f3f1ee" },
  { code: "Beig 85", file: "beig-85", hex: "#e3c7a2" },
  { code: "Paja 10", file: "paja-10", hex: "#f2e9c9" },
  { code: "Gris 12", file: "gris-12", hex: "#c9c8cc" },
  { code: "Tabaco 16", file: "tabaco-16", hex: "#b4713a" },
  { code: "Rojo 24", file: "rojo-24", hex: "#a8431a" },
  { code: "Rojo 92", file: "rojo-92", hex: "#c8141b" },
  { code: "Marrón 95", file: "marron-95", hex: "#4c1d12" },
  { code: "Negro 13", file: "negro-13", hex: "#151515" },
] as const;
export type GlazeFile = (typeof GLAZES)[number]["file"];

/** Segons la fitxa, els esmalts marró i vermell fissuren després de 100 cicles de gelada. */
export const FROST_SENSITIVE: readonly GlazeFile[] = ["rojo-24", "rojo-92", "marron-95"];
