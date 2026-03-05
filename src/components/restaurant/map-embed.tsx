import { restaurantConfig } from "@/restaurant.config";

export function MapEmbed() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

  // Google Maps Embed with GBP card (reviews, photos, hours)
  const googleSrc = apiKey && placeId
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${placeId}&language=fr`
    : null;

  // Fallback to OpenStreetMap if no Google API key
  const { lat, lng } = restaurantConfig.coordinates;
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.003}%2C${lat - 0.002}%2C${lng + 0.003}%2C${lat + 0.002}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="relative">
      <div className="relative h-80 w-full bg-brand-dark/10 md:h-[28rem]">
        <iframe
          title="Google Maps — Le Divino"
          src={googleSrc ?? osmSrc}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      {/* Directions button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-6">
        <a
          href={restaurantConfig.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-brand-bordeaux px-6 py-3 text-xs font-medium tracking-[0.1em] uppercase text-brand-cream shadow-lg transition-all hover:bg-brand-bordeaux/90 hover:shadow-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-4 w-4 text-brand-gold"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
          </svg>
          <span>Obtenir l&apos;itinéraire</span>
        </a>
      </div>
    </div>
  );
}
