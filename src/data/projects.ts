import type { Locale } from "@/i18n/config";

/**
 * Selecció d'obres de la pàgina de projectes de Ferrés (ceramicaferres.com/proyectos/). Títols i
 * crèdits tal com els publica el client; el francès és traducció nostra. La peça de My Brain surt
 * de la galeria de la fitxa de Volta, on el client hi associa aquest projecte.
 */
export type CreditRole = "architecture" | "interior" | "design" | "photo";

export interface Project {
  slug: string;
  title: Record<Locale, string>;
  credits: { role: CreditRole; name: string }[];
  products: string[];
  image: string;
}

export const PROJECTS: readonly Project[] = [
  {
    slug: "my-brain",
    title: { ca: "My Brain, Barcelona", es: "My Brain, Barcelona", en: "My Brain, Barcelona", fr: "My Brain, Barcelone" },
    credits: [
      { role: "architecture", name: "Two Bo" },
      { role: "photo", name: "José Hevia" },
    ],
    products: ["Volta"],
    image: "/images/projectes/my-brain.webp",
  },
  {
    slug: "dynamed",
    title: { ca: "Dynámed, Xangai", es: "Dynámed, Shanghái", en: "Dynámed, Shanghai", fr: "Dynámed, Shanghai" },
    credits: [{ role: "architecture", name: "Atelier Pacific" }],
    products: ["Garbet"],
    image: "/images/projectes/dynamed.webp",
  },
  {
    slug: "escola-gavina",
    title: {
      ca: "Pavelló Docent Polivalent Escola Gavina, València",
      es: "Pabellón Docente Polivalente Escola Gavina, Valencia",
      en: "Sport Pavilion of Gavina School, Valencia",
      fr: "Pavillon polyvalent de l'école Gavina, Valence",
    },
    credits: [
      { role: "architecture", name: "C. Martínez, C. Gradolí, A. Sanz" },
      { role: "photo", name: "M. Apollonio" },
    ],
    products: ["Estartit"],
    image: "/images/projectes/escola-gavina.webp",
  },
  {
    slug: "four-seasons",
    title: { ca: "Hotel Four Seasons, Mallorca", es: "Hotel Four Seasons, Mallorca", en: "Four Seasons Hotel, Mallorca", fr: "Hôtel Four Seasons, Majorque" },
    credits: [{ role: "architecture", name: "Estudio Lamela Arquitectos" }],
    products: ["Empúries"],
    image: "/images/projectes/four-seasons.webp",
  },
  {
    slug: "club-rangoon",
    title: { ca: "Club Rangoon, Singapur", es: "Club Rangoon, Singapur", en: "Club Rangoon, Singapore", fr: "Club Rangoon, Singapour" },
    credits: [
      { role: "architecture", name: "Hui Designs" },
      { role: "photo", name: "Form Practice" },
    ],
    products: ["Cuadrada", "Corner Arc 90", "Cartabón", "Lisa"],
    image: "/images/projectes/club-rangoon.webp",
  },
  {
    slug: "museu-alacant",
    title: {
      ca: "Museu de les Col·leccions Naturals de la Universitat, Alacant",
      es: "Museo de las Colecciones Naturales de la Universidad, Alicante",
      en: "Natural Collections Museum of the University of Alicante",
      fr: "Musée des collections naturelles de l'Université d'Alicante",
    },
    credits: [
      { role: "architecture", name: "Cor Asociados Arquitectos" },
      { role: "photo", name: "David Frutos" },
    ],
    products: ["Cuadrada"],
    image: "/images/projectes/museu-alacant.webp",
  },
  {
    slug: "disfrutar",
    title: { ca: "Restaurant Disfrutar, Barcelona", es: "Restaurante Disfrutar, Barcelona", en: "Disfrutar Restaurant, Barcelona", fr: "Restaurant Disfrutar, Barcelone" },
    credits: [
      { role: "architecture", name: "El Equipo Creativo" },
      { role: "photo", name: "Francesc Guillamet" },
    ],
    products: ["Estartit", "Cuadrada", "Palamós"],
    image: "/images/projectes/disfrutar.webp",
  },
  {
    slug: "casa-pin-8",
    title: { ca: "Casa PIN-8", es: "Casa PIN-8", en: "House PIN-8", fr: "Maison PIN-8" },
    credits: [
      { role: "architecture", name: "PMMT Arquitectura" },
      { role: "photo", name: "Del Rio Bani" },
    ],
    products: ["Montgrí"],
    image: "/images/projectes/casa-pin-8.webp",
  },
  {
    slug: "central-bar",
    title: { ca: "Central Bar, València", es: "Central Bar, Valencia", en: "Central Bar, Valencia", fr: "Central Bar, Valence" },
    credits: [
      { role: "architecture", name: "Francesc Rifé Studio" },
      { role: "photo", name: "Fernando Alda" },
    ],
    products: ["Rosas", "Lisa"],
    image: "/images/projectes/central-bar.webp",
  },
];

/** L'obra de Garbet a Milà, per a la secció «A mida». */
export const GARBET_MILAN = {
  credits: [
    { role: "design" as const, name: "Emiliana Design Studio" },
    { role: "photo" as const, name: "Germano Borrelli" },
  ],
};
