import { restaurantConfig } from "@/restaurant.config";

export function MapEmbed() {
  const { lat, lng } = restaurantConfig.coordinates;
  const query = encodeURIComponent(
    `${restaurantConfig.name}, ${restaurantConfig.address.street}, ${restaurantConfig.address.postalCode} ${restaurantConfig.address.city}`
  );

  return (
    <div className="relative h-80 w-full bg-brand-dark/10 md:h-96">
      <iframe
        title="Google Maps"
        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat},${lng}!5e0!3m2!1sfr!2sfr!4v1`}
        className="absolute inset-0 h-full w-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
