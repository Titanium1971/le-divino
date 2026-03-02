import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDishesGrouped } from "@/lib/supabase/dishes";
import { getMenus } from "@/lib/supabase/menus";
import { MenuClient } from "./menu-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menu");

  const supabase = await createClient();
  const [grouped, menus] = await Promise.all([
    getDishesGrouped(supabase),
    getMenus(supabase),
  ]);

  // Only keep categories that have available dishes
  const filteredGrouped = grouped
    .map((g) => ({
      category: g.category,
      dishes: g.dishes.filter((d) => d.available),
    }))
    .filter((g) => g.dishes.length > 0);

  const availableMenus = menus.filter((m) => m.available);

  return (
    <>
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

      {/* Menu content */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-4xl px-6">
          {filteredGrouped.length === 0 && availableMenus.length === 0 ? (
            <p className="text-center text-brand-dark/70 font-light">{t("empty")}</p>
          ) : (
            <MenuClient
              grouped={filteredGrouped}
              menus={availableMenus}
              locale={locale}
            />
          )}
        </div>
      </section>
    </>
  );
}
