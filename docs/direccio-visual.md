# Direcció visual

Surt del client, no del costum. Cada tria diu d'on ve.

| | Tria | D'on ve |
|---|---|---|
| Color dominant | **Calç** `#F1EEEA`, alternant amb `#E7E2DB` per seccions | El fons exacte de la seva web actual, i el to de les seves fotos d'estudi (fons gris clar). L'usuari va demanar una base més clara el 14-10-2026; abans era fosca. |
| Text i ancoratge fosc | **Carbó** `#2E2E2D` (text i peu de pàgina) | El color del text de la seva web. |
| Accent | **Terra** `#903D00` (botons, titulars de secció, panells) i **Argila cuita** `#D7793F` (només sobre fosc) | `#903D00` és el `fill` del logotip SVG de la seva web. L'argila cuita és el to de les peces acabades a les seves fotos. |
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
| Inici | Vídeo lligat al scroll (`scroll-video`) | La seva foto d'estudi de les gelosies Volta: llum que es mou i ombres d'arcs a terra. (La primera versió, la barra de fang a l'extrusora, era massa fosca i ensenyava massa maquinària.) |
| De la filera a la peça | 3D (`scroll-3d-scenes`) | Una celosia és un perfil extruït: es modela exactament com es fabrica (`ExtrudeGeometry`). |
| El taller | Vídeo lligat al scroll, muntatge de clips curts | Fotos reals de taller animades; fos entre passos, no recorregut continu. |
| Anatomia del material | CSS 3D (vista explosionada) | A l'inici, versió curta que s'explica sola; el detall interactiu (material, esmalt, comparativa) és a la pàgina de materials. |
| Projectes, col·leccions, a mida, sostenibilitat | CSS + `IntersectionObserver` | Entrades discretes: les escenes fortes són dues. |
