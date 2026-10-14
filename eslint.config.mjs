import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const pure = { group: ["react", "react-dom", "next/*", "three", "@react-three/*"], message: "Aquest fitxer ha de ser TypeScript pur, sense React, Next ni three.js." };
const three = { group: ["three", "three/*", "@react-three/*"], message: "three.js només es pot importar dins de les escenes (*Scene.tsx) i de src/components/three/: així no entra al paquet inicial." };

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "_source/**"] },
  ...next,
  ...nextTs,
  {
    // three.js pesa ~250 KB gzip: només el carreguen les escenes, que s'importen amb next/dynamic.
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/components/**/*Scene.tsx", "src/components/three/**"],
    rules: { "no-restricted-imports": ["error", { patterns: [three] }] },
  },
  {
    // La lògica de les escenes, les dades i els textos són TypeScript pur: es proven sense navegador.
    files: ["src/lib/**", "src/i18n/**", "src/data/**", "src/components/**/*-phases.ts"],
    rules: { "no-restricted-imports": ["error", { patterns: [pure] }] },
  },
];

export default config;
