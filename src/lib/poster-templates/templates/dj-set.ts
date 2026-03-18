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
  aiPromptTemplate: `Premium DJ party visual background for a restaurant event poster. Vinyl turntables, blue and cyan neon LED lights, nocturnal lounge atmosphere, dancing silhouettes, elegant bar in background. Premium nightlife style. Do NOT include any text, letters, words, numbers, or typography in the image. Keep the overall image slightly darker and muted, suitable for overlaid text across the full surface. The image must be purely visual.`,
  overlayStyle: "full-overlay",
};
