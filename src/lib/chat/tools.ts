import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const chatTools: Tool[] = [
  {
    name: "get_menu",
    description:
      "Récupère les plats disponibles au restaurant. Peut filtrer par catégorie (entree, plat, dessert) et source (carte = carte permanente, marche = menu du marché/jour).",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: ["entree", "plat", "dessert"],
          description: "Filtrer par catégorie de plat",
        },
        source: {
          type: "string",
          enum: ["carte", "marche"],
          description: "Filtrer par source : carte (permanente) ou marche (du jour)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_wines",
    description:
      "Récupère la carte des vins du restaurant. Peut filtrer par couleur.",
    input_schema: {
      type: "object" as const,
      properties: {
        color: {
          type: "string",
          enum: ["rouge", "blanc", "rosé", "petillant"],
          description: "Filtrer par couleur de vin",
        },
      },
      required: [],
    },
  },
  {
    name: "get_drinks",
    description:
      "Récupère la carte des boissons (softs, cocktails, bières, spiritueux, boissons chaudes).",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: ["soft", "cocktail", "biere", "biere_pression", "biere_bouteille", "spiritueux", "hot", "autre"],
          description: "Filtrer par catégorie de boisson",
        },
      },
      required: [],
    },
  },
  {
    name: "get_events",
    description:
      "Récupère les prochains événements du restaurant (concerts, karaoké, soirées, etc.).",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_hours",
    description:
      "Récupère les horaires d'ouverture actuels et les éventuelles fermetures exceptionnelles.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "create_reservation",
    description:
      "Crée une réservation au restaurant. Tous les champs sont obligatoires. Le client recevra un email de confirmation.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Nom complet du client" },
        email: { type: "string", description: "Email du client" },
        phone: { type: "string", description: "Téléphone du client" },
        date: { type: "string", description: "Date au format YYYY-MM-DD" },
        time: { type: "string", description: "Heure au format HH:MM" },
        guests: { type: "number", description: "Nombre de convives" },
        message: { type: "string", description: "Message optionnel (allergies, occasion spéciale, etc.)" },
      },
      required: ["name", "email", "phone", "date", "time", "guests"],
    },
  },
  {
    name: "get_client_profile",
    description:
      "Charge le profil d'un client identifié par son email, incluant ses préférences, allergies et historique de réservations.",
    input_schema: {
      type: "object" as const,
      properties: {
        email: { type: "string", description: "Email du client" },
      },
      required: ["email"],
    },
  },
  {
    name: "update_client_preferences",
    description:
      "Met à jour les préférences d'un client (allergies, régime, goûts). À utiliser quand le client mentionne de nouvelles préférences ou allergies.",
    input_schema: {
      type: "object" as const,
      properties: {
        email: { type: "string", description: "Email du client" },
        allergies: {
          type: "array",
          items: { type: "string" },
          description: "Liste des allergies",
        },
        dietary_preferences: {
          type: "array",
          items: { type: "string" },
          description: "Préférences alimentaires (végétarien, vegan, sans gluten, etc.)",
        },
        taste_notes: {
          type: "string",
          description: "Résumé des goûts et préférences culinaires du client",
        },
      },
      required: ["email"],
    },
  },
  {
    name: "get_reservations",
    description:
      "Consulte les réservations d'un client par email. Permet de vérifier si une réservation existe avant de la modifier ou l'annuler.",
    input_schema: {
      type: "object" as const,
      properties: {
        email: { type: "string", description: "Email du client" },
      },
      required: ["email"],
    },
  },
  {
    name: "cancel_reservation",
    description:
      "Annule une réservation existante par son ID. Vérifie d'abord que la réservation existe avec get_reservations.",
    input_schema: {
      type: "object" as const,
      properties: {
        reservation_id: { type: "string", description: "ID de la réservation à annuler" },
      },
      required: ["reservation_id"],
    },
  },
  {
    name: "get_google_reviews",
    description:
      "Récupère la note Google et les meilleurs avis clients du restaurant. Utilise cet outil quand un client demande les avis, la réputation ou la note du restaurant.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];
