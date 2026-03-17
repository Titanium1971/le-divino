import type { PosterTemplate } from "../types";

export const concertLive: PosterTemplate = {
  id: "concert-live",
  name: "Soirée Concert",
  description: "Affiche pour concerts et musique live",
  icon: "🎸",
  eventTypes: ["concert"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom de l'événement", type: "text", required: true, defaultFromEvent: "title" },
    { key: "artistName", label: "Artiste / Groupe", type: "text", required: false, placeholder: "Ex : Jazz Quartet" },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "time", label: "Heure", type: "time", required: false, defaultFromEvent: "event_time" },
    { key: "tagline", label: "Accroche", type: "text", required: false, placeholder: "Ex : Une soirée inoubliable" },
  ],
  colorScheme: { primary: "#1E3A5F", accent: "#C5A55A", background: "linear-gradient(135deg, #1A0A0E, #1E3A5F)", text: "#FAF6F0" },
  aiPromptTemplate: `Professional concert poster for "{{eventName}}" at restaurant Le Divino in Agde, France. {{artistName ? 'Featuring artist: ' + artistName + '.' : ''}} Warm Mediterranean atmosphere, stage with golden and burgundy lights, guitar or instruments, terrace in background. Navy blue and gold tones. Premium concert poster style. The poster MUST display the following text with elegant, highly legible typography: the title "{{eventName}}" prominently at the top, {{artistName ? '"' + artistName + '" as the artist name,' : ''}} {{date ? 'the date "{{date}}",' : ''}} {{time ? 'the time "{{time}}",' : ''}} {{tagline ? '"{{tagline}}" as tagline,' : ''}} and "Le Divino" at the bottom. Use strong contrast for all text.`,
  overlayStyle: "gradient-bottom",
};
