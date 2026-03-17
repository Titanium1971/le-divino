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
  aiPromptTemplate: `Premium DJ party poster for "{{eventName}}" at restaurant Le Divino in Agde, France. {{djName ? 'Featuring DJ: ' + djName + '.' : ''}} Vinyl turntables, blue and cyan neon LED lights, nocturnal lounge atmosphere, dancing silhouettes, elegant bar in background. Premium nightlife style. The poster MUST display the following text with elegant, highly legible typography: the title "{{eventName}}" prominently at the top, {{djName ? '"' + djName + '" as DJ name,' : ''}} {{date ? 'the date "{{date}}",' : ''}} {{time ? 'the time "{{time}}",' : ''}} and "Le Divino" at the bottom. Use strong contrast for all text.`,
  overlayStyle: "full-overlay",
};
