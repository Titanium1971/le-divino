"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Drink, DrinkCategory, Locale } from "@/lib/types/database";
import type { DrinkGroup } from "@/lib/supabase/drinks";

const CATEGORY_I18N_KEY: Record<DrinkCategory, string> = {
  soft: "soft",
  cocktail: "cocktail",
  biere: "biere",
  biere_pression: "biere_pression",
  biere_bouteille: "biere_bouteille",
  spiritueux: "spiritueux",
  hot: "hot",
  autre: "autre",
};

type Props = {
  groups: DrinkGroup[];
  locale: string;
  imageUrls: Record<string, string>;
};

export function DrinksClient({ groups, locale, imageUrls }: Props) {
  const t = useTranslations("drinks");
  const loc = locale as Locale;
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightboxUrl(null), []);

  useEffect(() => {
    if (!lightboxUrl) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxUrl, closeLightbox]);

  function getDescription(drink: Drink): string | null {
    if (loc === "fr") return drink.description_fr;
    const locField = `description_${loc}` as keyof Drink;
    return (drink[locField] as string | null) || drink.description_fr;
  }

  return (
    <>
      <div className="space-y-12">
        {groups.map(({ category, drinks }) => (
          <section key={category}>
            <h2 className="mb-6 text-center text-sm font-semibold tracking-[0.2em] uppercase text-brand-gold">
              {t(CATEGORY_I18N_KEY[category])}
            </h2>
            <div className="space-y-4">
              {drinks.map((drink) => {
                const description = getDescription(drink);
                const drinkImageUrl = imageUrls[drink.id] ?? null;

                return (
                  <div
                    key={drink.id}
                    className="flex gap-4 border-b border-brand-dark/10 pb-4"
                  >
                    {/* Drink photo */}
                    {drinkImageUrl && (
                      <button
                        onClick={() => setLightboxUrl(drinkImageUrl)}
                        className="relative h-16 w-16 shrink-0 cursor-zoom-in overflow-hidden rounded-sm"
                      >
                        <Image
                          src={drinkImageUrl}
                          alt={drink.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                          sizes="64px"
                        />
                      </button>
                    )}

                    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
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
                        {drink.category === "biere_pression" ? (
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 justify-end">
                            {drink.price_galopin != null && Number(drink.price_galopin) > 0 && (
                              <span className="text-xs text-brand-dark/70">
                                <span className="text-brand-bordeaux font-medium">{Number(drink.price_galopin).toFixed(2)}&nbsp;&euro;</span>{" "}
                                <span className="text-[10px]">{t("galopin")}</span>
                              </span>
                            )}
                            {drink.price_25cl != null && Number(drink.price_25cl) > 0 && (
                              <span className="text-xs text-brand-dark/70">
                                <span className="text-brand-bordeaux font-medium">{Number(drink.price_25cl).toFixed(2)}&nbsp;&euro;</span>{" "}
                                <span className="text-[10px]">{t("size_25cl")}</span>
                              </span>
                            )}
                            {drink.price_50cl != null && Number(drink.price_50cl) > 0 && (
                              <span className="text-xs text-brand-dark/70">
                                <span className="text-brand-bordeaux font-medium">{Number(drink.price_50cl).toFixed(2)}&nbsp;&euro;</span>{" "}
                                <span className="text-[10px]">{t("size_50cl")}</span>
                              </span>
                            )}
                            {drink.price_1l != null && Number(drink.price_1l) > 0 && (
                              <span className="text-xs text-brand-dark/70">
                                <span className="text-brand-bordeaux font-medium">{Number(drink.price_1l).toFixed(2)}&nbsp;&euro;</span>{" "}
                                <span className="text-[10px]">{t("size_1l")}</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          drink.price != null && Number(drink.price) > 0 && (
                            <p className="text-sm font-medium text-brand-bordeaux">
                              {Number(drink.price).toFixed(2)} &euro;
                            </p>
                          )
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

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-3xl text-white/80 hover:text-white"
            aria-label="Fermer"
          >
            &times;
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxUrl}
              alt="Photo de la boisson"
              width={600}
              height={600}
              className="h-auto max-h-[85vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
