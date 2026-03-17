import type { PosterTemplate } from "../types";

export const themedNight: PosterTemplate = {
  id: "themed-night",
  name: "Soirée à Thème",
  description: "Affiche pour soirées à thème",
  icon: "🎭",
  eventTypes: ["custom", "animation"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom de la soirée", type: "text", required: true, defaultFromEvent: "title" },
    { key: "theme", label: "Thème", type: "text", required: true, placeholder: "Ex : Années 80, Méditerranée, Mascarade..." },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "time", label: "Heure", type: "time", required: false, defaultFromEvent: "event_time" },
    { key: "dressCode", label: "Dress code", type: "text", required: false, placeholder: "Ex : Tenue de soirée exigée" },
  ],
  colorScheme: { primary: "#4C1D95", accent: "#C5A55A", background: "linear-gradient(135deg, #1A0A0E, #4C1D95)", text: "#FAF6F0" },
  aiPromptTemplate: `Affiche immersive pour une soirée à thème "{{eventName}}" (thème : {{theme}}) au restaurant Le Divino à Agde. Décoration thématique élaborée, éclairage d'ambiance, salle de restaurant transformée. {{dressCode ? 'Dress code : ' + dressCode + '.' : ''}} Style événementiel luxueux et créatif.`,
  overlayStyle: "full-overlay",
};
