# Ceràmica Ferrés — proposta de web

Web nova per a [Ceràmica Ferrés](https://ceramicaferres.com), fabricant de ceràmica per a
l'arquitectura des de 1956. Quatre idiomes (català, castellà, anglès i francès), una pàgina d'inici
llarga amb vídeo i 3D lligats al scroll, i una pàgina per a cada col·lecció amb els 45 models.

## Seccions de l'inici

1. **Inici** — vídeo lligat al scroll: la barra de fang surt de l'extrusora amb «CERAMICA FERRES».
2. **Empresa** — l'ofici des de 1956 i quatre xifres.
3. **Col·leccions** — gelosies, rajoles, lavabos i elements constructius.
4. **De la filera a la peça** — escena 3D (three.js): perfil, filera, extrusió, tall, cocció i mur.
5. **El taller** — quatre clips del taller lligats al scroll.
6. **Anatomia del material** — peça explosionada en CSS 3D amb la carta d'esmalts real i les
   propietats de les fitxes tècniques (absorció, flexió, duresa, gelada, dilatació…).
7. **Projectes**, **A mida** (Garbet), **Sostenibilitat** i **Contacte**.

## Desenvolupament

```bash
pnpm install --frozen-lockfile
pnpm dev            # Next amb --webpack
pnpm check          # typecheck + lint + tests (també és el hook de pre-push)
pnpm build:local    # build de producció en local
pnpm images         # torna a fer les imatges de public/images a partir de _source/
node scripts/shoot.mjs http://localhost:3100/ca captura 1440x900 top p:proces:0.5
```

Node 22 i pnpm 10. Les regles del projecte són a [CLAUDE.md](CLAUDE.md), la direcció visual a
[docs/direccio-visual.md](docs/direccio-visual.md) i d'on surt cada dada a [docs/fonts.md](docs/fonts.md).
