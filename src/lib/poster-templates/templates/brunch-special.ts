import type { PosterTemplate } from "../types";

export const brunchSpecial: PosterTemplate = {
  id: "brunch-special",
  name: "Brunch Gourmand",
  description: "Affiche pour brunchs et événements matinaux",
  icon: "🥐",
  eventTypes: ["custom"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom de l'événement", type: "text", required: true, defaultFromEvent: "title" },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "timeRange", label: "Horaires", type: "text", required: false, placeholder: "Ex : 10h - 14h" },
    { key: "price", label: "Tarif", type: "price", required: false, placeholder: "Ex : 29€/personne" },
    { key: "menuHighlight", label: "Points forts du menu", type: "textarea", required: false, placeholder: "Ex : Viennoiseries maison, œufs Benedict, champagne..." },
  ],
  colorScheme: { primary: "#92400E", accent: "#FDE68A", background: "linear-gradient(135deg, #FEF3C7, #92400E)", text: "#1A0A0E" },
  aiPromptTemplate: `Affiche gourmande pour un brunch "{{eventName}}" au restaurant Le Divino à Agde. Table dressée en terrasse ensoleillée, viennoiseries dorées, œufs Benedict, jus d'orange pressé, champagne. Lumière matinale chaude, ambiance méditerranéenne détendue. Style food photography premium.`,
  overlayStyle: "minimal",
};
