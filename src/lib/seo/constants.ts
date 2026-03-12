import { restaurantConfig } from "@/restaurant.config";

export const SITE_URL = "https://www.ledivino-agde.fr";

const c = restaurantConfig;

const DAY_MAP: Record<number, string> = {
  1: "Mo",
  2: "Tu",
  3: "We",
  4: "Th",
  5: "Fr",
  6: "Sa",
  7: "Su",
};

export const RESTAURANT_JSON_LD = {
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
  openingHoursSpecification: c.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: DAY_MAP[h.day],
    opens: h.open,
    closes: h.close,
  })),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    ratingCount: "76",
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

export const PUBLIC_PAGES = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "menu", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "menus", priority: 0.85, changeFrequency: "daily" as const },
  { path: "vins", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "boissons", priority: 0.75, changeFrequency: "weekly" as const },
  { path: "reservation", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "galerie", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "contact", priority: 0.7, changeFrequency: "yearly" as const },
] as const;

export const LOCALES = ["fr", "en", "it", "es", "de"] as const;
export const DEFAULT_LOCALE = "fr";

export function getPageUrl(locale: string, path: string): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const suffix = path ? `/${path}` : "";
  return `${SITE_URL}${prefix}${suffix}`;
}
