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
  aiPromptTemplate: `Affiche festive pour une soirée karaoké "{{eventName}}" au restaurant Le Divino à Agde. Micro vintage, lumières néon violettes et roses, ambiance fun et conviviale, scène de restaurant élégant, notes de musique, reflets sur verres de vin. Style moderne et dynamique.`,
  overlayStyle: "vignette",
};
