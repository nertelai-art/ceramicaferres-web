# Ceràmica Ferrés — web

Proposta de web nova per a Ceràmica Ferrés (ceramicaferres.com): fabricant familiar de ceràmica
per a l'arquitectura des de 1956, a Corçà (Girona), dins la tradició de la Bisbal. Públic: arquitectes,
interioristes i constructors. Idiomes: català, castellà, anglès i francès.

Les regles de casa (`~/.claude/CLAUDE.md`) valen aquí. Això és el que és propi d'aquest repositori.

## Ordres

- `pnpm dev` (Next amb `--webpack`: el Control d'aplicacions de Windows bloqueja el SWC natiu).
- `pnpm build:local` per provar la build en local; `pnpm start` per mirar-la. Les animacions es jutgen
  amb la build de producció, no amb el servidor de desenvolupament.
- `pnpm check` = typecheck + lint + tests. És el hook de pre-push (`.githooks/pre-push`, amb gitleaks).
- `pnpm images` prepara les fotos de `_source/` a `public/images/` en tres amplades (640, 1080, 1600).
- `pnpm hero` retalla les fotos de producte de les Empúries, amb l'ombra a part (`public/images/inici/`,
  `src/data/hero-pieces.json`); amb `--debug` deixa cada retall a `_source/hero-debug/`.
- Si un canvi a `globals.css` no surt al navegador ni reiniciant el servidor, és la memòria cau de
  webpack: atura'l, esborra `.next/dev` i `.next/cache` i torna'l a engegar (passat el 14-10-2026).
- **Node 22.** Si el `node` global és un altre (nvm el pot haver canviat una altra sessió), posa
  `C:\Users\nerte\AppData\Local\nvm\v22.23.2` al davant del PATH; no toquis l'enllaç global.

## Contingut

- **Tot el que es diu del client és real** i surt de la seva web, de les seves fitxes tècniques o de
  fonts citades a `docs/fonts.md`. El que falta es marca com a pendent; no s'inventa.
  Única excepció, decidida per l'usuari el 14-10-2026: la flexió i la duresa de la terracota i del
  vidriat són valors orientatius del sector (`estimated` a `src/data/materials.ts`), surten amb «≈»
  i una nota, i es substitueixen quan Ferrés doni els seus.
- Dades (productes, projectes, propietats dels materials) a `src/data/`; textos a
  `src/i18n/dictionaries/`. El català és la referència de tipus: `es`, `en` i `fr` han de tenir
  les mateixes claus (hi ha una prova).
- Les fotos de projectes porten sempre l'arquitecte i el fotògraf, com a la web del client.
- Els clips de vídeo estan **generats amb IA a partir de fotos pròpies de Ferrés** (taller),
  mai de fotos de projectes d'arquitectes. Al client se li diu així; no es presenten com a gravació.

## Escenes

- three.js només s'importa dins `src/components/**/*Scene.tsx` i `src/components/three/` (regla
  d'ESLint) i les escenes es carreguen amb `next/dynamic`.
- La coreografia va en fitxers `*-phases.ts` de TypeScript pur, amb proves.
- `frameloop="demand"`, progrés en refs, DOM tocat directament des del scroll; mai `setState` per
  fotograma. Atzar amb llavor (`src/lib/random.ts`).
- Cada escena té l'estat final a l'HTML, respecta `prefers-reduced-motion` i té reserva sense WebGL.

## Demo per a leads (`src/demo-kit`)

- **El web és una demo per a un lead**: un cop desplegat, només s'hi entra amb un enllaç personal, i
  qui no en porta veu la pàgina de bloqueig de Nertel. Els enllaços es fan amb
  `pnpm demo:link "Nom del lead" --days 15`, que llegeix el secret de `.env.local` (el mateix que a
  Vercel; no es puja mai).
- El codi ve del kit comú de les demos (`../nertel-demo-kit`, skill `demo-leads`). **No s'edita
  aquí**: es canvia al kit i es torna a copiar, perquè totes les demos siguin iguals.
- Vercel: `DEMO_SECRET` i `DEMO_SITE` (la porta), i `NEXT_PUBLIC_POSTHOG_KEY` i
  `NEXT_PUBLIC_POSTHOG_HOST` (el seguiment de les visites dels leads amb PostHog). Sense
  `DEMO_SECRET` el web és obert.
- `src/proxy.ts` fa dues coses: primer la porta de la demo i després la redirecció de l'arrel a
  l'idioma, que s'emporta les galetes de l'enllaç (`src/proxy.test.ts`). Si es treu el kit, la
  redirecció s'hi queda. La insígnia només parla català i castellà: en anglès i francès surt en
  castellà.
- **Quan el web passi a ser el del client** es treu el kit: `src/proxy.ts`, `DemoTracker` i
  `DemoBadge` del layout de `[lang]`, la carpeta `src/demo-kit`, `posthog-js`, l'script `demo:link` i les
  variables. I es revisa l'avís de galetes.

## Git

- Branca d'integració: `developer`. A `main` no s'hi puja a mà.
- Repositori públic a GitHub (`nertelai-art/ceramicaferres-web`, des del 14-10-2026); branca per defecte
  `developer`. A `main` s'hi arriba amb una PR de llançament des de `developer` (merge commit, CI en verd),
  i només quan l'usuari ho diu.
- Vercel (`ceramicaferres-web`): producció només des de `main` (ho vigila `ignoreCommand` de
  `vercel.json`) a https://ceramicaferres-web.vercel.app, oberta sense inici de sessió (decisió de
  l'usuari); quan hi arribi el kit de demo, només amb enllaç personal (vegeu «Demo per a leads»).
  Cada branca té la seva previsualització.
- El connector de Vercel no té permís per crear ni modificar el projecte: es fa amb la CLI,
  `pnpm --config.cache-dir=C:/Users/nerte/.pnpm-dlx dlx vercel@<versió> …` (la memòria cau per defecte
  supera el límit de 260 caràcters de Windows). Les crides `vercel api` des de PowerShell: Git Bash
  converteix el camí `/v9/…` en un camí de Windows.
- El web no s'indexa (`noindex`) mentre no sigui al domini del client (`SITE_INDEXABLE`).
