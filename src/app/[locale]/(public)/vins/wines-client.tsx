"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
  imageUrls: Record<string, string>;
  wineNumbers?: Record<string, number>;
};

export function WinesClient({ groups, locale, imageUrls, wineNumbers }: Props) {
  const t = useTranslations("wines");
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

  function getDescription(wine: Wine): string | null {
    if (loc === "fr") return wine.description_fr;
    const locField = `description_${loc}` as keyof Wine;
    return (wine[locField] as string | null) || wine.description_fr;
  }

  return (
    <>
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
                const wineImageUrl = imageUrls[wine.id] ?? null;
                const tags = [
                  wine.vintage ? String(wine.vintage) : null,
                  wine.grape_variety,
                  wine.alcohol_degree,
                  wine.style,
                ].filter(Boolean);

                return (
                  <div
                    key={wine.id}
                    className="flex gap-4 border-b border-brand-dark/10 pb-4"
                  >
                    {/* Numéro */}
                    {wineNumbers?.[wine.id] != null && (
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-dark/8 text-[11px] font-semibold text-brand-dark/50">
                        {wineNumbers[wine.id]}
                      </span>
                    )}
                    {/* Wine photo (portrait format) */}
                    {wineImageUrl && (
                      <button
                        onClick={() => setLightboxUrl(wineImageUrl)}
                        className="relative h-20 w-14 shrink-0 cursor-zoom-in overflow-hidden rounded-sm"
                      >
                        <Image
                          src={wineImageUrl}
                          alt={wine.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                          sizes="56px"
                        />
                      </button>
                    )}

                    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
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
                        {tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-sm bg-brand-dark/5 px-1.5 py-0.5 text-[10px] font-light tracking-wide text-brand-dark/60"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
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
              alt="Photo du vin"
              width={600}
              height={900}
              className="h-auto max-h-[85vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
