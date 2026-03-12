import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDrinks, getDrinksGrouped } from "@/lib/supabase/drinks";
import { DrinksClient } from "./drinks-client";
import { generatePageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "boissons");
}

export default async function DrinksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("drinks");

  const supabase = await createClient();
  const drinks = await getDrinks(supabase);
  const availableDrinks = drinks.filter((d) => d.available);
  const groups = getDrinksGrouped(availableDrinks);
  const nonEmptyGroups = groups.filter((g) => g.drinks.length > 0);

  const breadcrumb = breadcrumbJsonLd(locale, "boissons", t("title"));

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

      {/* Drinks content */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-4xl px-6">
          {nonEmptyGroups.length === 0 ? (
            <p className="text-center text-brand-dark/70 font-light">{t("empty")}</p>
          ) : (
            <DrinksClient groups={nonEmptyGroups} locale={locale} />
          )}
        </div>
      </section>
    </>
  );
}
