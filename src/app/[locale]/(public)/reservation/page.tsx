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
          {process.env.RESERVATIONS_ENABLED !== "true" ? (
            /* Kill-switch: reservations module disabled (unpaid invoice).
               Re-enable by setting RESERVATIONS_ENABLED="true" on Vercel. */
            <div className="text-center py-12">
              <div className="mx-auto mb-6 h-px w-16 bg-brand-gold" />
              <p className="text-base font-light leading-relaxed text-brand-dark/90">
                Les réservations en ligne sont temporairement indisponibles.
                <br />
                Merci de nous contacter directement au{" "}
                <a href="tel:+33448177875" className="underline hover:text-brand-dark">
                  04 48 17 78 75
                </a>{" "}
                ou par email à{" "}
                <a
                  href="mailto:contact@ledivino-agde.fr"
                  className="underline hover:text-brand-dark"
                >
                  contact@ledivino-agde.fr
                </a>
                .
              </p>
            </div>
          ) : conges.actif ? (
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
