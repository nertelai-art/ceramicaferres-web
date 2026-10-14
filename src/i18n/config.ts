export const LOCALES = ["ca", "es", "en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

/** Idioma per a qui no en demana cap dels quatre: el que més arquitectes estrangers entenen. */
export const FALLBACK_LOCALE: Locale = "en";

interface LocaleInfo {
  /** Etiqueta curta del selector. */
  label: string;
  /** Nom de l'idioma, en aquell idioma. */
  name: string;
  /** Per a `Intl`, `og:locale` i `hreflang`. */
  intl: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  ca: { label: "CA", name: "Català", intl: "ca-ES" },
  es: { label: "ES", name: "Español", intl: "es-ES" },
  en: { label: "EN", name: "English", intl: "en-GB" },
  fr: { label: "FR", name: "Français", intl: "fr-FR" },
};

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

/** Tria l'idioma a partir de la capçalera `Accept-Language`, respectant-ne les preferències (`q`). */
export function pickLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return FALLBACK_LOCALE;
  const wanted = acceptLanguage
    .split(",")
    .map((part, order) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return { lang: tag.toLowerCase().split("-")[0] ?? "", weight: Number.isFinite(weight) ? weight : 0, order };
    })
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.order - b.order);
  for (const { lang } of wanted) if (isLocale(lang)) return lang;
  return FALLBACK_LOCALE;
}

/** Substitueix `{clau}` dins d'una plantilla de text. */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

/** Format de xifres segons l'idioma (separador decimal i de milers). */
export const formatNumber = (locale: Locale, value: number, digits = 0) =>
  new Intl.NumberFormat(LOCALE_INFO[locale].intl, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
