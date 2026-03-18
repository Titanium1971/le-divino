import type { PosterTemplate } from "../types";

export const holidaySpecial: PosterTemplate = {
  id: "holiday-special",
  name: "Fête & Jour Férié",
  description: "Affiche pour fêtes et jours fériés",
  icon: "🎉",
  eventTypes: ["holiday"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom de la fête", type: "text", required: true, defaultFromEvent: "title" },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "specialOffer", label: "Offre spéciale", type: "textarea", required: false, placeholder: "Ex : Menu spécial à 45€, champagne offert..." },
  ],
  colorScheme: { primary: "#991B1B", accent: "#FDE68A", background: "linear-gradient(135deg, #1A0A0E, #991B1B)", text: "#FAF6F0" },
  aiPromptTemplate: `Festive holiday visual background for a restaurant event poster. Party decorations, golden string lights, elegantly set table, warm Mediterranean atmosphere. Red, gold and burgundy tones. Premium celebration style. Do NOT include any text, letters, words, numbers, or typography in the image. Leave the bottom 35% of the image less busy and slightly darker for text overlay. The image must be purely visual.`,
  overlayStyle: "gradient-bottom",
};
