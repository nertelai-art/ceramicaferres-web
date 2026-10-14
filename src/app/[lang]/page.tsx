import { notFound } from "next/navigation";
import { AnatomyTeaser } from "@/components/anatomy/AnatomyTeaser";
import { ExtrusionShowcase } from "@/components/extrusion/ExtrusionShowcase";
import { Collections } from "@/components/sections/Collections";
import { Contact } from "@/components/sections/Contact";
import { Custom } from "@/components/sections/Custom";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Projects } from "@/components/sections/Projects";
import { Sustainability } from "@/components/sections/Sustainability";
import { Workshop } from "@/components/sections/Workshop";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <Hero locale={lang} t={t} />
      <Intro t={t} />
      <Collections locale={lang} t={t} />
      <ExtrusionShowcase t={t} />
      <Workshop t={t} />
      <AnatomyTeaser locale={lang} t={t} />
      <Projects locale={lang} t={t} />
      <Custom locale={lang} t={t} />
      <Sustainability t={t} />
      <Contact t={t} />
    </>
  );
}
