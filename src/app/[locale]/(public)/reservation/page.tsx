import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getConges } from "@/lib/supabase/conges";
import { ReservationForm } from "@/components/restaurant/reservation-form";
import { CongesBanner } from "@/components/restaurant/conges-banner";
import { generatePageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "reservation");
}

export default async function ReservationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reservation");
  const breadcrumb = breadcrumbJsonLd(locale, "reservation", t("title"));

  const supabase = await createClient();
  const conges = await getConges(supabase, locale);

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

      {/* Form or congés message */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-xl px-6">
          {conges.actif ? (
            <CongesBanner
              message={conges.message}
              dateDebut={conges.dateDebut}
              dateFin={conges.dateFin}
            />
          ) : (
            <ReservationForm />
          )}
        </div>
      </section>
    </>
  );
}
