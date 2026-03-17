import type { PosterTemplate } from "../types";

export const privateParty: PosterTemplate = {
  id: "private-party",
  name: "Soirée Privée",
  description: "Affiche pour événements privés et réceptions",
  icon: "✨",
  eventTypes: ["private"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom de l'événement", type: "text", required: true, defaultFromEvent: "title" },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "time", label: "Heure", type: "time", required: false, defaultFromEvent: "event_time" },
    { key: "hostName", label: "Hôte / Organisateur", type: "text", required: false, placeholder: "Ex : Famille Dupont" },
  ],
  colorScheme: { primary: "#1A0A0E", accent: "#C5A55A", background: "linear-gradient(135deg, #1A0A0E, #2D1B1E)", text: "#FAF6F0" },
  aiPromptTemplate: `Elegant private party poster for "{{eventName}}" at restaurant Le Divino in Agde, France. {{hostName ? 'Hosted by ' + hostName + '.' : ''}} Intimate private room, candles, white tablecloths, crystal chandelier, flowers, exclusive atmosphere. Black, gold and burgundy tones. Luxury invitation style. The poster MUST display the following text with elegant, highly legible typography: the title "{{eventName}}" prominently at the top, {{hostName ? '"Hosted by {{hostName}}",' : ''}} {{date ? 'the date "{{date}}",' : ''}} {{time ? 'the time "{{time}}",' : ''}} and "Le Divino" at the bottom. Use strong contrast for all text.`,
  overlayStyle: "gradient-bottom",
};
