import type { PosterTemplate } from "../types";

export const djSet: PosterTemplate = {
  id: "dj-set",
  name: "DJ Set",
  description: "Affiche pour soirées DJ",
  icon: "🎧",
  eventTypes: ["animation", "custom"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom de l'événement", type: "text", required: true, defaultFromEvent: "title" },
    { key: "djName", label: "Nom du DJ", type: "text", required: false, placeholder: "Ex : DJ Marco" },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "time", label: "Heure", type: "time", required: false, defaultFromEvent: "event_time" },
  ],
  colorScheme: { primary: "#0F172A", accent: "#38BDF8", background: "linear-gradient(135deg, #0F172A, #1E1B4B)", text: "#FAF6F0" },
  aiPromptTemplate: `Affiche de soirée DJ "{{eventName}}" au restaurant Le Divino à Agde. {{djName ? 'DJ : ' + djName + '.' : ''}} Platines vinyles, lumières LED néon bleu et cyan, ambiance lounge nocturne, silhouettes dansantes, bar élégant en arrière-plan. Style nightlife premium.`,
  overlayStyle: "full-overlay",
};
