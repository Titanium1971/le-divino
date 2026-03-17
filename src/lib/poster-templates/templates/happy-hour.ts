import type { PosterTemplate } from "../types";

export const happyHour: PosterTemplate = {
  id: "happy-hour",
  name: "Happy Hour",
  description: "Affiche pour happy hours et promotions boissons",
  icon: "🍹",
  eventTypes: ["animation"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom", type: "text", required: true, defaultFromEvent: "title" },
    { key: "timeRange", label: "Horaires", type: "text", required: true, placeholder: "Ex : 17h - 20h" },
    { key: "promoText", label: "Offre promotionnelle", type: "textarea", required: false, placeholder: "Ex : Cocktails à -50%, tapas offertes..." },
  ],
  colorScheme: { primary: "#EA580C", accent: "#FDE68A", background: "linear-gradient(135deg, #F97316, #EA580C)", text: "#FAF6F0" },
  aiPromptTemplate: `Affiche vibrante pour un Happy Hour "{{eventName}}" au restaurant Le Divino à Agde. Cocktails colorés, coucher de soleil méditerranéen, terrasse animée, glaçons et agrumes, ambiance afterwork décontractée. Tons orange sunset et doré. Style tropical chic.`,
  overlayStyle: "vignette",
};
