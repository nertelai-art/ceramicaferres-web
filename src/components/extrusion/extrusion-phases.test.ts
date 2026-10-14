import { describe, expect, it } from "vitest";
import {
  COUNT,
  PIECE,
  STEPS,
  beltSlot,
  cameraAt,
  clayStage,
  columnLength,
  columnVisible,
  dieOpacity,
  pieceAt,
  stepAt,
  voltaOutline,
  wallSlot,
} from "./extrusion-phases";

const samples = Array.from({ length: 1001 }, (_, i) => i / 1000);

/** Àrea amb signe (fórmula del sabater): positiva si el contorn va en sentit antihorari. */
const signedArea = (points: [number, number][]) =>
  points.reduce((sum, [x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length]!;
    return sum + (x * ny - nx * y) / 2;
  }, 0);

describe("perfil Volta", () => {
  it("el buit queda dins del contorn i va en sentit contrari", () => {
    const { outer, hole } = voltaOutline();
    expect(Math.sign(signedArea(outer))).toBe(-Math.sign(signedArea(hole)));
    for (const [x, y] of hole) {
      expect(Math.abs(x)).toBeLessThanOrEqual(PIECE.width / 2 - PIECE.wall + 1e-9);
      expect(Math.abs(y)).toBeLessThanOrEqual(PIECE.height / 2 - PIECE.wall + 1e-9);
    }
  });
});

describe("coreografia", () => {
  it("el fang només surt de la filera, mai hi torna", () => {
    let previous = 0;
    for (const p of samples) {
      const length = columnLength(p);
      expect(length).toBeGreaterThanOrEqual(previous - 1e-12);
      previous = length;
    }
    expect(columnLength(0)).toBe(0);
    expect(columnLength(1)).toBeCloseTo(COUNT * PIECE.depth);
  });

  it("al moment del tall, les peces ocupen exactament el lloc de la columna", () => {
    for (let i = 0; i < COUNT; i++) {
      const piece = beltSlot(i, 0);
      expect(piece.x - PIECE.depth / 2).toBeCloseTo(-3.6 + i * PIECE.depth);
    }
  });

  it("columna i peces no es veuen mai alhora, i sempre n'hi ha alguna cosa després de començar", () => {
    for (const p of samples) {
      const pieces = pieceAt(0, p).visible;
      expect(pieces && columnVisible(p)).toBe(false);
      if (p > 0.2) expect(pieces || columnVisible(p)).toBe(true);
    }
  });

  it("al final, cada peça és al seu lloc del mur, de cara, sense solapar-se", () => {
    const seen = new Set<string>();
    for (let i = 0; i < COUNT; i++) {
      const end = pieceAt(i, 1);
      const slot = wallSlot(i);
      expect(end).toMatchObject({ visible: true, yaw: 0 });
      expect(end.x).toBeCloseTo(slot.x);
      expect(end.y).toBeCloseTo(slot.y);
      expect(end.z).toBeCloseTo(slot.z);
      seen.add(`${slot.x}|${slot.y}`);
    }
    expect(seen.size).toBe(COUNT);
  });

  it("cap peça baixa per sota del terra durant el vol", () => {
    for (const p of samples) for (let i = 0; i < COUNT; i++) expect(pieceAt(i, p).y).toBeGreaterThanOrEqual(PIECE.height / 2 - 1e-9);
  });

  it("la brasa s'encén i s'apaga dins la cocció; al final la peça és cuita", () => {
    expect(clayStage(0.6).glow).toBe(0);
    expect(clayStage(0.72).glow).toBeGreaterThan(0.9);
    expect(clayStage(1)).toMatchObject({ dried: 1, fired: 1 });
    expect(clayStage(1).glow).toBeCloseTo(0);
  });

  it("la filera desapareix abans que es formi el mur", () => {
    expect(dieOpacity(0)).toBe(0);
    expect(dieOpacity(0.3)).toBe(1);
    expect(dieOpacity(0.9)).toBe(0);
  });

  it("els passos avancen en ordre i cobreixen tot el recorregut", () => {
    expect(stepAt(0)).toBe(0);
    expect(stepAt(1)).toBe(STEPS.length - 1);
    let previous = 0;
    for (const p of samples) {
      const step = stepAt(p);
      expect(step).toBeGreaterThanOrEqual(previous);
      previous = step;
    }
  });

  it("la càmera es mou de manera contínua (sense salts entre fotogrames clau)", () => {
    let previous = cameraAt(0).position;
    for (const p of samples) {
      const { position } = cameraAt(p);
      const jump = Math.hypot(...position.map((value, i) => value - previous[i]!));
      expect(jump).toBeLessThan(0.15);
      previous = position;
    }
  });
});
