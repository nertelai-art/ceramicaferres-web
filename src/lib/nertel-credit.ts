import type { Locale } from "@/i18n/config";

/**
 * D'on ve la visita, per a l'analítica de nertel.ai. El mateix format a totes les webs de clients:
 * el host on serveix el web, sense `www.` ni protocol. Mentre no sigui al domini del client és el de
 * Vercel; **quan passi a ceramicaferres.com, canvia'l a `ceramicaferres.com`** (i la prova).
 */
const SOURCE = "ceramicaferres-web.vercel.app";

/** nertel.ai té ca, es, en, fr, it i de: els quatre idiomes del web hi són, així que es porta al mateix. */
export function nertelCreditUrl(locale: Locale) {
  return `https://nertel.ai/${locale}?utm_source=${SOURCE}&utm_medium=credit`;
}
