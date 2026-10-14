import { isLocale, LOCALES, type Locale } from "@/i18n/config";

/**
 * Adreces del web. Cada col·lecció té el nom que fa servir el client a cada idioma
 * (a la seva web: «gelosies» en català, «sunbreaks» en anglès).
 */
export const COLLECTION_KEYS = ["gelosies", "rajoles", "lavabos", "elements"] as const;
export type CollectionKey = (typeof COLLECTION_KEYS)[number];

export const COLLECTION_SLUGS: Record<CollectionKey, Record<Locale, string>> = {
  gelosies: { ca: "gelosies", es: "celosias", en: "sunbreaks", fr: "claustras" },
  rajoles: { ca: "rajoles", es: "baldosas", en: "tiles", fr: "carreaux" },
  lavabos: { ca: "lavabos", es: "lavabos", en: "washbasins", fr: "lavabos" },
  elements: { ca: "elements-constructius", es: "elementos-constructivos", en: "construction-elements", fr: "elements-de-construction" },
};

/** Ancoratges de la pàgina d'inici (iguals a tots els idiomes: no surten a la vista). */
export const SECTION_IDS = {
  collections: "colleccions",
  process: "proces",
  workshop: "taller",
  material: "material",
  projects: "projectes",
  custom: "a-mida",
  contact: "contacte",
} as const;

export const homePath = (locale: Locale) => `/${locale}`;
export const sectionPath = (locale: Locale, section: keyof typeof SECTION_IDS) => `/${locale}#${SECTION_IDS[section]}`;
export const collectionPath = (locale: Locale, key: CollectionKey) => `/${locale}/${COLLECTION_SLUGS[key][locale]}`;

export function collectionFromSlug(locale: Locale, slug: string): CollectionKey | undefined {
  return COLLECTION_KEYS.find((key) => COLLECTION_SLUGS[key][locale] === slug);
}

/** La mateixa pàgina en un altre idioma. Si el camí no es reconeix, porta a l'inici. */
export function translatePath(pathname: string, to: Locale): string {
  const [, from = "", slug] = pathname.split("/");
  if (!isLocale(from)) return homePath(to);
  if (!slug) return homePath(to);
  const key = collectionFromSlug(from, slug);
  return key ? collectionPath(to, key) : homePath(to);
}

export const allPaths = () => LOCALES.flatMap((locale) => [homePath(locale), ...COLLECTION_KEYS.map((key) => collectionPath(locale, key))]);
