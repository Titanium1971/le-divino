import { setRequestLocale } from "next-intl/server";
import { ReservationForm } from "@/components/restaurant/reservation-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ReservationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-light tracking-wide">Réservation</h1>
      <div className="mt-8">
        <ReservationForm />
      </div>
    </div>
  );
}
