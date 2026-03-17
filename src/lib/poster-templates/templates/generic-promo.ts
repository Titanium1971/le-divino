import type { PosterTemplate } from "../types";

export const genericPromo: PosterTemplate = {
  id: "generic-promo",
  name: "Promotion Générale",
  description: "Affiche polyvalente pour tout type d'annonce",
  icon: "📢",
  eventTypes: ["custom", "animation", "karaoke", "concert", "private", "holiday"],
  orientations: ["portrait", "landscape"],
  variables: [
    { key: "title", label: "Titre", type: "text", required: true, defaultFromEvent: "title" },
    { key: "subtitle", label: "Sous-titre", type: "text", required: false, placeholder: "Ex : Une expérience unique" },
    { key: "description", label: "Description", type: "textarea", required: false, defaultFromEvent: "description" },
    { key: "ctaText", label: "Appel à l'action", type: "text", required: false, placeholder: "Ex : Réservez maintenant !" },
  ],
  colorScheme: { primary: "#1A0A0E", accent: "#C5A55A", background: "linear-gradient(135deg, #1A0A0E, #6B1A1A)", text: "#FAF6F0" },
  aiPromptTemplate: `Affiche promotionnelle professionnelle pour "{{title}}" au restaurant Le Divino à Agde. {{subtitle ? subtitle + '.' : ''}} Restaurant méditerranéen élégant, ambiance chaleureuse, lumière dorée. {{ctaText ? 'Message : ' + ctaText : ''}} Tons bordeaux et or, style premium.`,
  overlayStyle: "gradient-bottom",
};
