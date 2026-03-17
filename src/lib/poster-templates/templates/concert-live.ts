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
  aiPromptTemplate: `Affiche professionnelle pour un concert live "{{eventName}}" au restaurant Le Divino à Agde. {{artistName ? 'Artiste : ' + artistName + '.' : ''}} Ambiance chaleureuse méditerranéenne, scène avec lumières dorées et bordeaux, guitare ou instruments, terrasse en arrière-plan, typographie élégante, tons bleu nuit et or. Style affiche de concert haut de gamme.`,
  overlayStyle: "gradient-bottom",
};
