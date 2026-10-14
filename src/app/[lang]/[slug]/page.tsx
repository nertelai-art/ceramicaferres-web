import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionView } from "@/components/pages/CollectionView";
import { MaterialsView } from "@/components/pages/MaterialsView";
import { FALLBACK_LOCALE, isLocale, LOCALE_INFO, LOCALES } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageFromSlug, slugPagePath, slugParams } from "@/lib/routes";

/** /[lang]/[slug]: una col·lecció (gelosies, rajoles…) o la pàgina de materials, amb el nom de cada idioma. */
export const dynamicParams = false;
export const generateStaticParams = () => slugParams();

function resolve(lang: string, slug: string) {
  if (!isLocale(lang)) return null;
  const page = pageFromSlug(lang, slug);
  return page ? { locale: lang, page } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const found = resolve(lang, slug);
  if (!found) return {};
  const t = getDictionary(found.locale);
  const page = found.page;
  const { title, description, image } =
    page.kind === "materials"
      ? { title: t.materialsPage.metaTitle, description: t.materialsPage.metaDescription, image: "/og.jpg" }
      : { title: t.collections.items[page.key].name, description: t.collections.items[page.key].intro, image: `/images/colleccions/${page.key}-1080.webp` };
  return {
    title,
    description,
    alternates: {
      canonical: slugPagePath(found.locale, page),
      languages: {
        ...Object.fromEntries(LOCALES.map((locale) => [LOCALE_INFO[locale].intl, slugPagePath(locale, page)])),
        "x-default": slugPagePath(FALLBACK_LOCALE, page),
      },
    },
    openGraph: { title, description, images: [{ url: image }] },
  };
}

export default async function SlugPage({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang, slug } = await params;
  const found = resolve(lang, slug);
  if (!found) notFound();
  const t = getDictionary(found.locale);
  return found.page.kind === "materials" ? (
    <MaterialsView locale={found.locale} t={t} />
  ) : (
    <CollectionView locale={found.locale} collectionKey={found.page.key} t={t} />
  );
}
