# D'on surt cada dada

Tot el que la web diu de Ceràmica Ferrés té una font. Consultades el 14-10-2026. El material en brut
(descàrregues, inventari complet, recerca) és a `_source/` i no es puja al repositori.

## Del client

| Dada | Font |
|---|---|
| Fundació el 1956 a la Bisbal; ofici, disseny i innovació; materials 100 % naturals, terra i aigua; proveïdors d'argila propers | ceramicaferres.com/about/ |
| Adreça (C-66 km 12, 17121 Corçà), telèfon, correu | ceramicaferres.com/about/ |
| Descripció de les quatre famílies i introduccions | ceramicaferres.com/productos/tipo/* (versions es, ca, en) |
| 45 productes: noms, dimensions, acabats, dissenyadors, descripcions | Fitxes de producte; inventari a `_source/catalog.json` |
| Peces a mida; Garbet per a «Inspired in Barcelona: Mediterranean Design» (Fuorisalone, Milà) | ceramicaferres.com/productos-a-medida/ |
| Projectes, arquitectes i fotògrafs | ceramicaferres.com/proyectos/ |
| Propietats generals: 150 anys (DAP), Euroclasse A1, sense COV, humitat, ventilació creuada | Pàgina d'inici i dossier de sostenibilitat |
| Absorció, gelada, resistència química i abrasió de la terracota Rojo 15 i Arena 14; dades del vidriat; extrusió i monococció; colors a més de 1.000 °C; 12 × 24 × 7 cm i 1,47 kg de Volta | Fitxa tècnica Volta — ceramicaferres.com/download/20641/ |
| Gres: cocció a més de 1.300 °C, absorció 3,1 %, flexió 52,4 N/mm², Mohs 7, abrasió 334 mm³, lliscament Rd 60 (classe 3) | Fitxa tècnica Gres Natural — ceramicaferres.com/download/14433/ |
| Origen de les argiles (Rojo 15 de la Bisbal, Arena 14 de Terol); −20 % de gas i −17 % d'electricitat per kg (2022); calor dels forns per assecar; minva del 10 % amb un 5 % reintroduït; neutralitat de carboni amb Tecnoambiente; residu inert i reciclable | Dossier de sostenibilitat — ceramicaferres.com/download/12010/ |
| Logotip (SVG), colors de marca `#903D00`, `#2E2E2D`, `#F1EEEA`, lletra Avenir | Codi de ceramicaferres.com |
| Carta d'esmalts (mostres) | ceramicaferres.com, imatges d'acabats |

## De fora (verificat)

| Dada | Font |
|---|---|
| La direcció actual és la segona generació (cosins, fills dels fundadors) | [Ara, 2024](https://es.ara.cat/girona/resurgimiento-ladrillo-bisbal-emporda_130_5193745.html) |
| Dos forns continus a 1.024 °C durant 22 hores | [Ara, 2024](https://es.ara.cat/girona/resurgimiento-ladrillo-bisbal-emporda_130_5193745.html) |
| Garbet: Delta d'Or ADI-FAD 2020 (categoria Outdoor) | [ADI-FAD](https://www.youtube.com/watch?v=LI5mmCd3DIA) |
| Garbet: menció al Premi Catalunya d'Ecodisseny 2021 (modular, desmuntable, reparable i reutilitzable) | [Agència de Residus de Catalunya](https://www.youtube.com/watch?v=ybia58wNqiI) |
| Instagram @ferres_ceramica | Catàleg 2021 del client i Ceramistes La Bisbal |

## Valors orientatius (no són de Ferrés)

A petició de l'usuari (14-10-2026), la **resistència a la flexió** i la **duresa Mohs** de la terracota
Rojo 15, la terracota Arena 14 i el vidriat són valors orientatius del sector (rajola extrudida de
fang cuit, grup AIII de l'EN 14411) mentre Ferrés no en doni els seus: 15 / 12 / 15 N/mm² i
Mohs 6 / 5 / 5. A la web surten amb «≈» i una nota. Es canvien a `src/data/materials.ts` (`estimated`).
Els del gres (52,4 N/mm², Mohs 7) sí que són de la seva fitxa.

## Pendent de confirmar amb el client

- La resistència a la flexió i la duresa de la terracota i del vidriat (vegeu l'apartat anterior).

- Com es fa una filera o un motlle a Ferrés (qui la dibuixa, de quin material és, quant triga). La
  secció «De la filera a la peça» explica el principi de l'extrusió amb fotos seves; els detalls del
  taller s'han de demanar.
- El vídeo «Tierra, Agua, Aire y Fuego» (Vimeo 114665770) és privat: si el client el té, pot
  substituir o completar els clips generats.
- Si volen que surtin noms de la família a la web.
- A la fitxa del Gres, la dilatació tèrmica surt com «5,6 x 10,6»; la web ho mostra com
  5,6 × 10⁻⁶/°C. Confirmar-ho.
- L'inventari d'emissions de 2022 dona un total de 1.195 t CO₂e, però les partides sumen 1.314 t:
  la web no publica cap xifra absoluta fins que el client ho aclareixi.
- Textos legals: mentre això sigui una proposta, el peu enllaça l'avís legal i la privacitat de la
  web actual.

## Vídeo

Els clips de `public/video/` són generats amb IA (MiniMax H3) a partir de fotografies pròpies de
Ferrés publicades a la seva web: el de l'inici, de la foto d'estudi de les gelosies Volta; els quatre
del taller, de fotos del taller. La web ho diu al costat dels clips del taller. No s'ha
fet servir cap foto de projecte d'arquitecte com a base de vídeo.
