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
  aiPromptTemplate: `Vibrant Happy Hour poster for "{{eventName}}" at restaurant Le Divino in Agde, France. Colorful cocktails, Mediterranean sunset, lively terrace, ice cubes and citrus fruits, relaxed afterwork atmosphere. Orange sunset and golden tones. Tropical chic style. The poster MUST display the following text with elegant, highly legible typography: the title "{{eventName}}" prominently at the top, {{timeRange ? 'the schedule "{{timeRange}}",' : ''}} {{promoText ? '"{{promoText}}" as promotional offer,' : ''}} and "Le Divino" at the bottom. Use strong contrast for all text.`,
  overlayStyle: "vignette",
};
