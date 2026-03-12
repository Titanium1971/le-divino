"use client";

import { useTranslations } from "next-intl";
import type { Wine, WineColor, Locale } from "@/lib/types/database";
import type { WineGroup } from "@/lib/supabase/wines";

const COLOR_I18N_KEY: Record<WineColor, string> = {
  rouge: "rouge",
  blanc: "blanc",
  rosé: "rose",
  petillant: "petillant",
};

type Props = {
  groups: WineGroup[];
  locale: string;
};

export function WinesClient({ groups, locale }: Props) {
  const t = useTranslations("wines");
  const loc = locale as Locale;

  function getDescription(wine: Wine): string | null {
    if (loc === "fr") return wine.description_fr;
    const locField = `description_${loc}` as keyof Wine;
    return (wine[locField] as string | null) || wine.description_fr;
  }

  return (
    <div className="space-y-12">
      {groups.map(({ color, wines }) => (
        <section key={color}>
          <h2 className="mb-6 text-center text-sm font-semibold tracking-[0.2em] uppercase text-brand-gold">
            {t(COLOR_I18N_KEY[color])}
          </h2>
          <div className="space-y-4">
            {wines.map((wine) => {
              const description = getDescription(wine);
              const details = [wine.appellation, wine.region].filter(Boolean).join(" — ");
              return (
                <div
                  key={wine.id}
                  className="border-b border-brand-dark/10 pb-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-normal text-brand-dark">
                        {wine.name}
                      </h3>
                      {details && (
                        <p className="mt-0.5 text-xs font-light tracking-wide text-brand-dark/50">
                          {details}
                        </p>
                      )}
                      {description && (
                        <p className="mt-1 text-sm font-light text-brand-dark/70">
                          {description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {wine.price_glass != null && Number(wine.price_glass) > 0 && (
                        <p className="text-sm text-brand-dark/70">
                          {Number(wine.price_glass).toFixed(2)} &euro;{" "}
                          <span className="text-xs">{t("glass")}</span>
                        </p>
                      )}
                      {wine.price_bottle != null && Number(wine.price_bottle) > 0 && (
                        <p className="text-sm font-medium text-brand-bordeaux">
                          {Number(wine.price_bottle).toFixed(2)} &euro;{" "}
                          <span className="text-xs font-normal">{t("bottle")}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
