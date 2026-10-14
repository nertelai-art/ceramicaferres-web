import { describe, expect, it } from "vitest";
import imageLoader from "./image-loader";

describe("imageLoader", () => {
  it("dona l'amplada preparada més petita que cobreix la demanada", () => {
    expect(imageLoader({ src: "/images/a.webp", width: 320 })).toBe("/images/a-640.webp");
    expect(imageLoader({ src: "/images/a.webp", width: 1080 })).toBe("/images/a-1080.webp");
    expect(imageLoader({ src: "/images/a.webp", width: 3840 })).toBe("/images/a-1600.webp");
  });
  it("deixa estar el que no és una imatge preparada", () => {
    expect(imageLoader({ src: "/brand/logo.svg", width: 640 })).toBe("/brand/logo.svg");
  });
});
