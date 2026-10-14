import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { site } from "@/data/site";
import { deploymentUrl } from "@/lib/deployment";

/** Dades estructurades del negoci: fabricant, adreça i contacte, tal com surten a la seva web. */
export function JsonLd({ locale, t }: { locale: Locale; t: Dictionary }) {
  const url = deploymentUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: `${url}/${locale}`,
    logo: `${url}/brand/logo-ferres.svg`,
    foundingDate: String(site.founded),
    description: t.meta.description,
    email: site.email,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    sameAs: [site.url, site.social.instagram, site.social.facebook, site.social.pinterest],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
