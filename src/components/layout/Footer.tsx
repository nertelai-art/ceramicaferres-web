import Image from "next/image";
import Link from "next/link";
import { fill, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { site } from "@/data/site";
import { nertelCreditUrl } from "@/lib/nertel-credit";
import { COLLECTION_KEYS, collectionPath, sectionPath } from "@/lib/routes";
import { Logo } from "./Logo";

/** L'any entra per paràmetre: el peu no depèn del rellotge en renderitzar. */
const BUILD_YEAR = 2026;

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <footer className="on-dark relative bg-carbo pt-20 text-calc">
      <div className="container-x grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo className="h-12 w-auto text-argila" />
          <p className="mt-6 max-w-sm text-fang">{t.footer.tagline}</p>
          <address className="mt-6 text-sm not-italic leading-relaxed text-calc/80">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.locality} ({site.address.region})
            <br />
            <a className="underline-offset-4 hover:underline" href={site.phoneHref}>
              {site.phone}
            </a>
            {" · "}
            <a className="underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </address>
        </div>
        <nav aria-label={t.nav.collections}>
          <p className="eyebrow text-fang">{t.nav.collections}</p>
          <ul className="mt-4 grid gap-2">
            {COLLECTION_KEYS.map((key) => (
              <li key={key}>
                <Link className="hover:text-argila" href={collectionPath(locale, key)}>
                  {t.collections.items[key].name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Ceràmica Ferrés">
          <p className="eyebrow text-fang">Ferrés</p>
          <ul className="mt-4 grid gap-2">
            {(["process", "material", "projects", "custom", "contact"] as const).map((key) => (
              <li key={key}>
                <a className="hover:text-argila" href={sectionPath(locale, key)}>
                  {t.nav[key]}
                </a>
              </li>
            ))}
            <li>
              <a className="hover:text-argila" href={site.social.instagram} rel="noopener" target="_blank">
                Instagram
              </a>
            </li>
            <li>
              <a className="hover:text-argila" href={site.social.facebook} rel="noopener" target="_blank">
                Facebook
              </a>
            </li>
            <li>
              <a className="hover:text-argila" href={site.social.pinterest} rel="noopener" target="_blank">
                Pinterest
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="container-x mt-16 flex flex-col gap-3 border-t border-calc/10 pt-6 pb-10 text-xs text-calc/60 sm:flex-row sm:items-center sm:justify-between">
        <p>{fill(t.footer.rights, { year: BUILD_YEAR })}</p>
        <p className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="hover:text-calc" href={site.legal.notice} rel="noopener">
            {t.footer.legalNotice}
          </a>
          <a className="hover:text-calc" href={site.legal.privacy} rel="noopener">
            {t.footer.privacy}
          </a>
          <span>{t.footer.cookies}</span>
          <span>{t.workshop.note}</span>
        </p>
      </div>

      {/* Qui ha fet el web. Franja pròpia sota el peu, discreta, que porta a nertel.ai. */}
      {/* Al mòbil, marge de sota perquè la insígnia de la demo (fixa a baix a l'esquerra) no la tapi. */}
      <div className="border-t border-calc/5 bg-black/25">
        <div className="container-x flex justify-center pt-4 pb-14 sm:pb-4">
          <a
            href={nertelCreditUrl(locale)}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 text-xs text-calc/60 transition-colors hover:text-calc"
          >
            <span>{t.footer.madeBy}</span>
            {/* El blau marí del símbol és per a fons clars: sobre el peu fosc s'aclareix perquè es vegi sencer. */}
            {/* `unoptimized`: és un PNG petit i el carregador del web només coneix les fotos preparades (.webp). */}
            <Image
              src="/images/logos/nertel-mark.png"
              alt=""
              width={116}
              height={96}
              unoptimized
              className="h-6 w-auto brightness-[2.2] saturate-[1.2]"
            />
            <span className="text-sm font-semibold tracking-tight text-white">Nertel</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
