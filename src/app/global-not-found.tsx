import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { NotFoundView } from "@/components/layout/NotFoundView";
import { FALLBACK_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-bricolage", display: "swap" });
const sans = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

// L'únic layout arrel és el de /[lang]: les adreces sense idioma vàlid cauen aquí.
export const metadata: Metadata = { title: "404 · Ceràmica Ferrés", robots: { index: false } };

export default function GlobalNotFound() {
  const t = getDictionary(FALLBACK_LOCALE);
  return (
    <html lang={FALLBACK_LOCALE} className={`${display.variable} ${sans.variable}`}>
      <body>
        <main>
          <NotFoundView locale={FALLBACK_LOCALE} t={t} />
        </main>
      </body>
    </html>
  );
}
