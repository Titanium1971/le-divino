import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Réservation confirmée — Le Divino",
  description: "Votre réservation au restaurant Le Divino à Agde est confirmée.",
  robots: { index: false, follow: false },
};

export default async function ReservationMerciPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Page header */}
      <section className="bg-brand-dark pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-light tracking-[0.2em] text-brand-cream uppercase md:text-5xl">
            Merci
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
        </div>
      </section>

      {/* Confirmation message */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <div className="mx-auto mb-6 h-px w-16 bg-brand-gold" />
          <p className="text-base font-light text-brand-dark/90 leading-relaxed">
            Votre réservation est confirmée !
          </p>
          <p className="mt-4 text-sm font-light text-brand-dark/70 leading-relaxed">
            Nous avons hâte de vous accueillir au Divino. Pour toute modification,
            contactez-nous au <strong>04 48 17 78 75</strong>.
          </p>
          <div className="mt-10">
            <Link
              href="/"
              className="border border-brand-bordeaux px-12 py-4 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream inline-block"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
