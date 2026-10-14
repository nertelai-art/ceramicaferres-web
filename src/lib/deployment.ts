import { site } from "@/data/site";

/**
 * On està publicat aquest desplegament i si els cercadors el poden indexar. Mentre el web no sigui
 * al domini del client és una proposta: no s'indexa, o competiria amb la seva web de debò.
 *
 * - `SITE_URL`: adreça pública, si es vol fixar a mà.
 * - `VERCEL_PROJECT_PRODUCTION_URL`: la posa Vercel sola a cada build.
 * - `SITE_INDEXABLE=true`: permet indexar. Només quan el web ja sigui al seu domini.
 */
type Env = Readonly<Record<string, string | undefined>>;

export function deploymentUrl(env: Env = process.env) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return site.url;
}

export const isIndexable = (env: Env = process.env) => env.SITE_INDEXABLE === "true";
