"use client";

import { useTranslations } from "next-intl";
import type { Drink, DrinkCategory, Locale } from "@/lib/types/database";
import type { DrinkGroup } from "@/lib/supabase/drinks";

const CATEGORY_I18N_KEY: Record<DrinkCategory, string> = {
  soft: "soft",
  cocktail: "cocktail",
  biere: "biere",
  spiritueux: "spiritueux",
  hot: "hot",
  autre: "autre",
};

type Props = {
  groups: DrinkGroup[];
  locale: string;
};

export function DrinksClient({ groups, locale }: Props) {
  const t = useTranslations("drinks");
  const loc = locale as Locale;

  function getDescription(drink: Drink): string | null {
    if (loc === "fr") return drink.description_fr;
    const locField = `description_${loc}` as keyof Drink;
    return (drink[locField] as string | null) || drink.description_fr;
  }

  return (
    <div className="space-y-12">
      {groups.map(({ category, drinks }) => (
        <section key={category}>
          <h2 className="mb-6 text-center text-sm font-semibold tracking-[0.2em] uppercase text-brand-gold">
            {t(CATEGORY_I18N_KEY[category])}
          </h2>
          <div className="space-y-4">
            {drinks.map((drink) => {
              const description = getDescription(drink);
              return (
                <div
                  key={drink.id}
                  className="flex items-start justify-between gap-4 border-b border-brand-dark/10 pb-4"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-normal text-brand-dark">
                      {drink.name}
                    </h3>
                    {description && (
                      <p className="mt-1 text-sm font-light text-brand-dark/70">
                        {description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {drink.price != null && Number(drink.price) > 0 && (
                      <p className="text-sm font-medium text-brand-bordeaux">
                        {Number(drink.price).toFixed(2)} &euro;
                      </p>
                    )}
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
