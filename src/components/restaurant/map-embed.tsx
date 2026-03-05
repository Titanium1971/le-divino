import { restaurantConfig } from "@/restaurant.config";

export function MapEmbed() {
  const { lat, lng } = restaurantConfig.coordinates;

  return (
    <div className="relative">
      <div className="relative h-80 w-full bg-brand-dark/10 md:h-96">
        <iframe
          title="OpenStreetMap — Le Divino"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.003}%2C${lat - 0.002}%2C${lng + 0.003}%2C${lat + 0.002}&layer=mapnik&marker=${lat}%2C${lng}`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
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
