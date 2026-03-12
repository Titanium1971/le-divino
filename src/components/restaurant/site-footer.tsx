import Image from "next/image";
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

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const supabase = await createClient();
  const horaires = await getHoraires(supabase);

  return (
    <footer className="relative bg-brand-dark text-brand-cream/80">
      {/* Ambiance photo banner */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src="/images/exterior-terrace.jpg"
          alt="Terrasse Le Divino"
          fill
          className="object-cover"
          sizes="100vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-cream via-brand-dark/60 to-brand-dark" />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Col 1: Logo + Brand + address */}
          <div>
            <Image
              src="/images/logo-divino.jpg"
              alt="Logo Le Divino"
              width={80}
              height={80}
              className="rounded-full"
            />
            <p className="mt-4 text-2xl font-extralight tracking-[0.2em] text-brand-cream uppercase">
              Le Divino
            </p>
            <p className="mt-2 text-xs font-light tracking-[0.15em] uppercase text-brand-gold">
              {restaurantConfig.tagline}
            </p>
            <div className="mt-6 space-y-1 text-sm font-light text-brand-cream/80">
              <p>{restaurantConfig.address.street}</p>
              <p>
                {restaurantConfig.address.postalCode} {restaurantConfig.address.city}
              </p>
            </div>
          </div>

          {/* Col 2: Hours */}
          <div>
            <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
              {t("hours")}
            </h3>
            <ul className="mt-4 space-y-2">
              {DAY_KEYS.map((key) => {
                const day = horaires[key];
                const isWeekend = key === "vendredi" || key === "samedi";
                const isSunday = key === "dimanche";
                return (
                  <li
                    key={key}
                    className={`flex justify-between text-sm font-light ${
                      isWeekend
                        ? "text-brand-gold"
                        : isSunday
                          ? "text-brand-cream"
                          : ""
                    }`}
                  >
                    <span className={isWeekend || isSunday ? "" : "text-brand-cream/90"}>
                      {DAY_LABELS[key]}
                    </span>
                    <span className={isWeekend || isSunday ? "" : "text-brand-cream/70"}>
                      {day.ouvert ? `${day.debut} – ${day.fin}` : "Fermé"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 3: Contact + socials */}
          <div>
            <h3 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
              {t("contact")}
            </h3>
            <div className="mt-4 space-y-3 text-sm font-light">
              <p>
                <a
                  href={`tel:${restaurantConfig.phoneIntl}`}
                  className="text-brand-cream/90 transition-colors hover:text-brand-gold"
                >
                  {restaurantConfig.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${restaurantConfig.email}`}
                  className="text-brand-cream/90 transition-colors hover:text-brand-gold"
                >
                  {restaurantConfig.email}
                </a>
              </p>
            </div>

            {/* Social links */}
            {(restaurantConfig.social.instagram || restaurantConfig.social.facebook) && (
              <div className="mt-6">
                <h4 className="text-[11px] font-normal tracking-[0.2em] uppercase text-brand-gold">
                  {t("follow")}
                </h4>
                <div className="mt-3 flex gap-4">
                  {restaurantConfig.social.instagram && (
                    <a
                      href={restaurantConfig.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-light text-brand-cream/80 transition-colors hover:text-brand-gold"
                    >
                      Instagram
                    </a>
                  )}
                  {restaurantConfig.social.facebook && (
                    <a
                      href={restaurantConfig.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-light text-brand-cream/80 transition-colors hover:text-brand-gold"
                    >
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-cream/20">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-center text-[11px] font-light tracking-wider text-brand-cream/60" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} {restaurantConfig.name}. {t("rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
