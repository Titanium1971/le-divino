import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getWines, getWinesGrouped, getWineImageUrl } from "@/lib/supabase/wines";
import { getTotalDishCount } from "@/lib/supabase/dish-count";
import { getDrinks } from "@/lib/supabase/drinks";
import { WinesClient } from "./wines-client";
import { generatePageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "vins");
}

export default async function WinesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wines");

  const supabase = await createClient();
  const wines = await getWines(supabase);
  const availableWines = wines.filter((w) => w.available);
  const groups = getWinesGrouped(availableWines);
  const nonEmptyGroups = groups.filter((g) => g.wines.length > 0);

  // Build image URLs server-side
  const imageUrls: Record<string, string> = {};
  for (const wine of availableWines) {
    if (wine.image_path) {
      imageUrls[wine.id] = getWineImageUrl(supabase, wine.image_path);
    }
  }

  // Count ALL numbered dishes (available + menu-only) for global numbering
  const dishCount = await getTotalDishCount(supabase);

  const allDrinks = await getDrinks(supabase);
  const drinkCount = allDrinks.filter(d => d.available).length;

  // Build wine number map (global numbering: after dishes + drinks)
  const wineNumbers: Record<string, number> = {};
  let counter = dishCount + drinkCount + 1;
  for (const group of nonEmptyGroups) {
    for (const wine of group.wines) {
      wineNumbers[wine.id] = counter++;
    }
  }

  const breadcrumb = breadcrumbJsonLd(locale, "vins", t("title"));

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

      {/* Wines content */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-4xl px-6">
          {nonEmptyGroups.length === 0 ? (
            <p className="text-center text-brand-dark/70 font-light">{t("empty")}</p>
          ) : (
            <WinesClient groups={nonEmptyGroups} locale={locale} imageUrls={imageUrls} wineNumbers={wineNumbers} />
          )}
        </div>
      </section>
    </>
  );
}
