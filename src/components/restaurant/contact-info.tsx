import { getTranslations } from "next-intl/server";
import { restaurantConfig } from "@/restaurant.config";
import { createClient } from "@/lib/supabase/server";
import { getHoraires, type Horaires } from "@/lib/supabase/horaires";

const DAY_KEYS: (keyof Horaires)[] = [
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
];

const DAY_LABELS: Record<keyof Horaires, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

const HIGHLIGHT_DAYS = new Set<keyof Horaires>(["vendredi", "samedi"]);

export async function ContactInfo() {
  const t = await getTranslations("contact");
  const supabase = await createClient();
  const horaires = await getHoraires(supabase);

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
          {DAY_KEYS.map((key) => {
            const day = horaires[key];
            const isHighlight = HIGHLIGHT_DAYS.has(key);
            const isSunday = key === "dimanche";

            return (
              <li
                key={key}
                className={`flex justify-between text-sm font-light ${
                  isHighlight
                    ? "font-medium text-brand-gold"
                    : isSunday
                      ? "font-medium text-brand-bordeaux"
                      : ""
                }`}
              >
                <span className={isHighlight || isSunday ? "" : "text-brand-dark/90"}>
                  {DAY_LABELS[key]}
                </span>
                <span className={isHighlight || isSunday ? "" : "text-brand-dark/60"}>
                  {day.ouvert ? `${day.debut} – ${day.fin}` : "Fermé"}
                </span>
              </li>
            );
          })}
        </ul>
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
