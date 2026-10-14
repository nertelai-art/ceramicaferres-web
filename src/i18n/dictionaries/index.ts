import type { Locale } from "../config";
import { ca, type Dictionary } from "./ca";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { ca, es, en, fr };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
