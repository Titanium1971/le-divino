import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDishImageUrl, getDishesGrouped } from "@/lib/supabase/dishes";
import type { Dish, Menu } from "@/lib/types/database";
import { MenusClient } from "./menus-client";
import { generatePageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "menus");
}

type MenuWithDishes = Menu & {
  dishes: { category: string; dish: Dish; imageUrl: string | null }[];
};

export default async function MenusPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menus");

  const supabase = await createClient();
  const { data } = await supabase
    .from("menus")
    .select(`
      *,
      menu_dishes(
        dishes(*)
      )
    `)
    .eq("active", true);

  const menusWithDishes: MenuWithDishes[] = (data ?? []).map((menu) => {
    const dishes = (menu.menu_dishes ?? [])
      .map((md: { dishes: Dish }) => md.dishes)
      .filter(Boolean) as Dish[];

    // Deduplicate by dish id
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

  // Build dish number map: carte dishes first (1-N), then marché dishes (N+1-M)
  const dishGroups = await getDishesGrouped(supabase);
  const carteGroups = dishGroups
    .map((g) => ({ ...g, dishes: g.dishes.filter((d) => d.available && d.source === "carte") }))
    .filter((g) => g.dishes.length > 0);
  const marcheGroups = dishGroups
    .map((g) => ({ ...g, dishes: g.dishes.filter((d) => d.available && d.source === "marche") }))
    .filter((g) => g.dishes.length > 0);
  const dishNumbers: Record<string, number> = {};
  let counter = 1;
  for (const group of carteGroups) {
    for (const dish of group.dishes) {
      dishNumbers[dish.id] = counter++;
    }
  }
  for (const group of marcheGroups) {
    for (const dish of group.dishes) {
      if (!dishNumbers[dish.id]) {
        dishNumbers[dish.id] = counter++;
      }
    }
  }
  // Also number any dish that appears in menus but wasn't in carte/marché groups
  for (const menu of menusWithDishes) {
    for (const { dish } of menu.dishes) {
      if (!dishNumbers[dish.id]) {
        dishNumbers[dish.id] = counter++;
      }
    }
  }

  const breadcrumb = breadcrumbJsonLd(locale, "menus", t("title"));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {/* Page header */}
      <section className="bg-brand-dark pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-light tracking-[0.2em] text-brand-cream uppercase md:text-5xl">
            {t("title")}
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-sm font-light tracking-[0.15em] uppercase text-brand-gold">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Menus content */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-4xl px-6">
          {menusWithDishes.length === 0 ? (
            <p className="text-center text-brand-dark/70 font-light">{t("empty")}</p>
          ) : (
            <MenusClient menus={menusWithDishes} locale={locale} dishNumbers={dishNumbers} />
          )}
        </div>
      </section>
    </>
  );
}
