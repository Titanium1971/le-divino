export const restaurantConfig = {
  // Identity
  name: "Le Divino",
  tagline: "Cuisine traditionnelle française",
  description: "Restaurant de cuisine traditionnelle française au cœur d'Agde.",

  // Location
  address: {
    street: "5 Place Jean Jaurès",
    city: "Agde",
    postalCode: "34300",
    country: "France",
    region: "Occitanie",
  },
  coordinates: {
    lat: 43.3108,
    lng: 3.4731,
  },

  // Contact
  phone: "04 48 17 78 75",
  email: "contact@ledivino-agde.fr",
  website: "https://ledivino.fr",

  // Social
  social: {
    instagram: "",
    facebook: "",
    tripadvisor: "",
    google: "",
  },

  // Business hours (ISO day: 1=Monday, 7=Sunday)
  hours: [
    { day: 1 as const, open: null, close: null, dinnerOpen: null, dinnerClose: null },
    { day: 2 as const, open: "12:00", close: "14:30", dinnerOpen: "19:00", dinnerClose: "22:30" },
    { day: 3 as const, open: "12:00", close: "14:30", dinnerOpen: "19:00", dinnerClose: "22:30" },
    { day: 4 as const, open: "12:00", close: "14:30", dinnerOpen: "19:00", dinnerClose: "22:30" },
    { day: 5 as const, open: "12:00", close: "14:30", dinnerOpen: "19:00", dinnerClose: "22:30" },
    { day: 6 as const, open: "12:00", close: "14:30", dinnerOpen: "19:00", dinnerClose: "23:00" },
    { day: 7 as const, open: "12:00", close: "14:30", dinnerOpen: "19:00", dinnerClose: "22:30" },
  ],

  // Reservation settings
  reservation: {
    maxGuests: 12,
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    timeSlotMinutes: 30,
  },

  // SEO & Structured Data
  seo: {
    cuisineType: "FrenchCuisine",
    priceRange: "$$",
    servesCuisine: ["French", "Traditional"],
  },

  // Theme
  theme: {
    primaryColor: "#6B1A1A",
    accentColor: "#C5962C",
    font: "Raleway",
  },

  // Display screen settings (55")
  display: {
    slideDurationMs: 8000,
    transitionMs: 1000,
    showPrices: true,
  },
} as const;

export type RestaurantConfig = typeof restaurantConfig;
