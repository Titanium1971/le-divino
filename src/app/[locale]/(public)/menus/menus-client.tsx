"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Dish, Menu, DishCategory, Locale } from "@/lib/types/database";
import { DISH_CATEGORIES, MENU_TYPES } from "@/lib/types/database";

type MenuWithDishes = Menu & {
  dishes: { category: string; dish: Dish; imageUrl: string | null }[];
};

type Props = {
  menus: MenuWithDishes[];
  locale: string;
};

const CATEGORY_I18N_KEY: Record<DishCategory, string> = {
  entree: "todayEntrees",
  plat: "todayPlats",
  dessert: "todayDesserts",
};

export function MenusClient({ menus, locale }: Props) {
  const t = useTranslations("menus");
  const loc = locale as Locale;
  const [openId, setOpenId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  function getDishName(dish: Dish): string {
    if (loc === "fr") return dish.name_fr;
    const locField = `name_${loc}` as keyof Dish;
    return (dish[locField] as string | null) || dish.name_fr;
  }

  function getDishDescription(dish: Dish): string | null {
    if (loc === "fr") return dish.description_fr;
    const locField = `description_${loc}` as keyof Dish;
    return (dish[locField] as string | null) || dish.description_fr;
  }

  function getMenuName(menu: Menu): string {
    if (loc === "fr") return menu.name_fr;
    const locField = `name_${loc}` as keyof Menu;
    return (menu[locField] as string | null) || menu.name_fr;
  }

  function getMenuDescription(menu: Menu): string | null {
    if (loc === "fr") return menu.description_fr;
    const locField = `description_${loc}` as keyof Menu;
    return (menu[locField] as string | null) || menu.description_fr;
  }

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      {menus.map((menu) => {
        const isOpen = openId === menu.id;
        const typeLabel = MENU_TYPES.find((mt) => mt.value === menu.type)?.label;

        // Group today's dishes by category
        const byCategory = DISH_CATEGORIES
          .map(({ value }) => ({
            category: value,
            items: menu.dishes.filter((d) => d.category === value),
          }))
          .filter((g) => g.items.length > 0);

        const hasDishes = byCategory.length > 0;

        return (
          <div key={menu.id} className="overflow-hidden border border-brand-dark/10">
            {/* Cartouche */}
            <button
              onClick={() => toggle(menu.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-8 py-6 text-left transition-colors hover:bg-brand-dark/[0.02]"
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-normal tracking-[0.1em] text-brand-bordeaux">
                  {getMenuName(menu)}
                </h2>
                {getMenuDescription(menu) && (
                  <p className="mt-1 text-sm font-light text-brand-dark/70">
                    {getMenuDescription(menu)}
                  </p>
                )}
                {typeLabel && (
                  <p className="mt-2 text-xs font-light tracking-[0.1em] uppercase text-brand-dark/50">
                    {typeLabel}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="text-xl font-semibold text-brand-gold">
                  {Number(menu.price).toFixed(2)} &euro;
                </span>
                <span
                  className={`text-brand-dark/40 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </div>
            </button>

            {/* Accordion content */}
            <div
              className={`grid transition-all duration-500 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-brand-dark/10 px-8 py-8">
                  {hasDishes ? (
                    <div className="space-y-8">
                      {byCategory.map(({ category, items }) => (
                        <div key={category}>
                          <h3 className="mb-4 text-sm font-semibold tracking-[0.15em] uppercase text-brand-gold">
                            {t(CATEGORY_I18N_KEY[category])}
                          </h3>
                          <div className="space-y-4">
                            {items.map(({ dish, imageUrl }) => (
                              <div
                                key={dish.id}
                                className="flex items-start gap-4 border-b border-brand-dark/5 pb-4"
                              >
                                {imageUrl && (
                                  <button
                                    onClick={() => setLightboxUrl(imageUrl)}
                                    className="relative h-16 w-16 shrink-0 cursor-zoom-in overflow-hidden rounded-sm"
                                  >
                                    <Image
                                      src={imageUrl}
                                      alt={getDishName(dish)}
                                      fill
                                      className="object-cover transition-transform duration-300 hover:scale-110"
                                      sizes="64px"
                                      unoptimized
                                    />
                                  </button>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-base font-normal text-brand-dark">
                                    {getDishName(dish)}
                                  </h4>
                                  {getDishDescription(dish) && (
                                    <p className="mt-1 text-sm font-light text-brand-dark/70">
                                      {getDishDescription(dish)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {category === "plat" && (
                            <p className="mt-3 text-xs font-light italic text-brand-dark/50">
                              {t("platsNote")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm font-light italic text-brand-dark/60">
                      {t("noDishesFallback")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
    </div>
  );
}
