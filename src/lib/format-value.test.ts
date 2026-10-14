import { describe, expect, it } from "vitest";
import { MATERIALS, MATERIAL_KEYS, PROPERTY_KEYS, SCALES } from "@/data/materials";
import { barSpan, formatValue, type ValueLabels } from "./format-value";

const labels: ValueLabels = {
  values: {
    resists: "Resisteix",
    noDefects: "Sense defectes",
    complies: "Compleix",
    frostGlazed: "Tots excepte marrons i vermells",
    chemicalGres: "Resisteix",
    singleFiring: "Monococció",
    "origin.bisbal": "la Bisbal",
    "origin.teruel": "Terol",
  },
  qualifiers: { average: "mitjana", above: "més de" },
  slipClass: "Classe 3",
  missing: "No consta",
};

describe("formatValue", () => {
  it("escriu els números com els escriu cada idioma", () => {
    expect(formatValue(MATERIALS.gres.values.flexural, "ca", labels)).toBe("52,4 N/mm²");
    expect(formatValue(MATERIALS.gres.values.flexural, "en", labels)).toBe("52.4 N/mm²");
    expect(formatValue(MATERIALS.arena14.values.absorption, "fr", labels)).toBe("14,03 %");
    expect(formatValue(MATERIALS.arena14.values.absorption, "en", labels)).toBe("14.03%");
  });
  it("posa rangs, mitjanes i mínims", () => {
    expect(formatValue(MATERIALS.rojo15.values.absorption, "ca", labels)).toBe("10–13 %");
    expect(formatValue(MATERIALS.gres.values.absorption, "ca", labels)).toBe("3,1 % (mitjana)");
    expect(formatValue(MATERIALS.gres.values.firing, "ca", labels)).toBe("més de 1.300 °C");
    expect(formatValue(MATERIALS.gres.values.slip, "ca", labels)).toBe("Rd 60 · Classe 3");
  });
  it("diu que falta quan la fitxa no dona el valor", () => {
    expect(formatValue(MATERIALS.rojo15.values.flexural, "ca", labels)).toBe("No consta");
  });
  it("cap propietat de cap material queda sense text", () => {
    for (const material of MATERIAL_KEYS)
      for (const property of PROPERTY_KEYS) expect(formatValue(MATERIALS[material].values[property], "es", labels).length).toBeGreaterThan(0);
  });
});

describe("barSpan", () => {
  it("dona un tram dins de l'escala, o res si no és numèric", () => {
    expect(barSpan(MATERIALS.gres.values.hardness, SCALES.hardness)).toEqual({ from: 0, to: 0.7 });
    expect(barSpan(MATERIALS.rojo15.values.absorption, SCALES.absorption)).toEqual({ from: 10 / 15, to: 13 / 15 });
    expect(barSpan(MATERIALS.rojo15.values.frost, SCALES.frost)).toBeNull();
  });
});
