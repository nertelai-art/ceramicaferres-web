import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/layout/JsonLd";
import { RevealObserver } from "@/components/layout/RevealObserver";
import { FALLBACK_LOCALE, isLocale, LOCALE_INFO, LOCALES } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { deploymentUrl, isIndexable } from "@/lib/deployment";
import "../globals.css";

// Titulars: Bricolage pesada i estreta (rima amb les lletres tallades del logotip).
const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], axes: ["opsz", "wdth"], variable: "--font-bricolage", display: "swap" });
// Text: Figtree, l'alternativa oberta més propera a Avenir, la lletra de la seva web.
const sans = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-figtree", display: "swap" });

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));
export const viewport: Viewport = { themeColor: "#16120f", colorScheme: "dark" };

export async function generateMetadata({ params }: Pick<LayoutProps<"/[lang]">, "params">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const indexable = isIndexable();
  return {
    metadataBase: new URL(deploymentUrl()),
    title: { default: t.meta.title, template: `%s · Ceràmica Ferrés` },
    description: t.meta.description,
    robots: indexable ? undefined : { index: false, follow: false },
    alternates: {
      canonical: `/${lang}`,
      languages: { ...Object.fromEntries(LOCALES.map((locale) => [LOCALE_INFO[locale].intl, `/${locale}`])), "x-default": `/${FALLBACK_LOCALE}` },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      images: [{ url: "/og.jpg", width: 1200, height: 630 }],
      locale: LOCALE_INFO[lang].intl.replace("-", "_"),
      siteName: "Ceràmica Ferrés",
      type: "website",
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <html lang={lang} className={`${display.variable} ${sans.variable}`}>
      <body>
        <a href="#contingut" className="skip-link">
          {t.a11y.skip}
        </a>
        <Header locale={lang} t={t} />
        <main id="contingut" tabIndex={-1}>
          {children}
        </main>
        <Footer locale={lang} t={t} />
        <RevealObserver />
        <JsonLd locale={lang} t={t} />
      </body>
    </html>
  );
}
