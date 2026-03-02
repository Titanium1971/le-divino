import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ReservationForm } from "@/components/restaurant/reservation-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ReservationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reservation");

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

      {/* Form */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-xl px-6">
          <ReservationForm />
        </div>
      </section>
    </>
  );
}
