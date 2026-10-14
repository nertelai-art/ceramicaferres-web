/**
 * Les imatges del web ja estan preparades a tres amplades (`pnpm images`), així que no cal
 * l'optimitzador de Next: cada petició és un fitxer estàtic. Next demana una amplada i aquí se li
 * dona el fitxer més petit que la cobreix. `/images/foto.webp` → `/images/foto-1080.webp`.
 */
export const imageWidths = [640, 1080, 1600] as const;

export default function imageLoader({ src, width }: { src: string; width: number }) {
  if (!src.startsWith("/images/") || !src.endsWith(".webp")) return src;
  const fit = imageWidths.find((candidate) => candidate >= width) ?? imageWidths[imageWidths.length - 1];
  return src.replace(/\.webp$/, `-${fit}.webp`);
}
