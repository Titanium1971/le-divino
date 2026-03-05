export const restaurantConfig = {
  // Identity
  name: "Le Divino",
  tagline: "Cuisine traditionnelle française",
  description: "Restaurant de cuisine traditionnelle française au cœur d'Agde.",

  // Location
  address: {
    street: "5 place Jean Jaurès",
    city: "Agde",
    postalCode: "34300",
    country: "France",
    region: "Occitanie",
  },
  coordinates: {
    lat: 43.3108,
    lng: 3.4756,
  },

  // Contact
  phone: "04 48 17 78 75",
  phoneIntl: "+33448177875",
  email: "contact@ledivino-agde.fr",
  website: "https://ledivino.fr",

  // Social
  social: {
    instagram: "https://www.instagram.com/ledivinoagde/",
    facebook: "https://www.facebook.com/profile.php?id=61586295202337",
    tripadvisor: "",
    google: "",
  },

  // Google Maps directions URL
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=5+place+Jean+Jaur%C3%A8s+34300+Agde",

  // Business hours (ISO day: 1=Monday, 7=Sunday)
  // Single continuous opening: open → close
  hours: [
    { day: 1 as const, open: "09:00", close: "23:30" },
    { day: 2 as const, open: "09:00", close: "23:30" },
    { day: 3 as const, open: "09:00", close: "23:30" },
    { day: 4 as const, open: "09:00", close: "23:30" },
    { day: 5 as const, open: "09:00", close: "01:00" },
    { day: 6 as const, open: "09:00", close: "01:00" },
    { day: 7 as const, open: "09:00", close: "15:30" },
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
