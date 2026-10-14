"use client";

import { useParams } from "next/navigation";
import { NotFoundView } from "@/components/layout/NotFoundView";
import { FALLBACK_LOCALE, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default function NotFound() {
  const params = useParams<{ lang?: string }>();
  const locale = params?.lang && isLocale(params.lang) ? params.lang : FALLBACK_LOCALE;
  return <NotFoundView locale={locale} t={getDictionary(locale)} />;
}
