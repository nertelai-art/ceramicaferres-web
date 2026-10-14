import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import { COLLECTION_KEYS, COLLECTION_SLUGS, allPaths, collectionFromSlug, collectionPath, translatePath } from "./routes";

describe("routes", () => {
  it("cada idioma té un slug únic per col·lecció", () => {
    for (const locale of LOCALES) {
      const slugs = COLLECTION_KEYS.map((key) => COLLECTION_SLUGS[key][locale]);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const slug of slugs) expect(slug).toMatch(/^[a-z-]+$/);
    }
  });
  it("tradueix una col·lecció al seu slug en l'altre idioma", () => {
    expect(translatePath("/ca/gelosies", "en")).toBe("/en/sunbreaks");
    expect(translatePath("/es/baldosas", "fr")).toBe("/fr/carreaux");
    expect(collectionFromSlug("en", "washbasins")).toBe("lavabos");
  });
  it("porta a l'inici si no reconeix el camí", () => {
    expect(translatePath("/ca", "es")).toBe("/es");
    expect(translatePath("/xx/res", "fr")).toBe("/fr");
    expect(translatePath("/ca/no-existeix", "en")).toBe("/en");
  });
  it("totes les adreces són diferents", () => {
    const paths = allPaths();
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain(collectionPath("ca", "elements"));
  });
});
