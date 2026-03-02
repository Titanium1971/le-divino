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

      {/* Phone */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
          {t("phone")}
        </h3>
        <p className="mt-3">
          <a
            href={`tel:${restaurantConfig.phone.replace(/\s/g, "")}`}
            className="text-sm font-light text-brand-dark/90 transition-colors hover:text-brand-bordeaux"
          >
            {restaurantConfig.phone}
          </a>
        </p>
      </div>

      {/* Email */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
          {t("email")}
        </h3>
        <p className="mt-3">
          <a
            href={`mailto:${restaurantConfig.email}`}
            className="text-sm font-light text-brand-dark/90 transition-colors hover:text-brand-bordeaux"
          >
            {restaurantConfig.email}
          </a>
        </p>
      </div>

      {/* Hours */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
          {t("hours")}
        </h3>
        <ul className="mt-3 space-y-1.5">
          {restaurantConfig.hours.map((h) => (
            <li key={h.day} className="flex justify-between text-sm font-light">
              <span className="text-brand-dark/90">{dayNames[h.day]}</span>
              <span className="text-brand-dark/60">
                {h.open
                  ? `${h.open}\u2013${h.close} / ${h.dinnerOpen}\u2013${h.dinnerClose}`
                  : "Ferm\u00e9"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
