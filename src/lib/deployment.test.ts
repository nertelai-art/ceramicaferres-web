import { describe, expect, it } from "vitest";
import { deploymentUrl, isIndexable } from "./deployment";

describe("deployment", () => {
  it("prioritza SITE_URL, després Vercel i finalment el domini del client", () => {
    expect(deploymentUrl({ SITE_URL: "https://x.test/", VERCEL_PROJECT_PRODUCTION_URL: "y.vercel.app" })).toBe("https://x.test");
    expect(deploymentUrl({ VERCEL_PROJECT_PRODUCTION_URL: "y.vercel.app" })).toBe("https://y.vercel.app");
    expect(deploymentUrl({})).toBe("https://ceramicaferres.com");
  });
  it("només s'indexa si es demana explícitament", () => {
    expect(isIndexable({})).toBe(false);
    expect(isIndexable({ SITE_INDEXABLE: "1" })).toBe(false);
    expect(isIndexable({ SITE_INDEXABLE: "true" })).toBe(true);
  });
});
