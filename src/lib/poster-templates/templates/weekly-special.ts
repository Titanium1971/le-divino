import type { PosterTemplate } from "../types";

export const weeklySpecial: PosterTemplate = {
  id: "weekly-special",
  name: "Offre de la Semaine",
  description: "Affiche pour promotions et offres hebdomadaires",
  icon: "🏷️",
  eventTypes: ["custom"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "title", label: "Titre de l'offre", type: "text", required: true, defaultFromEvent: "title" },
    { key: "description", label: "Description", type: "textarea", required: false, placeholder: "Ex : Entrée + Plat + Dessert avec une bouteille..." },
    { key: "price", label: "Prix", type: "price", required: false, placeholder: "Ex : 25€" },
    { key: "validDates", label: "Validité", type: "text", required: false, placeholder: "Ex : Du lundi au vendredi" },
  ],
  colorScheme: { primary: "#7C2D12", accent: "#C5A55A", background: "linear-gradient(135deg, #FAF6F0, #7C2D12)", text: "#1A0A0E" },
  aiPromptTemplate: `Commercial poster for weekly special "{{title}}" at restaurant Le Divino in Agde, France. Appetizing gourmet dish, refined presentation, Mediterranean terroir. Premium menu board style, readable and attractive. The poster MUST display the following text with elegant, highly legible typography: the title "{{title}}" prominently at the top, {{description ? '"{{description}}" as offer details,' : ''}} {{price ? 'the price "{{price}}" in large bold text,' : ''}} {{validDates ? '"{{validDates}}" as validity period,' : ''}} and "Le Divino" at the bottom. Use strong contrast for all text.`,
  overlayStyle: "minimal",
};
