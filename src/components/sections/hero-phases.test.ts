import { describe, expect, it } from "vitest";
import { arrival, DEPTH, duration, ENTRIES, PIECES, placement, sequenceEnd, SHADOW_OF, SHADOWS, shadowTiming, STAGE, type PieceId } from "./hero-phases";

const box = (id: PieceId) => PIECES.find((p) => p.id === id)!;
/** Part de l'escenari que es veu a mòbil (és on més se'n retalla): 14 % per cada costat d'un 128 %. */
const VISIBLE = { left: (14 / 128) * STAGE.width, right: (114 / 128) * STAGE.width };

describe("entrada de les peces de la primera pantalla", () => {
  it("té una entrada per a cada capa que ha preparat l'script, i al revés", () => {
    expect(PIECES.map((p) => p.id).sort()).toEqual(Object.keys(ENTRIES).sort());
    expect(Object.keys(DEPTH).sort()).toEqual(Object.keys(ENTRIES).sort());
    expect(SHADOWS.map((s) => s.id).sort()).toEqual(Object.keys(SHADOW_OF).sort());
  });

  it("a mòbil, la composició final hi cap sencera", () => {
    for (const piece of PIECES) {
      expect(piece.x, piece.id).toBeGreaterThanOrEqual(VISIBLE.left);
      expect(piece.x + piece.w, piece.id).toBeLessThanOrEqual(VISIBLE.right);
    }
  });

  it("les que arriben per la dreta surten de fora de la pantalla", () => {
    for (const [id, entry] of Object.entries(ENTRIES) as [PieceId, (typeof ENTRIES)[PieceId]][]) {
      if (entry.kind !== "walk" || entry.from.fade) continue;
      expect(box(id).x + entry.from.x, id).toBeGreaterThan(VISIBLE.right);
    }
  });

  it("les que cauen comencen per sobre de l'escenari i aterren sobre una peça que ja hi és", () => {
    expect(box("mur-1").y + (ENTRIES["mur-1"].kind === "drop" ? ENTRIES["mur-1"].from.y : 0) + box("mur-1").h).toBeLessThan(0);
    expect(box("mur-2").y + (ENTRIES["mur-2"].kind === "drop" ? ENTRIES["mur-2"].from.y : 0) + box("mur-2").h).toBeLessThan(0);
    // Toquen la de sota a la meitat de la caiguda (fotograma de l'impacte): ja hi ha d'haver arribat.
    expect(ENTRIES["mur-1"].delay + duration(ENTRIES["mur-1"]) * 0.55).toBeGreaterThan(arrival("mur-3"));
    expect(ENTRIES["mur-2"].delay + duration(ENTRIES["mur-2"]) * 0.55).toBeGreaterThan(arrival("mur-4"));
  });

  it("les dues de baix del mur no es travessen pel camí", () => {
    const left = (id: PieceId, t: number) => {
      const entry = ENTRIES[id];
      if (entry.kind !== "walk") throw new Error(id);
      const p = Math.min(1, Math.max(0, (t - entry.delay) / duration(entry)));
      return box(id).x + entry.from.x * (1 - p);
    };
    // Abans de sortir, totes dues esperen fora de la pantalla: allà no importa.
    for (let t = ENTRIES["mur-4"].delay; t < 3; t += 0.02) {
      expect(left("mur-4", t), `t=${t.toFixed(2)}`).toBeGreaterThanOrEqual(left("mur-3", t) + box("mur-3").w - 20);
    }
  });

  it("les ombres llargues s'encenen quan les seves peces ja hi són", () => {
    for (const [id, pieces] of Object.entries(SHADOW_OF) as [keyof typeof SHADOW_OF, readonly PieceId[]][]) {
      const { delay } = shadowTiming(id);
      for (const piece of pieces) expect(delay, `${id} / ${piece}`).toBeGreaterThan(arrival(piece) - 0.3);
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
