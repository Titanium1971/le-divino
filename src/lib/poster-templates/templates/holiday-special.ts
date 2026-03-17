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
  aiPromptTemplate: `Affiche festive pour "{{eventName}}" au restaurant Le Divino à Agde. Décoration de fête, guirlandes lumineuses dorées, table dressée avec élégance, ambiance chaleureuse et méditerranéenne. Tons rouge, or et bordeaux. Style célébration premium.`,
  overlayStyle: "gradient-bottom",
};
