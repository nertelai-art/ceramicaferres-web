import { describe, expect, it } from "vitest";
import { FALLBACK_LOCALE, fill, formatNumber, pickLocale } from "./config";

describe("pickLocale", () => {
  it("respecta l'ordre i el pes de les preferències", () => {
    expect(pickLocale("fr-FR,fr;q=0.9,en;q=0.8")).toBe("fr");
    expect(pickLocale("de-DE,de;q=0.9,es;q=0.5,ca;q=0.7")).toBe("ca");
    expect(pickLocale("en;q=0.2,es;q=0.9")).toBe("es");
  });
  it("torna l'idioma de reserva si no n'hi ha cap dels nostres o la capçalera falta", () => {
    expect(pickLocale("de-DE,ja;q=0.5")).toBe(FALLBACK_LOCALE);
    expect(pickLocale(undefined)).toBe(FALLBACK_LOCALE);
    expect(pickLocale("ca;q=0")).toBe(FALLBACK_LOCALE);
  });
});

describe("fill i formatNumber", () => {
  it("substitueix només les claus conegudes", () => {
    expect(fill("{a} i {b}", { a: 1 })).toBe("1 i {b}");
  });
  it("fa servir el separador decimal de cada idioma", () => {
    expect(formatNumber("ca", 1.5, 1)).toBe("1,5");
    expect(formatNumber("en", 1.5, 1)).toBe("1.5");
  });
});
