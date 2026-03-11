import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDishImageUrl } from "@/lib/supabase/dishes";
import type { Dish, Menu } from "@/lib/types/database";
import { MenusClient } from "./menus-client";
import { generatePageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

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
        available_today,
        dishes(*)
      )
    `)
    .eq("active", true);

  const menusWithDishes: MenuWithDishes[] = (data ?? []).map((menu) => {
    const todayDishes = (menu.menu_dishes ?? [])
      .filter((md: { available_today: boolean }) => md.available_today)
      .map((md: { dishes: Dish }) => md.dishes)
      .filter(Boolean) as Dish[];

    // Deduplicate by dish id
    const seen = new Set<string>();
    const uniqueDishes = todayDishes.filter((d) => {
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
            <MenusClient menus={menusWithDishes} locale={locale} />
          )}
        </div>
      </section>
    </>
  );
}
