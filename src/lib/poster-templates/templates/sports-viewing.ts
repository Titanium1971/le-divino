import type { PosterTemplate } from "../types";

export const sportsViewing: PosterTemplate = {
  id: "sports-viewing",
  name: "Retransmission Sportive",
  description: "Affiche pour retransmissions de matchs et événements sportifs",
  icon: "⚽",
  eventTypes: ["animation"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Événement", type: "text", required: true, defaultFromEvent: "title" },
    { key: "sport", label: "Sport", type: "text", required: false, placeholder: "Ex : Football, Rugby, Tennis..." },
    { key: "teams", label: "Équipes / Match", type: "text", required: false, placeholder: "Ex : France vs Espagne" },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "kickoff", label: "Coup d'envoi", type: "time", required: false, defaultFromEvent: "event_time" },
  ],
  colorScheme: { primary: "#065F46", accent: "#34D399", background: "linear-gradient(135deg, #064E3B, #065F46)", text: "#FAF6F0" },
  aiPromptTemplate: `Dynamic sports viewing visual background for a restaurant event poster. Big screen, supporters atmosphere, beers and snacks, flags. Green and emerald tones, sporty energy, premium stadium style. Do NOT include any text, letters, words, numbers, or typography in the image. Keep the right 40% of the image less detailed and darker for text placement. The image must be purely visual.`,
  overlayStyle: "split-right",
};
