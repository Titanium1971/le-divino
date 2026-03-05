import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getPublishedGalleryItems, getGalleryImageUrl } from "@/lib/supabase/gallery";
import type { Locale } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");

  const supabase = await createClient();
  const items = await getPublishedGalleryItems(supabase);

  // Debug: log generated URLs server-side
  if (items.length > 0) {
    console.log("[GalleryPage] Published items URLs:");
    items.forEach((item) => {
      console.log(`  - ${item.id} | path="${item.image_path}" | url=${getGalleryImageUrl(supabase, item.image_path)}`);
    });
  }

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

      {/* Gallery grid */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-6xl px-6">
          {items.length === 0 ? (
            <p className="text-center text-sm text-brand-dark/60">{t("empty")}</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {items.map((item, index) => {
                const span =
                  index === 0
                    ? "md:col-span-2"
                    : index === items.length - 1 && items.length > 2
                      ? "md:col-span-3"
                      : "";
                const captionText =
                  item.caption?.[locale as Locale] || item.caption?.fr || "";

                return (
                  <div
                    key={item.id}
                    className={`group relative overflow-hidden ${span}`}
                  >
                    <div className="aspect-[4/3]">
                      <Image
                        src={getGalleryImageUrl(supabase, item.image_path)}
                        alt={captionText}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                    </div>
                    {/* Subtle overlay on hover */}
                    <div className="pointer-events-none absolute inset-0 bg-brand-bordeaux/0 transition-colors duration-500 group-hover:bg-brand-bordeaux/10" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
