import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FALLBACK_LOCALE, fill, isLocale, LOCALE_INFO, LOCALES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { productsIn } from "@/data/products";
import { COLLECTION_KEYS, collectionFromSlug, collectionPath, COLLECTION_SLUGS, sectionPath } from "@/lib/routes";

export const dynamicParams = false;
export const generateStaticParams = () =>
  LOCALES.flatMap((lang) => COLLECTION_KEYS.map((key) => ({ lang, collection: COLLECTION_SLUGS[key][lang] })));

/** Pàgina de catàleg actual de Ferrés per a les descàrregues (fitxes i CAD). */
const CURRENT_SITE: Record<Locale, string> = {
  ca: "https://ceramicaferres.com/ca/productes/",
  es: "https://ceramicaferres.com/productos/",
  en: "https://ceramicaferres.com/en/products/",
  fr: "https://ceramicaferres.com/en/products/",
};

function resolve(lang: string, slug: string) {
  if (!isLocale(lang)) return null;
  const key = collectionFromSlug(lang, slug);
  return key ? { locale: lang, key } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[collection]">): Promise<Metadata> {
  const { lang, collection } = await params;
  const found = resolve(lang, collection);
  if (!found) return {};
  const item = getDictionary(found.locale).collections.items[found.key];
  return {
    title: item.name,
    description: item.intro,
    alternates: {
      canonical: collectionPath(found.locale, found.key),
      languages: {
        ...Object.fromEntries(LOCALES.map((locale) => [LOCALE_INFO[locale].intl, collectionPath(locale, found.key)])),
        "x-default": collectionPath(FALLBACK_LOCALE, found.key),
      },
    },
    openGraph: { title: item.name, description: item.intro, images: [{ url: `/images/colleccions/${found.key}-1080.webp` }] },
  };
}

export default async function CollectionPage({ params }: PageProps<"/[lang]/[collection]">) {
  const { lang, collection } = await params;
  const found = resolve(lang, collection);
  if (!found) notFound();
  const { locale, key } = found;
  const t = getDictionary(locale);
  const p = t.collectionPage;
  const item = t.collections.items[key];
  const products = productsIn(key);

  return (
    <>
      <section aria-labelledby="colleccio-titol" className="relative overflow-hidden bg-forn pb-16 pt-[calc(var(--header-h)+3rem)]">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <Link href={sectionPath(locale, "collections")} className="text-sm text-calc/60 hover:text-argila">
              ← {p.back}
            </Link>
            <p className="eyebrow mt-8 text-argila">{fill(p.count, { count: products.length })}</p>
            <h1 id="colleccio-titol" className="display mt-4 text-[clamp(3rem,8vw,7.5rem)]">
              {item.name}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-calc/80">{item.intro}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={`/images/colleccions/${key}.webp`} alt={item.coverAlt} fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section aria-label={item.name} className="on-light bg-calc py-16 text-carbo sm:py-24">
        <ul className="container-x grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <li key={product.slug} className="reveal" style={{ "--i": i % 3 } as React.CSSProperties}>
              <article aria-labelledby={`model-${product.slug}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-calc-2">
                  <Image src={product.image} alt={product.name[locale]} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" className="object-cover" />
                </div>
                <h2 id={`model-${product.slug}`} className="display mt-5 text-3xl">
                  {product.name[locale]}
                </h2>
                {product.designer && (
                  <p className="mt-1 text-sm text-terra">
                    {p.designer}: {product.designer}
                  </p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-carbo/75">{product.description[locale]}</p>
                <dl className="mt-4 grid gap-3 border-t border-carbo/10 pt-4 text-sm">
                  <div>
                    <dt className="eyebrow text-carbo/50">{p.formats}</dt>
                    <dd className="num mt-1">{product.formats.length ? product.formats.join(" · ") : p.noFormats}</dd>
                  </div>
                  {product.finishes.length > 0 && (
                    <div>
                      <dt className="eyebrow text-carbo/50">{p.finishes}</dt>
                      <dd className="mt-1">
                        {/* Si només en quedaria un d'amagat, es mostra: «+1 acabats» no diu res. */}
                        {product.finishes.slice(0, product.finishes.length === 5 ? 5 : 4).join(" · ")}
                        {product.finishes.length > 5 && <span className="text-carbo/55"> {fill(p.finishesMore, { count: product.finishes.length - 4 })}</span>}
                      </dd>
                    </div>
                  )}
                </dl>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label={p.cta} className="bg-terra py-16 text-calc">
        <div className="container-x flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="display text-4xl">{p.cta}</p>
            <p className="mt-3 text-sm text-calc/80">
              {p.sheetNote}{" "}
              <a className="font-semibold underline underline-offset-4" href={CURRENT_SITE[locale]} rel="noopener">
                {p.sheet} ↗
              </a>
            </p>
          </div>
          <a href={sectionPath(locale, "contact")} className="btn bg-calc text-terra hover:bg-forn hover:text-calc">
            {t.nav.cta} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <nav aria-label={p.otherCollections} className="bg-forn py-16">
        <div className="container-x">
          <p className="eyebrow text-fang">{p.otherCollections}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {COLLECTION_KEYS.filter((other) => other !== key).map((other) => (
              <li key={other}>
                <Link href={collectionPath(locale, other)} className="group flex items-center justify-between rounded-xl border border-calc/15 p-5 transition-colors hover:border-argila">
                  <span className="display text-2xl">{t.collections.items[other].name}</span>
                  <span aria-hidden="true" className="text-argila transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
