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
  aiPromptTemplate: `Commercial visual background for a restaurant weekly special poster. Appetizing gourmet dish, refined presentation, Mediterranean terroir. Premium food photography style, clean and attractive. Do NOT include any text, letters, words, numbers, or typography in the image. Keep the image clean with clear focal area; text will be positioned at top and bottom. The image must be purely visual.`,
  overlayStyle: "minimal",
};
