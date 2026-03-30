"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type {
  Dish,
  DishCategory,
  Menu,
  Wine,
  WineColor,
  Drink,
  DrinkCategory,
  Locale,
} from "@/lib/types/database";
import { DISH_CATEGORIES } from "@/lib/types/database";
import type { WineGroup } from "@/lib/supabase/wines";
import type { DrinkGroup } from "@/lib/supabase/drinks";

// ── Types ──

type DishGroup = { category: DishCategory; label: string; dishes: Dish[] };

type MenuWithDishes = Menu & {
  dishes: { category: string; dish: Dish; imageUrl: string | null }[];
};

type TabId = "carte" | "menus" | "vins" | "boissons";

type Props = {
  locale: string;
  dishGroups: DishGroup[];
  dishImageUrls: Record<string, string>;
  menus: MenuWithDishes[];
  wineGroups: WineGroup[];
  wineImageUrls: Record<string, string>;
  drinkGroups: DrinkGroup[];
  drinkImageUrls: Record<string, string>;
  defaultTab?: TabId;
  tabOrder?: TabId[];
  showHeader?: boolean;
  totalDishCount?: number;
};

// ── i18n maps ──

const CATEGORY_I18N: Record<DishCategory, string> = {
  entree: "entrees",
  plat: "plats",
  dessert: "desserts",
};

const MENU_CATEGORY_I18N: Record<DishCategory, string> = {
  entree: "todayEntrees",
  plat: "todayPlats",
  dessert: "todayDesserts",
};

const COLOR_I18N: Record<WineColor, string> = {
  rouge: "rouge",
  blanc: "blanc",
  "rosé": "rose",
  petillant: "petillant",
};

const DRINK_I18N: Record<DrinkCategory, string> = {
  soft: "soft",
  cocktail: "cocktail",
  biere: "biere",
  biere_pression: "biere_pression",
  biere_bouteille: "biere_bouteille",
  spiritueux: "spiritueux",
  hot: "hot",
  autre: "autre",
};

const LOCALE_FLAGS = [
  { code: "fr", flag: "🇫🇷" },
  { code: "en", flag: "🇬🇧" },
  { code: "it", flag: "🇮🇹" },
  { code: "es", flag: "🇪🇸" },
  { code: "de", flag: "🇩🇪" },
];

const ALL_TABS: { id: TabId; icon: string; key: string }[] = [
  { id: "carte", icon: "\ud83c\udf7d\ufe0f", key: "tabCarte" },
  { id: "menus", icon: "\ud83d\udccb", key: "tabMenus" },
  { id: "vins", icon: "\ud83c\udf77", key: "tabVins" },
  { id: "boissons", icon: "\ud83e\udd64", key: "tabBoissons" },
];

export function QrClient({
  locale,
  dishGroups,
  dishImageUrls,
  menus,
  wineGroups,
  wineImageUrls,
  drinkGroups,
  drinkImageUrls,
  defaultTab,
  tabOrder,
  showHeader = true,
  totalDishCount,
}: Props) {
  const tQr = useTranslations("qr");
  const tMenu = useTranslations("menu");
  const tMenus = useTranslations("menus");
  const tWines = useTranslations("wines");
  const tDrinks = useTranslations("drinks");
  const loc = locale as Locale;

  const tabs = tabOrder
    ? tabOrder.map((id) => ALL_TABS.find((t) => t.id === id)!).filter(Boolean)
    : ALL_TABS;

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as TabId | null;
      if (tab && tabs.some((t) => t.id === tab)) return tab;
    }
    return defaultTab ?? "carte";
  });
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const closeLightbox = useCallback(() => setLightboxUrl(null), []);

  useEffect(() => {
    if (!lightboxUrl) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxUrl, closeLightbox]);

  // ── i18n helpers ──

  function getDishName(dish: Dish): string {
    if (loc === "fr") return dish.name_fr;
    const f = `name_${loc}` as keyof Dish;
    return (dish[f] as string | null) || dish.name_fr;
  }

  function getDishDesc(dish: Dish): string | null {
    if (loc === "fr") return dish.description_fr;
    const f = `description_${loc}` as keyof Dish;
    return (dish[f] as string | null) || dish.description_fr;
  }

  function getMenuName(menu: Menu): string {
    if (loc === "fr") return menu.name_fr;
    const f = `name_${loc}` as keyof Menu;
    return (menu[f] as string | null) || menu.name_fr;
  }

  function getMenuDesc(menu: Menu): string | null {
    if (loc === "fr") return menu.description_fr;
    const f = `description_${loc}` as keyof Menu;
    return (menu[f] as string | null) || menu.description_fr;
  }

  function getWineDesc(wine: Wine): string | null {
    if (loc === "fr") return wine.description_fr;
    const f = `description_${loc}` as keyof Wine;
    return (wine[f] as string | null) || wine.description_fr;
  }

  function getDrinkName(drink: Drink): string {
    if (loc === "fr") return drink.name_fr || drink.name;
    const f = `name_${loc}` as keyof Drink;
    return (drink[f] as string | null) || drink.name_fr || drink.name;
  }

  function getDrinkDesc(drink: Drink): string | null {
    if (loc === "fr") return drink.description_fr;
    const f = `description_${loc}` as keyof Drink;
    return (drink[f] as string | null) || drink.description_fr;
  }

  // ── Global unique numbering: dishes → drinks → wines ──
  // Dish numbering: carte dishes get 1..N
  let globalCounter = 1;

  const dishNumberMap = new Map<string, number>();
  for (const group of dishGroups) {
    for (const dish of group.dishes) {
      dishNumberMap.set(dish.id, globalCounter++);
    }
  }

  // Also number menu-only dishes (marché / non-available) that appear in menus tab
  for (const menu of menus) {
    for (const { dish } of menu.dishes) {
      if (!dishNumberMap.has(dish.id)) {
        dishNumberMap.set(dish.id, globalCounter++);
      }
    }
  }

  // Drinks start after ALL dishes (including marché not shown on carte tab)
  if (totalDishCount && totalDishCount >= globalCounter) {
    globalCounter = totalDishCount + 1;
  }

  const drinkNumberMap = new Map<string, number>();
  for (const group of drinkGroups) {
    for (const drink of group.drinks) {
      drinkNumberMap.set(drink.id, globalCounter++);
    }
  }

  const wineNumberMap = new Map<string, number>();
  for (const group of wineGroups) {
    for (const wine of group.wines) {
      wineNumberMap.set(wine.id, globalCounter++);
    }
  }

  // ── Tab: La Carte ──

  function renderCarte() {
    if (dishGroups.length === 0) {
      return <p className="py-8 text-center text-sm text-brand-dark/60">{tQr("emptyCarte")}</p>;
    }

    return (
      <div className="space-y-10">
        {dishGroups.map(({ category, dishes }) => (
          <section key={category}>
            <h3 className="mb-4 text-center text-xs font-semibold tracking-[0.2em] uppercase text-brand-gold">
              {tMenu(`categories.${CATEGORY_I18N[category]}`)}
            </h3>
            <div className="space-y-3">
              {dishes.map((dish) => {
                const desc = getDishDesc(dish);
                const imgUrl = dishImageUrls[dish.id];
                const num = dishNumberMap.get(dish.id);
                return (
                  <div key={dish.id} className="flex gap-3 border-b border-brand-dark/8 pb-3">
                    {/* Numéro du plat */}
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-dark/8 text-[11px] font-semibold text-brand-dark/50">
                      {num}
                    </span>
                    {imgUrl && (
                      <button
                        onClick={() => setLightboxUrl(imgUrl)}
                        className="relative h-14 w-14 shrink-0 cursor-zoom-in overflow-hidden rounded"
                      >
                        <Image
                          src={imgUrl}
                          alt={getDishName(dish)}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </button>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[15px] font-normal text-brand-dark leading-tight">
                          {getDishName(dish)}
                        </h4>
                        {Number(dish.price) > 0 && (
                          <span className="shrink-0 text-sm font-semibold text-brand-gold">
                            {Number(dish.price).toFixed(2)}&nbsp;&euro;
                          </span>
                        )}
                      </div>
                      {desc && (
                        <p className="mt-0.5 text-[13px] leading-snug font-light text-brand-dark/60">
                          {desc}
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

  // ── Tab: Menus ──

  function renderMenus() {
    if (menus.length === 0) {
      return <p className="py-8 text-center text-sm text-brand-dark/60">{tQr("emptyMenus")}</p>;
    }

    return (
      <div className="space-y-4">
        {menus.map((menu) => {
          const isOpen = openMenuId === menu.id;
          const byCategory = DISH_CATEGORIES
            .map(({ value }) => ({
              category: value,
              items: menu.dishes.filter((d) => d.category === value),
            }))
            .filter((g) => g.items.length > 0);

          return (
            <div key={menu.id} className="overflow-hidden rounded-lg border border-brand-dark/10">
              <button
                onClick={() => setOpenMenuId(isOpen ? null : menu.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-medium text-brand-bordeaux">
                    {getMenuName(menu)}
                  </h3>
                  {getMenuDesc(menu) && (
                    <p className="mt-0.5 text-[13px] font-light text-brand-dark/60">
                      {getMenuDesc(menu)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-lg font-semibold text-brand-gold">
                    {Number(menu.price).toFixed(2)}&nbsp;&euro;
                  </span>
                  <span
                    className={`text-xs text-brand-dark/40 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </button>

              <div
                className={`grid transition-all duration-400 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-brand-dark/10 px-5 py-5">
                    {byCategory.length > 0 ? (
                      <div className="space-y-6">
                        {byCategory.map(({ category, items }) => (
                          <div key={category}>
                            <h4 className="mb-3 text-xs font-semibold tracking-[0.15em] uppercase text-brand-gold">
                              {tMenus(MENU_CATEGORY_I18N[category as DishCategory])}
                            </h4>
                            <div className="space-y-2">
                              {items.map(({ dish, imageUrl }) => {
                                const menuDishNum = dishNumberMap.get(dish.id);
                                return (
                                <div key={dish.id} className="flex gap-3 border-b border-brand-dark/5 pb-2">
                                  {menuDishNum != null && (
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-dark/8 text-[10px] font-semibold text-brand-dark/50">
                                      {menuDishNum}
                                    </span>
                                  )}
                                  {imageUrl && (
                                    <button
                                      onClick={() => setLightboxUrl(imageUrl)}
                                      className="relative h-12 w-12 shrink-0 cursor-zoom-in overflow-hidden rounded"
                                    >
                                      <Image
                                        src={imageUrl}
                                        alt={getDishName(dish)}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                      />
                                    </button>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[14px] text-brand-dark">{getDishName(dish)}</p>
                                    {getDishDesc(dish) && (
                                      <p className="text-[12px] font-light text-brand-dark/60">
                                        {getDishDesc(dish)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                            {category === "plat" && (
                              <p className="mt-2 text-[11px] italic text-brand-dark/50">
                                {tMenus("platsNote")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm italic text-brand-dark/50">
                        {tQr("noDishesFallback")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Tab: Vins ──

  function renderVins() {
    if (wineGroups.length === 0) {
      return <p className="py-8 text-center text-sm text-brand-dark/60">{tQr("emptyVins")}</p>;
    }

    return (
      <div className="space-y-10">
        {wineGroups.map(({ color, wines }) => (
          <section key={color}>
            <h3 className="mb-4 text-center text-xs font-semibold tracking-[0.2em] uppercase text-brand-gold">
              {tWines(COLOR_I18N[color])}
            </h3>
            <div className="space-y-3">
              {wines.map((wine) => {
                const desc = getWineDesc(wine);
                const details = [wine.appellation, wine.region].filter(Boolean).join(" — ");
                const imgUrl = wineImageUrls[wine.id];
                const num = wineNumberMap.get(wine.id);

                return (
                  <div key={wine.id} className="flex gap-3 border-b border-brand-dark/8 pb-3">
                    {/* Numéro du vin */}
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-dark/8 text-[11px] font-semibold text-brand-dark/50">
                      {num}
                    </span>
                    {imgUrl && (
                      <button
                        onClick={() => setLightboxUrl(imgUrl)}
                        className="relative h-16 w-11 shrink-0 cursor-zoom-in overflow-hidden rounded"
                      >
                        <Image
                          src={imgUrl}
                          alt={wine.name}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </button>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[15px] font-normal text-brand-dark leading-tight">
                            {wine.name}
                          </h4>
                          {details && (
                            <p className="text-[11px] tracking-wide text-brand-dark/45">
                              {details}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          {wine.price_glass != null && Number(wine.price_glass) > 0 && (
                            <p className="text-[13px] text-brand-dark/60">
                              {Number(wine.price_glass).toFixed(2)}&nbsp;&euro;{" "}
                              <span className="text-[10px]">{tWines("glass")}</span>
                            </p>
                          )}
                          {wine.price_bottle != null && Number(wine.price_bottle) > 0 && (
                            <p className="text-[13px] font-medium text-brand-bordeaux">
                              {Number(wine.price_bottle).toFixed(2)}&nbsp;&euro;{" "}
                              <span className="text-[10px] font-normal">{tWines("bottle")}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      {desc && (
                        <p className="mt-0.5 text-[12px] font-light text-brand-dark/60">
                          {desc}
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

  // ── Tab: Boissons ──

  function renderBoissons() {
    if (drinkGroups.length === 0) {
      return <p className="py-8 text-center text-sm text-brand-dark/60">{tQr("emptyBoissons")}</p>;
    }

    return (
      <div className="space-y-10">
        {drinkGroups.map(({ category, drinks }) => (
          <section key={category}>
            <h3 className="mb-4 text-center text-xs font-semibold tracking-[0.2em] uppercase text-brand-gold">
              {tDrinks(DRINK_I18N[category])}
            </h3>
            <div className="space-y-3">
              {drinks.map((drink) => {
                const desc = getDrinkDesc(drink);
                const imgUrl = drinkImageUrls[drink.id];
                const num = drinkNumberMap.get(drink.id);

                return (
                  <div key={drink.id} className="flex gap-3 border-b border-brand-dark/8 pb-3">
                    {/* Numéro de la boisson */}
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-dark/8 text-[11px] font-semibold text-brand-dark/50">
                      {num}
                    </span>
                    {imgUrl && (
                      <button
                        onClick={() => setLightboxUrl(imgUrl)}
                        className="relative h-12 w-12 shrink-0 cursor-zoom-in overflow-hidden rounded"
                      >
                        <Image
                          src={imgUrl}
                          alt={getDrinkName(drink)}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </button>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[15px] font-normal text-brand-dark leading-tight">
                          {getDrinkName(drink)}
                        </h4>
                        {drink.category === "biere_pression" ? (
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-end">
                            {drink.price_galopin != null && Number(drink.price_galopin) > 0 && (
                              <span className="text-[11px] text-brand-bordeaux font-medium">
                                {Number(drink.price_galopin).toFixed(2)}&euro; <span className="text-[9px] text-brand-dark/60">Gal.</span>
                              </span>
                            )}
                            {drink.price_25cl != null && Number(drink.price_25cl) > 0 && (
                              <span className="text-[11px] text-brand-bordeaux font-medium">
                                {Number(drink.price_25cl).toFixed(2)}&euro; <span className="text-[9px] text-brand-dark/60">25cl</span>
                              </span>
                            )}
                            {drink.price_50cl != null && Number(drink.price_50cl) > 0 && (
                              <span className="text-[11px] text-brand-bordeaux font-medium">
                                {Number(drink.price_50cl).toFixed(2)}&euro; <span className="text-[9px] text-brand-dark/60">50cl</span>
                              </span>
                            )}
                            {drink.price_1l != null && Number(drink.price_1l) > 0 && (
                              <span className="text-[11px] text-brand-bordeaux font-medium">
                                {Number(drink.price_1l).toFixed(2)}&euro; <span className="text-[9px] text-brand-dark/60">1L</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          drink.price != null && Number(drink.price) > 0 && (
                            <span className="shrink-0 text-sm font-medium text-brand-bordeaux">
                              {Number(drink.price).toFixed(2)}&nbsp;&euro;
                            </span>
                          )
                        )}
                      </div>
                      {desc && (
                        <p className="mt-0.5 text-[12px] font-light text-brand-dark/60">
                          {desc}
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

  // ── Render ──

  return (
    <div className="min-h-screen bg-brand-cream font-[family-name:var(--font-raleway)]">
      {/* Header minimal */}
      {showHeader && (
        <header className="bg-brand-dark px-4 pt-8 pb-6 text-center">
          {/* Language selector */}
          <div className="flex justify-center gap-2 mb-4">
            {LOCALE_FLAGS.map(({ code, flag }) => (
              <button
                key={code}
                onClick={() => {
                  document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
                  const prefix = code === "fr" ? "" : `/${code}`;
                  window.location.href = `${prefix}/qr?tab=${activeTab}`;
                }}
                className={`text-lg transition-opacity ${
                  locale === code ? "opacity-100 scale-110" : "opacity-40 hover:opacity-70"
                }`}
                aria-label={code}
              >
                {flag}
              </button>
            ))}
          </div>
          <div className="mx-auto h-16 w-16 overflow-hidden rounded-full border-2 border-brand-gold/40">
            <Image
              src="/images/logo-divino.jpg"
              alt="Le Divino"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="mt-3 text-xl font-light tracking-[0.15em] text-brand-cream uppercase">
            Le Divino
          </h1>
          <p className="mt-1 text-xs font-light tracking-[0.1em] text-brand-gold/80">
            {tQr("welcome")}
          </p>
        </header>
      )}

      {/* Sticky tabs */}
      <nav className="sticky top-0 z-40 border-b border-brand-dark/10 bg-brand-cream/95 backdrop-blur-sm">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-center transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-brand-gold text-brand-gold"
                  : "text-brand-dark/50"
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="text-[11px] font-medium tracking-wide">
                {tQr(tab.key)}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6">
        {activeTab === "carte" && renderCarte()}
        {activeTab === "menus" && renderMenus()}
        {activeTab === "vins" && renderVins()}
        {activeTab === "boissons" && renderBoissons()}
      </main>

      {/* Mini footer */}
      {showHeader && (
        <footer className="border-t border-brand-dark/10 px-4 py-4 text-center text-[11px] text-brand-dark/40">
          Le Divino &mdash; 5 place Jean Jaur&egrave;s, 34300 Agde
        </footer>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-3xl text-white/80 hover:text-white"
            aria-label="Fermer"
          >
            &times;
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxUrl}
              alt=""
              width={800}
              height={800}
              className="h-auto max-h-[85vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
