import { NextResponse, type NextRequest } from "next/server";
import { pickLocale } from "@/i18n/config";

/** L'arrel porta a l'idioma que demana el navegador; cada idioma té la seva adreça. */
export function proxy(request: NextRequest) {
  const locale = pickLocale(request.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = { matcher: "/" };
