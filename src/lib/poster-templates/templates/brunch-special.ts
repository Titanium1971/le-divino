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
  aiPromptTemplate: `Gourmet brunch poster for "{{eventName}}" at restaurant Le Divino in Agde, France. Table set on sunny terrace, golden pastries, eggs Benedict, fresh orange juice, champagne. Warm morning light, relaxed Mediterranean atmosphere. Premium food photography style. The poster MUST display the following text with elegant, highly legible typography: the title "{{eventName}}" prominently at the top, {{date ? 'the date "{{date}}",' : ''}} {{timeRange ? 'the schedule "{{timeRange}}",' : ''}} {{price ? 'the price "{{price}}",' : ''}} {{menuHighlight ? '"{{menuHighlight}}" as menu highlights,' : ''}} and "Le Divino" at the bottom. Use strong contrast for all text.`,
  overlayStyle: "minimal",
};
