import { formatNumber, type Locale } from "@/i18n/config";
import type { TextValueKey, Value } from "@/data/materials";

/** Textos que calen per escriure un valor (surten del diccionari de cada idioma). */
export interface ValueLabels {
  values: Record<TextValueKey, string>;
  qualifiers: { average: string; above: string };
  slipClass: string;
  missing: string;
}

const NBSP = " ";
const decimals = (n: number) => (Number.isInteger(n) ? 0 : (String(n).split(".")[1]?.length ?? 0));
const num = (locale: Locale, n: number) => formatNumber(locale, n, decimals(n));

/** En anglès el percentatge va enganxat; en català, castellà i francès, amb espai fi. */
function withUnit(locale: Locale, amount: string, unit: string) {
  if (unit === "%") return locale === "en" ? `${amount}%` : `${amount}${NBSP}%`;
  if (unit === "Mohs") return `${amount} Mohs`;
  return `${amount}${NBSP}${unit}`;
}

/** Valor llegible d'una propietat, amb el format numèric de cada idioma. */
export function formatValue(value: Value, locale: Locale, labels: ValueLabels): string {
  switch (value.kind) {
    case "missing":
      return labels.missing;
    case "code":
      return value.value;
    case "text":
      return labels.values[value.key];
    case "number": {
      if (value.unit === "Rd") return `Rd ${num(locale, value.value)} · ${labels.slipClass}`;
      const amount = value.max === undefined ? num(locale, value.value) : `${num(locale, value.value)}–${num(locale, value.max)}`;
      const text = withUnit(locale, amount, value.unit);
      if (value.qualifier === "above") return `${labels.qualifiers.above} ${text}`;
      if (value.qualifier === "average") return `${text} (${labels.qualifiers.average})`;
      return text;
    }
  }
}

/** Tram de la barra (0–1) per a un valor numèric dins de la seva escala; `null` si no n'hi ha. */
export function barSpan(value: Value, scale: number | undefined): { from: number; to: number } | null {
  if (value.kind !== "number" || !scale) return null;
  const clamp = (n: number) => Math.min(1, Math.max(0, n / scale));
  return value.max === undefined ? { from: 0, to: clamp(value.value) } : { from: clamp(value.value), to: clamp(value.max) };
}
