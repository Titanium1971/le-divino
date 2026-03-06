import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getPublishedGalleryItems, getGalleryImageUrl } from "@/lib/supabase/gallery";
import type { Locale } from "@/lib/types/database";
import { GalleryClient } from "./gallery-client";
import { generatePageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "gallery");
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");

  const supabase = await createClient();
  const items = await getPublishedGalleryItems(supabase);

  const images = items.map((item) => ({
    id: item.id,
    url: getGalleryImageUrl(supabase, item.image_path),
    caption: item.caption?.[locale as Locale] || item.caption?.fr || "",
    tag: item.tag,
  }));

  const breadcrumb = breadcrumbJsonLd(locale, "gallery", t("title"));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {/* Page header — dark background */}
      <section className="bg-brand-dark pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-extralight tracking-[0.3em] text-brand-cream uppercase md:text-5xl">
            {t("title")}
          </h1>
          <div className="gallery-separator mx-auto mt-6 h-px bg-brand-gold" />
          <p className="mt-6 text-sm font-light tracking-[0.15em] uppercase text-brand-gold/80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Gallery — dark background for premium feel */}
      <section className="bg-brand-dark pb-24 pt-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GalleryClient images={images} />
        </div>
      </section>
    </>
  );
}
