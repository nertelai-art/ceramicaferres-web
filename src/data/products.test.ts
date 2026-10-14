import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import { COLLECTION_KEYS } from "@/lib/routes";
import imageManifest from "../../scripts/images.products.json";
import { PRODUCTS, productsIn } from "./products";

describe("products", () => {
  it("hi ha les 45 peces del catàleg", () => {
    expect(PRODUCTS).toHaveLength(45);
  });

  it("els slugs són únics i aptes per a una adreça", () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("cada peça té nom i descripció en els quatre idiomes", () => {
    for (const product of PRODUCTS) {
      for (const locale of LOCALES) {
        expect(product.name[locale]?.trim(), `${product.slug} · nom ${locale}`).toBeTruthy();
        expect(product.description[locale]?.trim(), `${product.slug} · descripció ${locale}`).toBeTruthy();
      }
    }
  });

  it("cap descripció no repeteix el dissenyador (va en un camp a part)", () => {
    for (const product of PRODUCTS) {
      for (const locale of LOCALES) {
        expect(product.description[locale], `${product.slug} · ${locale}`).not.toMatch(/Diseñad|Diss?enyad|Designed by/);
        expect(product.description[locale], `${product.slug} · ${locale}`).not.toMatch(/\n|\s{2}/);
      }
    }
  });

  it("cada col·lecció té peces i cap peça no queda fora", () => {
    for (const key of COLLECTION_KEYS) expect(productsIn(key).length, key).toBeGreaterThan(0);
    expect(COLLECTION_KEYS.reduce((sum, key) => sum + productsIn(key).length, 0)).toBe(PRODUCTS.length);
  });

  it("les mides fan servir «×» i acaben en cm", () => {
    for (const product of PRODUCTS) {
      for (const format of product.formats) {
        expect(format, product.slug).not.toMatch(/\d\s*x\s*\d/);
        expect(format, product.slug).toMatch(/ cm( \(.+\))?$/);
      }
    }
  });

  it("la foto de cada peça segueix el patró i surt del manifest d'imatges", () => {
    const outs = imageManifest.map((entry) => entry.out);
    expect(new Set(outs).size).toBe(outs.length);
    for (const product of PRODUCTS) {
      expect(product.image).toBe(`/images/productes/${product.slug}.webp`);
      expect(outs).toContain(`productes/${product.slug}`);
    }
    expect(outs).toHaveLength(PRODUCTS.length);
    for (const entry of imageManifest) expect(entry.src).toMatch(/^_source\/web\/productos\//);
  });
});
