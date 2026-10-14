import type { MetadataRoute } from "next";
import { deploymentUrl } from "@/lib/deployment";
import { allPaths } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = deploymentUrl();
  return allPaths().map((path) => ({ url: `${url}${path}` }));
}
