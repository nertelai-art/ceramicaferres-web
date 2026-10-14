# Direcció visual

Surt del client, no del costum. Cada tria diu d'on ve.

| | Tria | D'on ve |
|---|---|---|
| Color dominant | **Forn** `#16120F`, negre càlid | El text de la marca és carbó (`#2E2E2D`) i el logotip, terracota: marca fosca i taronja. El procés acaba dins d'un forn. |
| Accent | **Terra** `#903D00` (panells, titulars grans) i **Argila cuita** `#D7793F` (text petit sobre fosc) | `#903D00` és el `fill` del logotip SVG de la seva web. L'argila cuita és el to de les peces acabades a les seves fotos. |
| Superfície clara | **Calç** `#F1EEEA` | El fons exacte de la seva web actual. Va on hi ha fotos d'estudi (fons gris clar) i fitxes tècniques. |
| Tipografia | Titular **Bricolage Grotesque** (pesada i estreta, `opsz` alt). Text **Figtree**. | Les lletres del logotip FERRÉS són gruixudes i tallades amb bisells: Bricolage en pes alt hi rima sense copiar-lo. Figtree és l'alternativa oberta més propera a Avenir, la lletra de la seva web. |
| Motiu gràfic | **Perfils de secció** en línia fina (la forma de la filera) i línies horitzontals d'extrusió | Les celosies de Ferrés són perfils extruïts: el dibuix de secció és literalment el motlle. La seva web ja fa servir dibuixos de línia per a cada família. |

Altres colors només dins de producte i anatomia, com a esmalts: cobalt `#22409A` (peces Garbet
blaves), groc `#E3B04B` (Volta groga), blanc d'esmalt `#F4F1EA`.

## Per què no el costum

Les dues últimes webs fetes aquí (culleramotor i theanimalsobservatory) són Archivo sobre gris fred
i Archivo sobre paper crema. Aquí no hi ha Archivo, ni serif de titular, ni rètols en mono: les xifres
tècniques van en Figtree amb `tabular-nums`.

## Tècnica per secció

| Secció | Tècnica | Per què |
|---|---|---|
| Inici | Vídeo lligat al scroll (`scroll-video`) | La foto pròpia de la barra de fang amb «CERAMICA FERRES» imprès: moviment real, poc a inventar. |
| De la filera a la peça | 3D (`scroll-3d-scenes`) | Una celosia és un perfil extruït: es modela exactament com es fabrica (`ExtrudeGeometry`). |
| El taller | Vídeo lligat al scroll, muntatge de clips curts | Fotos reals de taller animades; fos entre passos, no recorregut continu. |
| Anatomia del material | 3D (vista explosionada) + dades en HTML | Capes (esmalt, cos ceràmic, porus) i propietats que es poden llegir i indexar. |
| Projectes, col·leccions, a mida, sostenibilitat | CSS + `IntersectionObserver` | Entrades discretes: les escenes fortes són dues. |
