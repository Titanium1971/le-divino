import { restaurantConfig } from "@/restaurant.config";
import type { Horaires } from "@/lib/supabase/horaires";

export const SITE_URL = "https://www.ledivino-agde.fr";

const c = restaurantConfig;

const DAY_MAP: Record<keyof Horaires, string> = {
  lundi: "Mo",
  mardi: "Tu",
  mercredi: "We",
  jeudi: "Th",
  vendredi: "Fr",
  samedi: "Sa",
  dimanche: "Su",
};

const DAY_KEYS: (keyof Horaires)[] = [
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
];

export function buildRestaurantJsonLd(
  horaires: Horaires,
  rating?: { ratingValue: string; ratingCount: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: c.name,
    description: c.description,
    url: SITE_URL,
    telephone: c.phoneIntl,
    email: c.email,
    image: `${SITE_URL}/images/hero-exterior-night.jpg`,
    priceRange: c.seo.priceRange,
    servesCuisine: c.seo.servesCuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: c.address.street,
      addressLocality: c.address.city,
      postalCode: c.address.postalCode,
      addressRegion: c.address.region,
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: c.coordinates.lat,
      longitude: c.coordinates.lng,
    },
    openingHoursSpecification: DAY_KEYS
      .filter((key) => horaires[key].ouvert)
      .map((key) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_MAP[key],
        opens: horaires[key].debut,
        closes: horaires[key].fin,
      })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating?.ratingValue ?? "4.9",
      bestRating: "5",
      ratingCount: rating?.ratingCount ?? "76",
    },
    sameAs: [c.social.instagram, c.social.facebook].filter(Boolean),
    acceptsReservations: "True",
    menu: `${SITE_URL}/menu`,
    logo: `${SITE_URL}/images/logo-divino.jpg`,
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/reservation`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "FoodEstablishmentReservation",
        name: "Réservation Le Divino",
      },
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-divino.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: c.phoneIntl,
      contactType: "reservations",
      availableLanguage: ["French", "English", "Italian", "Spanish", "German"],
    },
    sameAs: [c.social.instagram, c.social.facebook].filter(Boolean),
  };
}

export function buildFaqJsonLd(
  items: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export const PUBLIC_PAGES = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "menu", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "menus", priority: 0.85, changeFrequency: "daily" as const },
  { path: "vins", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "boissons", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "reservation", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "galerie", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "evenements", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "contact", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "mentions-legales", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "politique-confidentialite", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "politique-cookies", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "restaurant-agde", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "restaurant-terrasse-agde", priority: 0.85, changeFrequency: "weekly" as const },
  { path: "restaurant-cap-agde", priority: 0.85, changeFrequency: "weekly" as const },
] as const;

export const LOCALES = ["fr", "en", "it", "es", "de"] as const;
export const DEFAULT_LOCALE = "fr";

export function getPageUrl(locale: string, path: string): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const suffix = path ? `/${path}` : "";
  return `${SITE_URL}${prefix}${suffix}`;
}
