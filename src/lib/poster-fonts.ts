export type PosterFont = {
  id: string;
  name: string;
  family: string;
  url: string; // Google Fonts CSS2 API URL for the woff2 file
  category: "serif" | "sans-serif" | "display";
  weights: number[];
};

export const POSTER_FONTS: PosterFont[] = [
  {
    id: "playfair-display",
    name: "Playfair Display",
    family: "Playfair Display",
    url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap",
    category: "serif",
    weights: [400, 700, 900],
  },
  {
    id: "cormorant-garamond",
    name: "Cormorant Garamond",
    family: "Cormorant Garamond",
    url: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap",
    category: "serif",
    weights: [400, 600, 700],
  },
  {
    id: "cinzel",
    name: "Cinzel",
    family: "Cinzel",
    url: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap",
    category: "display",
    weights: [400, 700, 900],
  },
  {
    id: "montserrat",
    name: "Montserrat",
    family: "Montserrat",
    url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap",
    category: "sans-serif",
    weights: [400, 600, 700, 800],
  },
  {
    id: "lora",
    name: "Lora",
    family: "Lora",
    url: "https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap",
    category: "serif",
    weights: [400, 600, 700],
  },
  {
    id: "dm-serif-display",
    name: "DM Serif Display",
    family: "DM Serif Display",
    url: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap",
    category: "display",
    weights: [400],
  },
  {
    id: "josefin-sans",
    name: "Josefin Sans",
    family: "Josefin Sans",
    url: "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&display=swap",
    category: "sans-serif",
    weights: [400, 600, 700],
  },
  {
    id: "libre-baskerville",
    name: "Libre Baskerville",
    family: "Libre Baskerville",
    url: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap",
    category: "serif",
    weights: [400, 700],
  },
];

export function getPosterFont(id: string): PosterFont {
  return POSTER_FONTS.find((f) => f.id === id) || POSTER_FONTS[0];
}
