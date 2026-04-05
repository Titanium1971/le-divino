import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { generatePageMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata(locale, "restaurant-cap-agde");
}

export default async function RestaurantCapAgdePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing.restaurant-cap-agde");
  const breadcrumb = breadcrumbJsonLd(locale, "restaurant-cap-agde", t("breadcrumb"));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* ── Hero ── */}
      <section className="relative flex min-h-[60vh] items-center justify-center bg-brand-dark">
        <Image
          src="/images/salle-bord-eau.jpg"
          alt="Restaurant Le Divino à Agde, à 5 minutes du Cap d'Agde"
          fill
          className="object-cover opacity-40"
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={80}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-extralight tracking-[0.15em] text-brand-cream md:text-5xl">
            {t("hero_title")}
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-lg font-light tracking-wide text-brand-cream/80">
            {t("hero_subtitle")}
          </p>
        </div>
      </section>

      {/* ── Introduction ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              {t("intro_title")}
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
            <p className="mx-auto mt-8 max-w-2xl text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
              {t("intro_text")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Pourquoi quitter le Cap ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/interieur-salle-bar.jpg"
                  alt="Intérieur du restaurant Le Divino Agde, ambiance chaleureuse"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75}
                />
              </div>
            </div>
          </div>
          <div className="mt-10 md:mt-0 md:w-1/2">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
              {t("pourquoi_title")}
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <p className="mt-6 text-base font-light leading-relaxed text-brand-cream/80">
              {t("pourquoi_text")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Accès facile ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-3xl">
              {t("acces_title")}
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
            <p className="mx-auto mt-8 max-w-2xl text-base font-light leading-relaxed text-brand-dark/90">
              {t("acces_text")}
            </p>
          </div>

          {/* 4 avantages pratiques */}
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {(["trajet", "parking", "terrasse", "prix"] as const).map((key) => (
              <div key={key} className="text-center">
                <div className="mx-auto mb-4 h-px w-10 bg-brand-gold" />
                <h3 className="text-sm font-normal tracking-[0.2em] uppercase text-brand-bordeaux">
                  {t(`${key}_title`)}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-brand-dark/70">
                  {t(`${key}_text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notre cuisine ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:flex-row-reverse md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/bar-divino.jpg"
                  alt="Bar et spécialités du restaurant Le Divino Agde"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75}
                />
              </div>
            </div>
          </div>
          <div className="mt-10 md:mt-0 md:w-1/2">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
              {t("carte_title")}
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <p className="mt-6 text-base font-light leading-relaxed text-brand-cream/80">
              {t("carte_text")}
            </p>
            <Link
              href="/menu"
              className="mt-8 inline-block border border-brand-gold/50 px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-gold transition-all duration-300 hover:border-brand-gold hover:bg-brand-gold hover:text-brand-dark"
            >
              Voir la carte
            </Link>
          </div>
        </div>
      </section>

      {/* ── Avis clients ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-3xl">
            {t("avis_title")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mx-auto mt-8 max-w-xl text-base font-light italic leading-relaxed text-brand-dark/80">
            {t("avis_text")}
          </p>
        </div>
      </section>

      {/* ── CTA Réservation ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-cream md:text-4xl">
            {t("cta_title")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-base font-light text-brand-cream/80">
            {t("cta_text")}
          </p>
          <Link
            href="/reservation"
            className="mt-10 inline-block border border-brand-gold px-12 py-4 text-xs font-normal tracking-[0.2em] uppercase text-brand-gold transition-all duration-300 hover:bg-brand-gold hover:text-brand-dark"
          >
            {t("cta_button")}
          </Link>
          <p className="mt-6 text-sm font-light text-brand-cream/60">
            {t("cta_phone")}
          </p>
        </div>
      </section>
    </>
  );
}
