import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

const GALLERY_IMAGES = [
  { src: "/images/salle-bord-eau.jpg", alt: "Salle au bord de l'eau", span: "md:col-span-2" },
  { src: "/images/bar-divino.jpg", alt: "Le bar", span: "" },
  { src: "/images/interieur-salle-bar.jpg", alt: "Intérieur et bar", span: "" },
  { src: "/images/salle-bar-divino.jpg", alt: "Salle de restaurant", span: "md:col-span-2" },
  { src: "/images/exterior-terrace.jpg", alt: "Terrasse extérieure", span: "md:col-span-3" },
];

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");

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
          <div className="grid gap-3 md:grid-cols-3">
            {GALLERY_IMAGES.map((img) => (
              <div
                key={img.src}
                className={`group relative overflow-hidden ${img.span}`}
              >
                <div className="aspect-[4/3]">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={80}
                  />
                </div>
                {/* Subtle overlay on hover */}
                <div className="pointer-events-none absolute inset-0 bg-brand-bordeaux/0 transition-colors duration-500 group-hover:bg-brand-bordeaux/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
