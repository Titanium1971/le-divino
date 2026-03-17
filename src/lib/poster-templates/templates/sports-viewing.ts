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
  aiPromptTemplate: `Dynamic sports viewing poster for "{{eventName}}" at restaurant Le Divino in Agde, France. {{teams ? 'Match: ' + teams + '.' : ''}} Big screen, supporters atmosphere, beers and snacks, flags. {{sport ? 'Sport: ' + sport + '.' : ''}} Green and emerald tones, sporty energy, premium stadium style. The poster MUST display the following text with elegant, highly legible typography: the title "{{eventName}}" prominently at the top, {{teams ? '"{{teams}}" as the match,' : ''}} {{date ? 'the date "{{date}}",' : ''}} {{kickoff ? 'kick-off time "{{kickoff}}",' : ''}} and "Le Divino" at the bottom. Use strong contrast for all text.`,
  overlayStyle: "split-right",
};
