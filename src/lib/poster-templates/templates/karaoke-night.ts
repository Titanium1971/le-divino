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
  aiPromptTemplate: `Festive karaoke night visual background for a restaurant event poster. Vintage microphone, purple and pink neon lights, fun and friendly atmosphere, elegant restaurant stage, music notes, wine glass reflections. Modern dynamic style. Do NOT include any text, letters, words, numbers, or typography in the image. Keep the center area open and edges rich for a vignette text overlay. The image must be purely visual.`,
  overlayStyle: "vignette",
};
