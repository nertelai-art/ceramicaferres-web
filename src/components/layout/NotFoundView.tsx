import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { homePath } from "@/lib/routes";

export function NotFoundView({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section className="grain relative grid min-h-[100svh] place-items-center overflow-hidden px-4 pt-[var(--header-h)]">
      <div className="extrusion-lines pointer-events-none absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 text-argila/40" aria-hidden="true" />
      <div className="relative max-w-2xl text-center">
        <p className="display text-[clamp(6rem,22vw,16rem)] text-terra">404</p>
        <h1 className="display mt-4 text-4xl sm:text-5xl">{t.notFound.title}</h1>
        <p className="mt-4 text-fang">{t.notFound.text}</p>
        <Link href={homePath(locale)} className="btn btn-primary mt-10">
          {t.notFound.back}
        </Link>
      </div>
    </section>
  );
}
