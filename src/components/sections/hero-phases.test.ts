import { describe, expect, it } from "vitest";
import { arrival, DEPTH, duration, ENTRIES, PIECES, placement, sequenceEnd, SOURCES, SPOTS, STAGE, type PieceId } from "./hero-phases";

const box = (id: PieceId) => PIECES.find((p) => p.id === id)!;
/** Part de l'escenari que es veu a mòbil (és on més se'n retalla): 12 % per cada costat d'un 124 %. */
const VISIBLE = { left: (12 / 124) * STAGE.width, right: (112 / 124) * STAGE.width };

describe("entrada de les peces de la primera pantalla", () => {
  it("cada peça té lloc, entrada i profunditat, i una foto retallada", () => {
    expect(Object.keys(ENTRIES).sort()).toEqual(Object.keys(SPOTS).sort());
    expect(Object.keys(DEPTH).sort()).toEqual(Object.keys(SPOTS).sort());
    for (const piece of PIECES) expect(SOURCES[piece.source], piece.id).toBeDefined();
  });

  it("la composició final cap a l'escenari i, a mòbil, a la part que es veu", () => {
    for (const piece of PIECES) {
      expect(piece.y, piece.id).toBeGreaterThanOrEqual(0);
      expect(piece.y + piece.h, piece.id).toBeLessThanOrEqual(STAGE.height);
      expect(piece.x, piece.id).toBeGreaterThanOrEqual(VISIBLE.left);
      expect(piece.x + piece.w, piece.id).toBeLessThanOrEqual(VISIBLE.right);
    }
  });

  it("les peces de dalt del mur recolzen sobre les de baix", () => {
    for (const [top, bottom] of [
      ["mur-1", "mur-3"],
      ["mur-2", "mur-4"],
    ] as const) {
      const upper = SPOTS[top];
      const lower = SPOTS[bottom];
      const cap = SOURCES[lower.source].capLeft[1] - SOURCES[lower.source].footLeft[1];
      // El peu de la de dalt és just sota la vora de la tapa de la de baix (a menys de 30 unitats).
      expect(upper.foot[1] - (lower.foot[1] + cap * lower.scale)).toBeGreaterThan(0);
      expect(upper.foot[1] - (lower.foot[1] + cap * lower.scale)).toBeLessThan(30);
    }
  });

  it("les que arriben per la dreta surten de fora de la pantalla", () => {
    for (const [id, entry] of Object.entries(ENTRIES) as [PieceId, (typeof ENTRIES)[PieceId]][]) {
      if (entry.kind !== "walk" || entry.from.fade) continue;
      expect(box(id).x + entry.from.x, id).toBeGreaterThan(VISIBLE.right);
    }
  });

  it("les que cauen comencen per sobre de l'escenari i aterren sobre una peça que ja hi és", () => {
    for (const [top, bottom] of [
      ["mur-1", "mur-3"],
      ["mur-2", "mur-4"],
    ] as const) {
      const entry = ENTRIES[top];
      if (entry.kind !== "drop") throw new Error(top);
      expect(box(top).y + entry.from.y + box(top).h).toBeLessThan(0);
      // Toquen la de sota a la meitat de la caiguda (fotograma de l'impacte): ja hi ha d'haver arribat.
      expect(entry.delay + duration(entry) * 0.52).toBeGreaterThan(arrival(bottom));
    }
  });

  it("les dues de baix del mur no es travessen pel camí", () => {
    const left = (id: PieceId, t: number) => {
      const entry = ENTRIES[id];
      if (entry.kind !== "walk") throw new Error(id);
      const p = Math.min(1, Math.max(0, (t - entry.delay) / duration(entry)));
      return SPOTS[id].foot[0] + entry.from.x * (1 - p);
    };
    const width = (SOURCES[SPOTS["mur-3"].source].footRight[0] - SOURCES[SPOTS["mur-3"].source].footLeft[0]) * SPOTS["mur-3"].scale;
    // Abans de sortir, totes dues esperen fora de la pantalla: allà no importa.
    for (let t = ENTRIES["mur-4"].delay; t < 3; t += 0.02) {
      expect(left("mur-4", t), `t=${t.toFixed(2)}`).toBeGreaterThanOrEqual(left("mur-3", t) + width - 10);
    }
  });

  it("tot plegat dura menys de quatre segons", () => {
    expect(sequenceEnd()).toBeLessThan(4);
    expect(sequenceEnd()).toBeGreaterThan(2);
  });

  it("col·loca les capes en percentatges de l'escenari", () => {
    expect(placement({ x: 1024, y: 576, w: 512, h: 100 })).toEqual({ left: 50, top: 50, width: 25 });
  });
});
