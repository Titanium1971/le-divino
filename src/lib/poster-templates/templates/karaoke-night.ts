import type { PosterTemplate } from "../types";

export const karaokeNight: PosterTemplate = {
  id: "karaoke-night",
  name: "Soirée Karaoké",
  description: "Affiche pour soirées karaoké",
  icon: "🎤",
  eventTypes: ["karaoke"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "eventName", label: "Nom de l'événement", type: "text", required: true, defaultFromEvent: "title" },
    { key: "date", label: "Date", type: "date", required: true, defaultFromEvent: "event_date" },
    { key: "time", label: "Heure", type: "time", required: false, defaultFromEvent: "event_time" },
    { key: "tagline", label: "Accroche", type: "text", required: false, placeholder: "Ex : Venez chanter avec nous !" },
  ],
  colorScheme: { primary: "#6B21A8", accent: "#E879F9", background: "linear-gradient(135deg, #1A0A0E, #6B21A8)", text: "#FAF6F0" },
  aiPromptTemplate: `Festive karaoke night poster for "{{eventName}}" at restaurant Le Divino in Agde, France. Vintage microphone, purple and pink neon lights, fun and friendly atmosphere, elegant restaurant stage, music notes, wine glass reflections. Modern dynamic style. The poster MUST display the following text with elegant, highly legible typography: the title "{{eventName}}" prominently at the top, {{date ? 'the date "{{date}}",' : ''}} {{time ? 'the time "{{time}}",' : ''}} {{tagline ? '"{{tagline}}" as tagline,' : ''}} and "Le Divino" at the bottom. Use strong contrast for all text.`,
  overlayStyle: "vignette",
};
