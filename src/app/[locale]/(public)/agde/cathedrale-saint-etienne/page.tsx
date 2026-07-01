import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE_URL, LOCALES, DEFAULT_LOCALE, getPageUrl } from "@/lib/seo/constants";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

const OG_LOCALE: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  it: "it_IT",
  es: "es_ES",
  de: "de_DE",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "agde" });
  const canonical = getPageUrl(locale, "agde/cathedrale-saint-etienne");

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = getPageUrl(loc, "agde/cathedrale-saint-etienne");
  }
  languages["x-default"] = getPageUrl(DEFAULT_LOCALE, "agde/cathedrale-saint-etienne");

  return {
    title: t("cathedrale.seo_title"),
    description: t("cathedrale.seo_description"),
    keywords: t("cathedrale.seo_keywords"),
    alternates: { canonical, languages },
    openGraph: {
      title: t("cathedrale.og_title"),
      description: t("cathedrale.og_description"),
      url: canonical,
      siteName: "Le Divino",
      locale: OG_LOCALE[locale] ?? "fr_FR",
      type: "article",
      images: [
        {
          url: `${SITE_URL}/images/hero-exterior-night.jpg`,
          width: 1200,
          height: 630,
          alt: t("cathedrale.og_image_alt"),
        },
      ],
    },
  };
}

function jsonLdBreadcrumb(
  t: Awaited<ReturnType<typeof getTranslations>>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("cathedrale.breadcrumb_home"),
        item: `${SITE_URL}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("cathedrale.breadcrumb_region"),
        item: `${SITE_URL}/agde/cathedrale-saint-etienne`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: t("cathedrale.breadcrumb_current"),
        item: `${SITE_URL}/agde/cathedrale-saint-etienne`,
      },
    ],
  };
}

function jsonLdLocalBusiness() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Le Divino",
    description:
      "Restaurant de cuisine traditionnelle francaise situe a cote de la cathedrale Saint-Etienne d'Agde, place Jean Jaures.",
    url: `${SITE_URL}`,
    telephone: "+33448177875",
    email: "contact@ledivino-agde.fr",
    image: `${SITE_URL}/images/hero-exterior-night.jpg`,
    priceRange: "$$",
    servesCuisine: "French",
    address: {
      "@type": "PostalAddress",
      streetAddress: "5 place Jean Jaures",
      addressLocality: "Agde",
      postalCode: "34300",
      addressRegion: "Occitanie",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.3108,
      longitude: 3.4731,
    },
  };
}

function jsonLdTouristAttraction() {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Cathedrale Saint-Etienne d'Agde",
    description:
      "Cathedrale-forteresse du XIIe siecle construite en basalte noir. Monument historique classe, l'un des edifices les plus remarquables du Languedoc.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Agde",
      postalCode: "34300",
      addressCountry: "FR",
    },
  };
}

export default async function CathedraleAgdePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "agde" });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumb(t)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdLocalBusiness()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdTouristAttraction()),
        }}
      />

      {/* ── Hero ── */}
      <section className="relative flex min-h-[60vh] items-center justify-center bg-brand-dark">
        <Image
          src="/images/hero-exterior-night.jpg"
          alt={t("cathedrale.hero_alt")}
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
          quality={80}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <nav
            aria-label="Fil d'Ariane"
            className="mb-8 text-xs font-light tracking-widest uppercase text-brand-cream/60"
          >
            <Link href="/" className="hover:text-brand-gold transition-colors">
              {t("cathedrale.breadcrumb_home")}
            </Link>
            <span className="mx-2">/</span>
            <span>{t("cathedrale.breadcrumb_region")}</span>
            <span className="mx-2">/</span>
            <span className="text-brand-cream/90">{t("cathedrale.breadcrumb_current")}</span>
          </nav>
          <h1 className="text-4xl font-extralight tracking-[0.15em] text-brand-cream md:text-5xl">
            {t("cathedrale.h1")}
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-lg font-light tracking-wide text-brand-cream/80">
            {t("cathedrale.hero_subtitle")}
          </p>
        </div>
      </section>

      {/* ── La Cathedrale Saint-Etienne ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              {t("cathedrale.s1_title")}
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
            <p>{t("cathedrale.s1_p1")}</p>
            <p>{t("cathedrale.s1_p2")}</p>
            <p>{t("cathedrale.s1_p3")}</p>
          </div>
        </div>
      </section>

      {/* ── Histoire et architecture ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/interieur-salle-bar.jpg"
                  alt={t("cathedrale.s2_image_alt")}
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
              {t("cathedrale.s2_title")}
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-cream/80">
              <p>{t("cathedrale.s2_p1")}</p>
              <p>{t("cathedrale.s2_p2")}</p>
              <p>{t("cathedrale.s2_p3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Le Divino a cote de la cathedrale ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:flex-row-reverse md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/exterior-terrace.jpg"
                  alt={t("cathedrale.s3_image_alt")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75}
                />
              </div>
            </div>
          </div>
          <div className="mt-10 md:mt-0 md:w-1/2">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-3xl">
              {t("cathedrale.s3_title")}
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-dark/90">
              <p>{t("cathedrale.s3_p1")}</p>
              <p>{t("cathedrale.s3_p2")}</p>
              <p>{t("cathedrale.s3_p3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Suggestions de visite ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
              {t("cathedrale.s4_title")}
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                step: t("cathedrale.s4_step1_label"),
                title: t("cathedrale.s4_step1_title"),
                text: t("cathedrale.s4_step1_text"),
              },
              {
                step: t("cathedrale.s4_step2_label"),
                title: t("cathedrale.s4_step2_title"),
                text: t("cathedrale.s4_step2_text"),
              },
              {
                step: t("cathedrale.s4_step3_label"),
                title: t("cathedrale.s4_step3_title"),
                text: t("cathedrale.s4_step3_text"),
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="text-xs font-normal tracking-[0.3em] uppercase text-brand-gold">
                  {item.step}
                </span>
                <h3 className="mt-3 text-sm font-normal tracking-[0.2em] uppercase text-brand-cream">
                  {item.title}
                </h3>
                <div className="mx-auto my-4 h-px w-10 bg-brand-gold" />
                <p className="text-sm font-light leading-relaxed text-brand-cream/70">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Infos pratiques ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-3xl">
            {t("cathedrale.practical_title")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <div className="mt-10 space-y-3 text-base font-light text-brand-dark/90">
            <p>
              <strong className="font-normal text-brand-dark">
                {t("cathedrale.practical_address_label")}
              </strong>{" "}
              {t("cathedrale.practical_address")}
            </p>
            <p>
              <strong className="font-normal text-brand-dark">
                {t("cathedrale.practical_phone_label")}
              </strong>{" "}
              <a href="tel:+33448177875" className="underline hover:text-brand-bordeaux transition-colors">
                04 48 17 78 75
              </a>
            </p>
            <p>
              <strong className="font-normal text-brand-dark">
                {t("cathedrale.practical_hours_label")}
              </strong>{" "}
              {t("cathedrale.practical_hours")}
            </p>
            <p>
              <strong className="font-normal text-brand-dark">
                {t("cathedrale.practical_advice_label")}
              </strong>{" "}
              {t("cathedrale.practical_advice")}
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Reservation ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-cream md:text-4xl">
            {t("cathedrale.cta_title")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-base font-light text-brand-cream/80">
            {t("cathedrale.cta_text")}
          </p>
          <Link
            href="/reservation"
            className="mt-10 inline-block border border-brand-gold px-12 py-4 text-xs font-normal tracking-[0.2em] uppercase text-brand-gold transition-all duration-300 hover:bg-brand-gold hover:text-brand-dark"
          >
            {t("cathedrale.cta_button")}
          </Link>
          <p className="mt-6 text-sm font-light text-brand-cream/60">
            {t("cathedrale.cta_phone")}
          </p>
        </div>
      </section>

      {/* ── Decouvrir aussi ── */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-3xl">
            {t("cathedrale.also_title")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:flex-wrap">
            <Link
              href="/agde/chateau-laurens"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              {t("cathedrale.also_chateau")}
            </Link>
            <Link
              href="/agde/promenade"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              {t("cathedrale.also_promenade")}
            </Link>
            <Link
              href="/agde/musee-agathois"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              {t("cathedrale.also_musee")}
            </Link>
            <Link
              href="/restaurant-agde"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              {t("cathedrale.also_restaurant")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
