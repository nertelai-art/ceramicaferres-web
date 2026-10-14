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

/** Pàgina de detall dels materials (l'anatomia interactiva i la comparativa). */
export const MATERIALS_SLUGS: Record<Locale, string> = { ca: "materials", es: "materiales", en: "materials", fr: "materiaux" };

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

export const materialsPath = (locale: Locale) => `/${locale}/${MATERIALS_SLUGS[locale]}`;

export function collectionFromSlug(locale: Locale, slug: string): CollectionKey | undefined {
  return COLLECTION_KEYS.find((key) => COLLECTION_SLUGS[key][locale] === slug);
}

export type SlugPage = { kind: "collection"; key: CollectionKey } | { kind: "materials" };

/** Quina pàgina és `/{locale}/{slug}`: una col·lecció, la de materials o cap. */
export function pageFromSlug(locale: Locale, slug: string): SlugPage | undefined {
  if (MATERIALS_SLUGS[locale] === slug) return { kind: "materials" };
  const key = collectionFromSlug(locale, slug);
  return key ? { kind: "collection", key } : undefined;
}

export const slugPagePath = (locale: Locale, page: SlugPage) =>
  page.kind === "materials" ? materialsPath(locale) : collectionPath(locale, page.key);

/** La mateixa pàgina en un altre idioma. Si el camí no es reconeix, porta a l'inici. */
export function translatePath(pathname: string, to: Locale): string {
  const [, from = "", slug] = pathname.split("/");
  if (!isLocale(from)) return homePath(to);
  if (!slug) return homePath(to);
  const page = pageFromSlug(from, slug);
  return page ? slugPagePath(to, page) : homePath(to);
}

/** Tots els `{ lang, slug }` que es generen en estàtic sota /[lang]/[slug]. */
export const slugParams = () =>
  LOCALES.flatMap((lang) => [...COLLECTION_KEYS.map((key) => ({ lang, slug: COLLECTION_SLUGS[key][lang] })), { lang, slug: MATERIALS_SLUGS[lang] }]);

export const allPaths = () =>
  LOCALES.flatMap((locale) => [homePath(locale), ...COLLECTION_KEYS.map((key) => collectionPath(locale, key)), materialsPath(locale)]);
