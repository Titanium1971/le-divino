"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Category, Dish, Menu, Locale } from "@/lib/types/database";

type Props = {
  grouped: { category: Category; dishes: Dish[] }[];
  menus: Menu[];
  locale: string;
};

export function MenuClient({ grouped, menus, locale }: Props) {
  const t = useTranslations("menu");
  const loc = locale as Locale;
  const tabs = [
    ...grouped.map((g) => ({ id: g.category.id, label: g.category.name })),
    ...(menus.length > 0 ? [{ id: "__formules__", label: t("formules") }] : []),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  // Detect if translations are missing for current locale
  const allDishes = grouped.flatMap((g) => g.dishes);
  const hasTranslations =
    loc === "fr" ||
    allDishes.some((d) => d.name[loc]?.trim());

  return (
    <>
      {/* Translation notice for non-FR locales */}
      {!hasTranslations && (
        <div className="mb-8 rounded border border-brand-gold/30 bg-brand-gold/5 px-5 py-3 text-center text-sm font-light text-brand-dark/70">
          {t("translationNotice")}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-brand-dark/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-xs font-normal tracking-[0.15em] uppercase transition-all duration-300 ${
              activeTab === tab.id
                ? "border-b-2 border-brand-gold text-brand-bordeaux"
                : "text-brand-dark/70 hover:text-brand-bordeaux"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-12">
        {activeTab === "__formules__" ? (
          <div className="space-y-10">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="border border-brand-dark/10 p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-normal tracking-[0.1em] text-brand-bordeaux">
                      {menu.name[loc] || menu.name.fr}
                    </h3>
                    {(menu.description[loc] || menu.description.fr) && (
                      <p className="mt-2 text-sm font-light text-brand-dark/80">
                        {menu.description[loc] || menu.description.fr}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-lg font-semibold text-brand-gold">
                    {menu.price.toFixed(2)} &euro;
                  </span>
                </div>
                {menu.courses.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-brand-dark/5 pt-4">
                    {menu.courses.map((course, i) => (
                      <li
                        key={i}
                        className="text-sm font-light text-brand-dark/70"
                      >
                        &bull; {course.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {grouped
              .find((g) => g.category.id === activeTab)
              ?.dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-start justify-between gap-4 border-b border-brand-dark/5 pb-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-normal text-brand-dark">
                        {dish.name[loc] || dish.name.fr}
                      </h3>
                      {dish.is_signature && (
                        <span className="text-[10px] font-normal tracking-[0.1em] uppercase text-brand-gold">
                          {t("signature")}
                        </span>
                      )}
                      {dish.is_vegetarian && (
                        <span className="text-[10px] font-normal tracking-[0.1em] uppercase text-green-700">
                          {t("vegetarian")}
                        </span>
                      )}
                    </div>
                    {(dish.description[loc] || dish.description.fr) && (
                      <p className="mt-1.5 text-sm font-light text-brand-dark/70">
                        {dish.description[loc] || dish.description.fr}
                      </p>
                    )}
                    {dish.allergens.length > 0 && (
                      <p className="mt-1 text-[10px] font-light text-brand-dark/50">
                        {t("allergens")} : {dish.allergens.join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-lg font-semibold text-brand-gold">
                    {dish.price.toFixed(2)} &euro;
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
