import { setRequestLocale } from "next-intl/server";
import { ContactInfo } from "@/components/restaurant/contact-info";
import { MapEmbed } from "@/components/restaurant/map-embed";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-light tracking-wide">Contact</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <ContactInfo />
        <MapEmbed />
      </div>
    </div>
  );
}
