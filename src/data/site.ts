/**
 * Dades de contacte de Ceràmica Ferrés, tal com surten a la seva web (ceramicaferres.com/about/,
 * consultada el 14-10-2026). Si canvien, es canvien aquí i prou.
 */
export const site = {
  name: "Ceràmica Ferrés",
  legalName: "Ceràmica Ferrés, S.L.",
  founded: 1956,
  url: "https://ceramicaferres.com",
  email: "contact@ceramicaferres.com",
  phone: "+34 972 630 027",
  phoneHref: "tel:+34972630027",
  address: {
    street: "Ctra. de Girona a Palamós, C-66, km 12",
    postalCode: "17121",
    locality: "Corçà",
    region: "Girona",
    country: "ES",
  },
  /** Enllaç de la seva pròpia web («Ver en Google Maps»). */
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cer%C3%A0mica+Ferr%C3%A9s+Cor%C3%A7%C3%A0",
  social: {
    instagram: "https://www.instagram.com/ferres_ceramica/",
    facebook: "https://www.facebook.com/ceramicaferres/",
    pinterest: "https://www.pinterest.com/ceramicaferres/",
  },
  /** Textos legals vigents del client. Mentre aquesta web sigui una proposta, s'hi enllaça. */
  legal: {
    notice: "https://ceramicaferres.com/aviso-legal/",
    privacy: "https://ceramicaferres.com/politica-de-privacidad/",
  },
} as const;
