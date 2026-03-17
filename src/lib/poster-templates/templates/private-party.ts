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
  aiPromptTemplate: `Affiche élégante pour une soirée privée "{{eventName}}" au restaurant Le Divino à Agde. {{hostName ? 'Organisé par ' + hostName + '.' : ''}} Salle privée intime, bougies, nappes blanches, lustre en cristal, fleurs, ambiance exclusive. Tons noir, or et bordeaux. Style invitation de luxe.`,
  overlayStyle: "gradient-bottom",
};
