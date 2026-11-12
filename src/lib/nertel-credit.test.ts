import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import { nertelCreditUrl } from "./nertel-credit";

// La franja «Web feta per Nertel» porta a nertel.ai en l'idioma de la pàgina, i marca d'on ve la
// visita perquè a l'analítica de nertel.ai es vegi quines webs de clients ens envien gent.
describe("enllaç de crèdit a Nertel", () => {
  it("porta a nertel.ai en l'idioma de la pàgina (nertel.ai té els quatre del web)", () => {
    for (const locale of LOCALES) {
      const url = new URL(nertelCreditUrl(locale));
      expect(url.origin).toBe("https://nertel.ai");
      expect(url.pathname).toBe(`/${locale}`);
    }
  });

  it("diu que la visita ve del peu del web de Ceràmica Ferrés", () => {
    const params = new URL(nertelCreditUrl("fr")).searchParams;
    expect(params.get("utm_source")).toBe("ceramicaferres-web.vercel.app");
    expect(params.get("utm_medium")).toBe("credit");
  });
});
