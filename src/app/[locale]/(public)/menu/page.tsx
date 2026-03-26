import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDishesGrouped, getDishImageUrl } from "@/lib/supabase/dishes";
import { MenuClient } from "./menu-client";
import { generatePageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "menu");
}

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menu");

  const supabase = await createClient();
  const grouped = await getDishesGrouped(supabase);

  // Only keep groups with available dishes, and only "carte" dishes for public menu
  const filteredGrouped = grouped
    .map((g) => ({
      ...g,
      dishes: g.dishes.filter((d) => d.available && d.source === "carte"),
    }))
    .filter((g) => g.dishes.length > 0);

  // Build image URL map for all dishes that have images
  const imageUrls: Record<string, string> = {};
  for (const dish of filteredGrouped.flatMap((g) => g.dishes)) {
    if (dish.image_path) {
      imageUrls[dish.id] = getDishImageUrl(supabase, dish.image_path);
    }
  }

  const breadcrumb = breadcrumbJsonLd(locale, "menu", t("title"));

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

      {/* Menu content */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-4xl px-6">
          {filteredGrouped.length === 0 ? (
            <p className="text-center text-brand-dark/70 font-light">{t("empty")}</p>
          ) : (
            <MenuClient
              grouped={filteredGrouped}
              locale={locale}
              imageUrls={imageUrls}
            />
          )}
        </div>
      </section>
    </>
  );
}
