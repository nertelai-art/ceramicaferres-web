import { describe, expect, it } from "vitest";
import { ca } from "./ca";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";

const translations = { es, en, fr };
type Translated = keyof typeof translations;

type Leaf = [path: string, text: string];

/** Totes les cadenes d'un diccionari amb el camí on són (`hero.title`, `intro.stats.1.label`). */
function leaves(node: unknown, path: string[] = []): Leaf[] {
  if (typeof node === "string") return [[path.join("."), node]];
  if (node !== null && typeof node === "object")
    return Object.entries(node).flatMap(([key, child]) => leaves(child, [...path, key]));
  throw new Error(`Valor que no és text a ${path.join(".")}: ${String(node)}`);
}

/** L'esquelet: les mateixes claus i la mateixa llargada de les llistes, sense els textos. */
function shape(node: unknown): unknown {
  if (typeof node === "string") return "text";
  if (Array.isArray(node)) return node.map(shape);
  if (node !== null && typeof node === "object")
    return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, shape(child)]));
  return typeof node;
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

/**
 * Textos que poden quedar igual que en català. Els noms propis, les xifres i els codis valen per a
 * qualsevol idioma; la resta són paraules que en aquell idioma s'escriuen igual. Una entrada que ja no
 * fa servir ningú fa fallar la prova, perquè la llista no creixi de rebot.
 */
const SAME_IN_ANY_LOCALE = [
  "1956",
  "100%",
  "150",
  "A1",
  "−20%",
  "−17%",
  "10%",
  "Garbet",
  "Terracota Rojo 15",
  "Terracota Arena 14",
  "la Bisbal",
  "© {year} Ceràmica Ferrés",
];
const SAME_IN_LOCALE: Record<Translated, string[]> = {
  es: ["Menú", "Idioma", "Material", "Empresa familiar", "Lavabos", "El taller", "Gres", "Arquitectura", "opcional"],
  en: ["Material"],
  fr: ["Formats", "Nom"],
};

const catalan = new Map(leaves(ca));

describe.each(Object.keys(translations) as Translated[])("diccionari %s", (locale) => {
  const dictionary = translations[locale];
  const texts = leaves(dictionary);

  it("té les mateixes claus i llistes que el català", () => {
    expect(shape(dictionary)).toStrictEqual(shape(ca));
  });

  it("no té cap text buit", () => {
    for (const [path, text] of texts) expect(text.trim(), path).not.toBe("");
  });

  it("conserva els marcadors {…} de cada text", () => {
    for (const [path, text] of texts) expect(placeholders(text), path).toEqual(placeholders(catalan.get(path) ?? ""));
  });

  it("no deixa textos en català, llevat de noms propis, xifres i codis", () => {
    const allowed = new Set([...SAME_IN_ANY_LOCALE, ...SAME_IN_LOCALE[locale]]);
    const untranslated = texts.filter(([path, text]) => text === catalan.get(path) && !allowed.has(text));
    expect(untranslated).toEqual([]);
  });

  it("no té entrades sobreres a la llista de textos iguals", () => {
    const same = new Set(texts.filter(([path, text]) => text === catalan.get(path)).map(([, text]) => text));
    expect(SAME_IN_LOCALE[locale].filter((text) => !same.has(text))).toEqual([]);
  });

  it("no s'hi escola l'ela geminada", () => {
    for (const [path, text] of texts) expect(text, path).not.toMatch(/l·l/i);
  });

  it("la meta descripció cap en un resultat de cerca (160 caràcters)", () => {
    expect([...dictionary.meta.description].length).toBeLessThanOrEqual(160);
  });
});

it("cada text que pot quedar igual en tots els idiomes es fa servir en algun", () => {
  const same = new Set(
    (Object.keys(translations) as Translated[]).flatMap((locale) =>
      leaves(translations[locale])
        .filter(([path, text]) => text === catalan.get(path))
        .map(([, text]) => text),
    ),
  );
  expect(SAME_IN_ANY_LOCALE.filter((text) => !same.has(text))).toEqual([]);
});

it("el francès porta espais no separables davant de la puntuació alta, dins les cometes i als milers", () => {
  for (const [path, text] of leaves(fr)) expect(text, path).not.toMatch(/ [:;!?»%]|« |\d \d{3}(?!\d)/);
});
