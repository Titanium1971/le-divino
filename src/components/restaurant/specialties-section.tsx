"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Dish, Locale } from "@/lib/types/database";

type Props = {
  dishes: Dish[];
  imageUrls: Record<string, string>;
  locale: string;
};

export function SpecialtiesSection({ dishes, imageUrls, locale }: Props) {
  const t = useTranslations("home");
  const loc = locale as Locale;
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  function getDishName(dish: Dish): string {
    if (loc === "fr") return dish.name_fr;
    const locField = `name_${loc}` as keyof Dish;
    return (dish[locField] as string | null) || dish.name_fr;
  }

  return (
    <section className="bg-brand-cream py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
            {t("specialties.title")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {dishes.map((dish) => {
            const url = imageUrls[dish.id];
            if (!url) return null;
            return (
              <div key={dish.id} className="group text-center">
                <button
                  onClick={() => setLightboxUrl(url)}
                  className="relative mx-auto aspect-square w-full max-w-[300px] cursor-zoom-in overflow-hidden rounded-sm"
                >
                  <Image
                    src={url}
                    alt={getDishName(dish)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-brand-dark/10 transition-opacity duration-500 group-hover:bg-brand-dark/0" />
                </button>
                <h3 className="mt-5 text-base font-normal tracking-[0.05em] text-brand-dark">
                  {getDishName(dish)}
                </h3>
                {dish.source === "carte" && Number(dish.price) > 0 && (
                  <p className="mt-1 text-sm font-semibold text-brand-gold">
                    {Number(dish.price).toFixed(2)} &euro;
                  </p>
                )}
              </div>
            );
          })}
        </div>
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
              alt="Photo du plat"
              width={1024}
              height={1024}
              className="h-auto max-h-[85vh] w-auto rounded-lg object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </section>
  );
}
