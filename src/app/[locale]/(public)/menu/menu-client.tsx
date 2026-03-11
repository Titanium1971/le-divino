"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { Dish, Menu, DishCategory, Locale } from "@/lib/types/database";
import { DISH_CATEGORIES } from "@/lib/types/database";

type DishGroup = { category: DishCategory; label: string; dishes: Dish[] };

type Props = {
  grouped: DishGroup[];
  menus: Menu[];
  todayDishes: Dish[];
  locale: string;
};

// Map category values to i18n keys
const CATEGORY_I18N_KEY: Record<DishCategory, string> = {
  entree: "entrees",
  plat: "plats",
  dessert: "desserts",
};

// Map category to today's section i18n key
const TODAY_CATEGORY_KEY: Record<DishCategory, string> = {
  entree: "todayEntrees",
  plat: "todayPlats",
  dessert: "todayDesserts",
};

export function MenuClient({ grouped, menus, todayDishes, locale }: Props) {
  const t = useTranslations("menu");
  const loc = locale as Locale;

  function categoryLabel(cat: DishCategory): string {
    const key = CATEGORY_I18N_KEY[cat];
    if (key) return t(`categories.${key}`);
    return DISH_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
  }

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

  const tabs = [
    ...grouped.map((g) => ({ id: g.category, label: categoryLabel(g.category) })),
    ...(menus.length > 0 ? [{ id: "__formules__", label: t("formules") }] : []),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const [contentKey, setContentKey] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    function updateUnderline() {
      const idx = tabs.findIndex((tab) => tab.id === activeTab);
      const el = tabsRef.current[idx];
      const nav = navRef.current;
      if (el && nav) {
        const navRect = nav.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setUnderlineStyle({
          left: elRect.left - navRect.left,
          width: elRect.width,
        });
      }
    }
    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function handleTabChange(id: string) {
    setActiveTab(id);
    setContentKey((k) => k + 1);
  }

  // Detect if translations are available
  const allDishes = grouped.flatMap((g) => g.dishes);
  const hasTranslations =
    locale === "fr" ||
    allDishes.some((d) => getDishName(d) !== d.name_fr);

  // Group today's dishes by category
  const todayByCategory = DISH_CATEGORIES
    .map(({ value }) => ({
      category: value,
      dishes: todayDishes.filter((d) => d.category === value),
    }))
    .filter((g) => g.dishes.length > 0);

  const hasTodayDishes = todayByCategory.length > 0;

  return (
    <div className="isolate">
      {/* Translation notice for non-FR locales */}
      {!hasTranslations && locale !== "fr" && (
        <div className="mb-8 rounded border border-brand-gold/30 bg-brand-gold/5 px-5 py-3 text-center text-sm font-light text-brand-dark/70">
          {t("translationNotice")}
        </div>
      )}

      {/* Tabs */}
      <div ref={navRef} className="relative flex flex-wrap justify-center gap-2 border-b border-brand-dark/10 pb-4">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => { tabsRef.current[i] = el; }}
            onClick={() => handleTabChange(tab.id)}
            className={`cursor-pointer px-5 py-2.5 text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
              activeTab === tab.id
                ? "font-semibold text-brand-gold"
                : "font-normal text-brand-dark/70 hover:-translate-y-0.5 hover:text-brand-gold/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {/* Sliding underline */}
        <span
          className="pointer-events-none absolute bottom-0 h-0.5 bg-brand-gold transition-all duration-300 ease-in-out"
          style={{ left: underlineStyle.left, width: underlineStyle.width }}
        />
      </div>

      {/* Content */}
      <div key={contentKey} className="mt-12 animate-fade-in-up">
        {activeTab === "__formules__" ? (
          <div className="space-y-10">
            {/* Formules */}
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="border border-brand-dark/10 p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-normal tracking-[0.1em] text-brand-bordeaux">
                      {menu.name_fr}
                    </h3>
                    {menu.description_fr && (
                      <p className="mt-2 text-sm font-light text-brand-dark/80">
                        {menu.description_fr}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-lg font-semibold text-brand-gold">
                    {Number(menu.price).toFixed(2)} &euro;
                  </span>
                </div>
              </div>
            ))}

            {/* Today's dishes */}
            <div className="mt-12 border-t border-brand-dark/10 pt-10">
              <h3 className="mb-8 text-center text-lg font-normal tracking-[0.15em] uppercase text-brand-bordeaux">
                {t("todaySelection")}
              </h3>

              {hasTodayDishes ? (
                <div className="space-y-8">
                  {todayByCategory.map(({ category, dishes }) => (
                    <div key={category}>
                      <h4 className="mb-4 text-sm font-semibold tracking-[0.15em] uppercase text-brand-gold">
                        {t(TODAY_CATEGORY_KEY[category])}
                      </h4>
                      <div className="space-y-4">
                        {dishes.map((dish) => (
                          <div
                            key={dish.id}
                            className="border-b border-brand-dark/5 pb-4"
                          >
                            <h5 className="text-base font-normal text-brand-dark">
                              {getDishName(dish)}
                            </h5>
                            {getDishDescription(dish) && (
                              <p className="mt-1 text-sm font-light text-brand-dark/70">
                                {getDishDescription(dish)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {category === "plat" && (
                        <p className="mt-3 text-xs font-light italic text-brand-dark/50">
                          {t("todayPlatsNote")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm font-light italic text-brand-dark/60">
                  {t("todayEmpty")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped
              .find((g) => g.category === activeTab)
              ?.dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-start justify-between gap-4 border-b border-brand-dark/5 pb-6"
                >
                  <div className="flex-1">
                    <h3 className="text-base font-normal text-brand-dark">
                      {getDishName(dish)}
                    </h3>
                    {getDishDescription(dish) && (
                      <p className="mt-1.5 text-sm font-light text-brand-dark/70">
                        {getDishDescription(dish)}
                      </p>
                    )}
                  </div>
                  {Number(dish.price) > 0 && (
                    <span className="shrink-0 text-lg font-semibold text-brand-gold">
                      {Number(dish.price).toFixed(2)} &euro;
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
