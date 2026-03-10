"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { Category, Dish, Menu, Locale } from "@/lib/types/database";

type Props = {
  grouped: { category: Category; dishes: Dish[] }[];
  menus: Menu[];
  locale: string;
};

// Map French category names to i18n keys in menu.categories.*
const CATEGORY_I18N_KEY: Record<string, string> = {
  "Entrées": "entrees",
  "Plats": "plats",
  "Desserts": "desserts",
  "Boissons": "boissons",
};

// Map French singular course names to i18n keys in menu.courses.*
const COURSE_I18N_KEY: Record<string, string> = {
  "entrée": "entree",
  "entrées": "entree",
  "plat": "plat",
  "plats": "plat",
  "dessert": "dessert",
  "desserts": "dessert",
  "boisson": "boisson",
  "boissons": "boisson",
};

export function MenuClient({ grouped, menus, locale }: Props) {
  const t = useTranslations("menu");
  const loc = locale as Locale;

  function categoryLabel(cat: Category): string {
    const key = CATEGORY_I18N_KEY[cat.name];
    if (key) return t(`categories.${key}`);
    return cat.name; // fallback for custom categories
  }

  // Translate course labels like "Entrée (au choix)", "ou Dessert", "Plat"
  function translateCourseLabel(label: string): string {
    let text = label.trim();

    // Extract prefix "ou " / "ou"
    let prefix = "";
    if (/^ou\s+/i.test(text)) {
      prefix = t("or") + " ";
      text = text.replace(/^ou\s+/i, "");
    }

    // Extract suffix "(au choix)"
    let suffix = "";
    if (/\(au choix\)/i.test(text)) {
      suffix = " " + t("choice");
      text = text.replace(/\s*\(au choix\)/i, "");
    }

    // Look up the remaining word in the course map
    const key = COURSE_I18N_KEY[text.toLowerCase()];
    const translated = key ? t(`courses.${key}`) : text;

    return `${prefix}${translated}${suffix}`;
  }

  const tabs = [
    ...grouped.map((g) => ({ id: g.category.id, label: categoryLabel(g.category) })),
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

  // Detect if translations are missing for current locale
  const allDishes = grouped.flatMap((g) => g.dishes);
  const hasTranslations =
    loc === "fr" ||
    allDishes.some((d) => d.name[loc]?.trim());

  return (
    <div className="isolate">
      {/* Translation notice for non-FR locales */}
      {!hasTranslations && (
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
                        &bull; {translateCourseLabel(course.label)}
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
    </div>
  );
}
