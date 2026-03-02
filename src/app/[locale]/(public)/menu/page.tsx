import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MenuPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-light tracking-wide">La Carte</h1>
      {/* Menu categories fetched from Supabase */}
    </div>
  );
}
