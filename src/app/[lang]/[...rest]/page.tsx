import { notFound } from "next/navigation";

/** Qualsevol camí desconegut dins d'un idioma ensenya el 404 d'aquell idioma. */
export default function Missing() {
  notFound();
}
