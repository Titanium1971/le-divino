import type { PosterTemplate } from "../types";

export const privateParty: PosterTemplate = {
  id: "private-party",
  name: "Soirée Privée",
  description: "Affiche pour événements privés et réceptions",
  icon: "✨",
  eventTypes: ["private"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom de l'événement", type: "text", required: true, defaultFromEvent: "title" },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "time", label: "Heure", type: "time", required: false, defaultFromEvent: "event_time" },
    { key: "hostName", label: "Hôte / Organisateur", type: "text", required: false, placeholder: "Ex : Famille Dupont" },
  ],
  colorScheme: { primary: "#1A0A0E", accent: "#C5A55A", background: "linear-gradient(135deg, #1A0A0E, #2D1B1E)", text: "#FAF6F0" },
  aiPromptTemplate: `Elegant private party visual background for a restaurant event poster. Intimate private room, candles, white tablecloths, crystal chandelier, flowers, exclusive atmosphere. Black, gold and burgundy tones. Luxury invitation style. Do NOT include any text, letters, words, numbers, or typography in the image. Leave the bottom 35% of the image less busy and slightly darker for text overlay. The image must be purely visual.`,
  overlayStyle: "gradient-bottom",
};
