import type { PosterTemplate } from "../types";

export const wineTasting: PosterTemplate = {
  id: "wine-tasting",
  name: "Dégustation Vins",
  description: "Affiche pour dégustations et soirées oenologiques",
  icon: "🍷",
  eventTypes: ["custom", "animation"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom de l'événement", type: "text", required: true, defaultFromEvent: "title" },
    { key: "wineRegion", label: "Région / Domaine", type: "text", required: false, placeholder: "Ex : Languedoc, Côtes du Rhône" },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "time", label: "Heure", type: "time", required: false, defaultFromEvent: "event_time" },
    { key: "price", label: "Tarif", type: "price", required: false, placeholder: "Ex : 35€/personne" },
  ],
  colorScheme: { primary: "#6B1A1A", accent: "#C5A55A", background: "linear-gradient(135deg, #1A0A0E, #6B1A1A)", text: "#FAF6F0" },
  aiPromptTemplate: `Elegant wine tasting visual background for a restaurant event poster. Wine bottles, crystal glasses, Mediterranean vineyard, amber lighting, wooden barrel. Burgundy and gold tones, refined gastronomic atmosphere. Do NOT include any text, letters, words, numbers, or typography in the image. Keep the left 40% of the image less detailed and darker for text placement. The image must be purely visual.`,
  overlayStyle: "split-left",
};
