import { restaurantConfig } from "@/restaurant.config";

export function MapEmbed() {
  const { lat, lng } = restaurantConfig.coordinates;

  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-muted">
      {/* TODO: Add Google Maps embed or interactive map */}
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Carte — {lat.toFixed(4)}, {lng.toFixed(4)}
      </div>
    </div>
  );
}
