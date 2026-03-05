import { getTranslations } from "next-intl/server";
import { restaurantConfig } from "@/restaurant.config";

const dayNames: Record<number, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
  7: "Dimanche",
};

// Days with late-night or special hours
const HIGHLIGHT_DAYS = new Set([5, 6]); // Vendredi, Samedi
const SUNDAY = 7;

export async function ContactInfo() {
  const t = await getTranslations("contact");

  return (
    <div className="space-y-10">
      {/* Address */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
          {t("address")}
        </h3>
        <div className="mt-3 text-sm font-light text-brand-dark/90">
          <p>{restaurantConfig.address.street}</p>
          <p>
            {restaurantConfig.address.postalCode} {restaurantConfig.address.city}
          </p>
        </div>
      </div>

      {/* Phone — clickable */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
          {t("phone")}
        </h3>
        <p className="mt-3">
          <a
            href={`tel:${restaurantConfig.phoneIntl}`}
            className="text-sm font-medium text-brand-bordeaux transition-colors hover:text-brand-gold"
          >
            {restaurantConfig.phone}
          </a>
        </p>
      </div>

      {/* Email — clickable */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
          {t("email")}
        </h3>
        <p className="mt-3">
          <a
            href={`mailto:${restaurantConfig.email}`}
            className="text-sm font-medium text-brand-bordeaux transition-colors hover:text-brand-gold"
          >
            {restaurantConfig.email}
          </a>
        </p>
      </div>

      {/* Hours — day by day */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
          {t("hours")}
        </h3>
        <ul className="mt-3 space-y-1.5">
          {restaurantConfig.hours.map((h) => {
            const isHighlight = HIGHLIGHT_DAYS.has(h.day);
            const isSunday = h.day === SUNDAY;

            return (
              <li
                key={h.day}
                className={`flex justify-between text-sm font-light ${
                  isHighlight
                    ? "font-medium text-brand-gold"
                    : isSunday
                      ? "font-medium text-brand-bordeaux"
                      : ""
                }`}
              >
                <span className={isHighlight || isSunday ? "" : "text-brand-dark/90"}>
                  {dayNames[h.day]}
                </span>
                <span className={isHighlight || isSunday ? "" : "text-brand-dark/60"}>
                  {h.open ? `${h.open} – ${h.close}` : "Fermé"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs font-light text-brand-dark/50">
          Vendredi &amp; Samedi : ouvert jusqu&apos;à 1h du matin
        </p>
      </div>

      {/* Social links */}
      {(restaurantConfig.social.instagram || restaurantConfig.social.facebook) && (
        <div className="flex gap-4">
          {restaurantConfig.social.instagram && (
            <a
              href={restaurantConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light text-brand-dark/70 transition-colors hover:text-brand-bordeaux"
            >
              Instagram
            </a>
          )}
          {restaurantConfig.social.facebook && (
            <a
              href={restaurantConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light text-brand-dark/70 transition-colors hover:text-brand-bordeaux"
            >
              Facebook
            </a>
          )}
        </div>
      )}
    </div>
  );
}
