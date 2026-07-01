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
  const canonical = getPageUrl(locale, "agde/promenade");

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = getPageUrl(loc, "agde/promenade");
  }
  languages["x-default"] = getPageUrl(DEFAULT_LOCALE, "agde/promenade");

  return {
    title: t("promenade.seo_title"),
    description: t("promenade.seo_description"),
    keywords: t("promenade.seo_keywords"),
    alternates: { canonical, languages },
    openGraph: {
      title: t("promenade.og_title"),
      description: t("promenade.og_description"),
      url: canonical,
      siteName: "Le Divino",
      locale: OG_LOCALE[locale] ?? "fr_FR",
      type: "article",
      images: [
        {
          url: `${SITE_URL}/images/exterior-terrace.jpg`,
          width: 1200,
          height: 630,
          alt: t("promenade.og_image_alt"),
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
        name: t("promenade.breadcrumb_home"),
        item: `${SITE_URL}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("promenade.breadcrumb_region"),
        item: `${SITE_URL}/agde/promenade`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: t("promenade.breadcrumb_current"),
        item: `${SITE_URL}/agde/promenade`,
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
      "Restaurant de cuisine traditionnelle francaise situe a quelques pas de la promenade d'Agde, place Jean Jaures.",
    url: `${SITE_URL}`,
    telephone: "+33448177875",
    email: "contact@ledivino-agde.fr",
    image: `${SITE_URL}/images/exterior-terrace.jpg`,
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
    name: "Promenade d'Agde",
    description:
      "Promenade en bord de l'Herault dans le centre historique d'Agde. Balades le long des quais, vue sur la vieille ville en basalte noir.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Agde",
      postalCode: "34300",
      addressCountry: "FR",
    },
  };
}

export default async function PromenadeAgdePage({ params }: Props) {
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
          src="/images/exterior-terrace.jpg"
          alt={t("promenade.hero_alt")}
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
              {t("promenade.breadcrumb_home")}
            </Link>
            <span className="mx-2">/</span>
            <span>{t("promenade.breadcrumb_region")}</span>
            <span className="mx-2">/</span>
            <span className="text-brand-cream/90">{t("promenade.breadcrumb_current")}</span>
          </nav>
          <h1 className="text-4xl font-extralight tracking-[0.15em] text-brand-cream md:text-5xl">
            {t("promenade.h1")}
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-lg font-light tracking-wide text-brand-cream/80">
            {t("promenade.hero_subtitle")}
          </p>
        </div>
      </section>

      {/* ── La Promenade d'Agde : un ecrin de patrimoine ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              {t("promenade.s1_title")}
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
            <p>{t("promenade.s1_p1")}</p>
            <p>{t("promenade.s1_p2")}</p>
            <p>{t("promenade.s1_p3")}</p>
          </div>
        </div>
      </section>

      {/* ── Un lieu charge d'histoire ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/salle-bord-eau.jpg"
                  alt={t("promenade.s2_image_alt")}
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
              {t("promenade.s2_title")}
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-cream/80">
              <p>{t("promenade.s2_p1")}</p>
              <p>{t("promenade.s2_p2")}</p>
              <p>{t("promenade.s2_p3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Le Divino : a quelques pas de la promenade ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:flex-row-reverse md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/bar-divino.jpg"
                  alt={t("promenade.s3_image_alt")}
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
              {t("promenade.s3_title")}
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-dark/90">
              <p>{t("promenade.s3_p1")}</p>
              <p>{t("promenade.s3_p2")}</p>
              <p>{t("promenade.s3_p3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pourquoi dejeuner pres de la promenade ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
              {t("promenade.s4_title")}
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: t("promenade.s4_card1_title"), text: t("promenade.s4_card1_text") },
              { title: t("promenade.s4_card2_title"), text: t("promenade.s4_card2_text") },
              { title: t("promenade.s4_card3_title"), text: t("promenade.s4_card3_text") },
              { title: t("promenade.s4_card4_title"), text: t("promenade.s4_card4_text") },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 h-px w-10 bg-brand-gold" />
                <h3 className="text-sm font-normal tracking-[0.2em] uppercase text-brand-cream">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-brand-cream/70">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parcours suggere ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              {t("promenade.s5_title")}
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
            <p>
              {t.rich("promenade.s5_p1", {
                link: (chunks) => (
                  <Link
                    href="/agde/cathedrale-saint-etienne"
                    className="text-brand-bordeaux underline decoration-brand-gold underline-offset-4 transition-colors hover:text-brand-gold"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
            <p>{t("promenade.s5_p2")}</p>
            <p>
              {t.rich("promenade.s5_p3", {
                link: (chunks) => (
                  <Link
                    href="/agde/musee-agathois"
                    className="text-brand-bordeaux underline decoration-brand-gold underline-offset-4 transition-colors hover:text-brand-gold"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ── Infos pratiques ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
            {t("promenade.practical_title")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <div className="mt-10 space-y-3 text-base font-light text-brand-cream/80">
            <p>
              <strong className="font-normal text-brand-cream">
                {t("promenade.practical_address_label")}
              </strong>{" "}
              {t("promenade.practical_address")}
            </p>
            <p>
              <strong className="font-normal text-brand-cream">
                {t("promenade.practical_phone_label")}
              </strong>{" "}
              <a href="tel:+33448177875" className="underline hover:text-brand-gold transition-colors">
                04 48 17 78 75
              </a>
            </p>
            <p>
              <strong className="font-normal text-brand-cream">
                {t("promenade.practical_hours_label")}
              </strong>{" "}
              {t("promenade.practical_hours")}
            </p>
            <p>
              <strong className="font-normal text-brand-cream">
                {t("promenade.practical_access_label")}
              </strong>{" "}
              {t("promenade.practical_access")}
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Reservation ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-cream md:text-4xl">
            {t("promenade.cta_title")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-base font-light text-brand-cream/80">
            {t("promenade.cta_text")}
          </p>
          <Link
            href="/reservation"
            className="mt-10 inline-block border border-brand-gold px-12 py-4 text-xs font-normal tracking-[0.2em] uppercase text-brand-gold transition-all duration-300 hover:bg-brand-gold hover:text-brand-dark"
          >
            {t("promenade.cta_button")}
          </Link>
          <p className="mt-6 text-sm font-light text-brand-cream/60">
            {t("promenade.cta_phone")}
          </p>
        </div>
      </section>

      {/* ── Decouvrir aussi ── */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-3xl">
            {t("promenade.also_title")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:flex-wrap">
            <Link
              href="/agde/chateau-laurens"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              {t("promenade.also_chateau")}
            </Link>
            <Link
              href="/agde/cathedrale-saint-etienne"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              {t("promenade.also_cathedrale")}
            </Link>
            <Link
              href="/agde/musee-agathois"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              {t("promenade.also_musee")}
            </Link>
            <Link
              href="/restaurant-agde"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              {t("promenade.also_restaurant")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
