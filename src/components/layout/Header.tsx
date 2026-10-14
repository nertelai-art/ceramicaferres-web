"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LOCALE_INFO, LOCALES, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { homePath, sectionPath, translatePath } from "@/lib/routes";
import { Logo } from "./Logo";

const LINKS = ["collections", "process", "material", "projects", "custom"] as const;

export function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname() ?? homePath(locale);
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuId = useId();

  // Fons sòlid quan s'ha baixat una mica: s'escriu al DOM, no a l'estat (canvia en fer scroll).
  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const update = () => {
      element.dataset.scrolled = window.scrollY > 24 ? "true" : "false";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
    <header
      ref={header}
      data-scrolled="false"
      className="group fixed inset-x-0 top-0 z-50 transition-colors duration-500 data-[scrolled=true]:bg-forn/85 data-[scrolled=true]:backdrop-blur-md"
    >
      <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href={homePath(locale)} className="text-calc transition-colors hover:text-argila" aria-label={t.a11y.home} onClick={close}>
          <Logo className="h-8 w-auto sm:h-9" title={t.a11y.home} />
        </Link>

        <nav aria-label={t.a11y.menu} className="hidden items-center gap-7 text-sm font-medium lg:flex">
          {LINKS.map((key) => (
            <a key={key} href={sectionPath(locale, key)} className="text-calc/80 transition-colors hover:text-calc">
              {t.nav[key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ul className="hidden items-center gap-1 text-xs font-semibold sm:flex" aria-label={t.a11y.language}>
            {LOCALES.map((other) => (
              <li key={other}>
                <Link
                  href={translatePath(pathname, other)}
                  hrefLang={LOCALE_INFO[other].intl}
                  lang={other}
                  aria-current={other === locale ? "page" : undefined}
                  className="rounded px-1.5 py-1 text-calc/55 transition-colors hover:text-calc aria-[current=page]:text-argila"
                >
                  <abbr title={LOCALE_INFO[other].name} className="no-underline">
                    {LOCALE_INFO[other].label}
                  </abbr>
                </Link>
              </li>
            ))}
          </ul>
          <a href={sectionPath(locale, "contact")} className="btn btn-primary hidden min-h-0 px-4 py-2.5 text-sm md:inline-flex">
            {t.nav.cta}
          </a>
          <button
            type="button"
            className="relative grid size-11 place-items-center rounded-full border border-calc/25 text-calc lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? t.a11y.closeMenu : t.a11y.menu}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" className={`absolute h-px w-5 bg-current transition-transform ${open ? "rotate-45" : "-translate-y-1.5"}`} />
            <span aria-hidden="true" className={`absolute h-px w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span aria-hidden="true" className={`absolute h-px w-5 bg-current transition-transform ${open ? "-rotate-45" : "translate-y-1.5"}`} />
          </button>
        </div>
      </div>

    </header>
      {/* Menú de mòbil: fora del <header>, perquè el seu backdrop-filter faria de bloc contenidor del `fixed`. */}
      <div id={menuId} hidden={!open} className="fixed inset-0 top-[var(--header-h)] z-40 overflow-y-auto bg-forn lg:hidden">
        <nav aria-label={t.a11y.menu} className="container-x flex flex-col gap-1 py-8">
          {[...LINKS, "contact" as const].map((key) => (
            <a key={key} href={sectionPath(locale, key)} onClick={close} className="display border-b border-calc/10 py-4 text-4xl">
              {t.nav[key]}
            </a>
          ))}
          <ul className="mt-8 flex gap-2" aria-label={t.a11y.language}>
            {LOCALES.map((other) => (
              <li key={other}>
                <Link
                  href={translatePath(pathname, other)}
                  hrefLang={LOCALE_INFO[other].intl}
                  lang={other}
                  onClick={close}
                  aria-current={other === locale ? "page" : undefined}
                  className="block rounded-full border border-calc/20 px-4 py-2 text-sm font-semibold aria-[current=page]:border-argila aria-[current=page]:text-argila"
                >
                  {LOCALE_INFO[other].name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
