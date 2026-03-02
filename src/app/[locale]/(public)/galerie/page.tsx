import { setRequestLocale } from "next-intl/server";
import { GalleryGrid } from "@/components/restaurant/gallery-grid";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-light tracking-wide">Galerie</h1>
      <div className="mt-8">
        <GalleryGrid />
      </div>
    </div>
  );
}
