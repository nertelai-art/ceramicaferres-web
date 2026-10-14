import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Les imatges ja venen preparades a tres amplades (`pnpm images`): es serveixen com a fitxers estàtics.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [640, 1080, 1600],
    imageSizes: [320],
  },
  experimental: {
    // L'únic layout arrel és el de /[lang]: sense això, una adreça sense idioma surt amb la 404 nua de Next.
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Clips i imatges preparades: noms estables, es poden guardar molt temps.
        source: "/(images|video)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
