import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDishesGrouped, getDishImageUrl } from "@/lib/supabase/dishes";
import { getTotalDishCount } from "@/lib/supabase/dish-count";
import { getWines, getWinesGrouped, getWineImageUrl } from "@/lib/supabase/wines";
import { getDrinks, getDrinksGrouped, getDrinkImageUrl } from "@/lib/supabase/drinks";
import type { Dish, Menu } from "@/lib/types/database";
import { QrClient } from "./qr-client";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Le Divino — Menu",
    robots: { index: false, follow: false },
  };
}

type MenuWithDishes = Menu & {
  dishes: { category: string; dish: Dish; imageUrl: string | null }[];
};

export default async function QrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  // ── Fetch all data in parallel ──
  const [dishGroups, menusRaw, wines, drinks] = await Promise.all([
    getDishesGrouped(supabase),
    supabase
      .from("menus")
      .select(`*, menu_dishes(dishes(*))`)
      .eq("active", true)
      .then(({ data }) => data ?? []),
    getWines(supabase),
    getDrinks(supabase),
  ]);

  // ── Dishes (carte only, available) ──
  const filteredDishGroups = dishGroups
    .map((g) => ({
      ...g,
      dishes: g.dishes.filter((d) => d.available && d.source === "carte"),
    }))
    .filter((g) => g.dishes.length > 0);

  const dishImageUrls: Record<string, string> = {};
  for (const dish of filteredDishGroups.flatMap((g) => g.dishes)) {
    if (dish.image_path) {
      dishImageUrls[dish.id] = getDishImageUrl(supabase, dish.image_path);
    }
  }

  // ── Menus with their dishes ──
  const menusWithDishes: MenuWithDishes[] = menusRaw.map((menu) => {
    const dishes = (menu.menu_dishes ?? [])
      .map((md: { dishes: Dish }) => md.dishes)
      .filter(Boolean) as Dish[];

    const seen = new Set<string>();
    const uniqueDishes = dishes.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });

    return {
      ...menu,
      menu_dishes: undefined,
      dishes: uniqueDishes.map((dish) => ({
        category: dish.category,
        dish,
        imageUrl: dish.image_path ? getDishImageUrl(supabase, dish.image_path) : null,
      })),
    } as MenuWithDishes;
  });

  // ── Wines (available) ──
  const availableWines = wines.filter((w) => w.available);
  const wineGroups = getWinesGrouped(availableWines).filter((g) => g.wines.length > 0);

  const wineImageUrls: Record<string, string> = {};
  for (const wine of availableWines) {
    if (wine.image_path) {
      wineImageUrls[wine.id] = getWineImageUrl(supabase, wine.image_path);
    }
  }

  // ── Drinks (available) ──
  const availableDrinks = drinks.filter((d) => d.available);
  const drinkGroups = getDrinksGrouped(availableDrinks).filter((g) => g.drinks.length > 0);

  const drinkImageUrls: Record<string, string> = {};
  for (const drink of availableDrinks) {
    if (drink.image_path) {
      drinkImageUrls[drink.id] = getDrinkImageUrl(supabase, drink.image_path);
    }
  }

  // Total numbered dishes (available + menu-only) for global numbering
  const totalDishCount = await getTotalDishCount(supabase);

  return (
    <QrClient
      locale={locale}
      dishGroups={filteredDishGroups}
      dishImageUrls={dishImageUrls}
      menus={menusWithDishes}
      wineGroups={wineGroups}
      wineImageUrls={wineImageUrls}
      drinkGroups={drinkGroups}
      drinkImageUrls={drinkImageUrls}
      defaultTab="boissons"
      tabOrder={["boissons", "carte", "menus", "vins"]}
      totalDishCount={totalDishCount}
    />
  );
}
