import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_URL, LOCALES, DEFAULT_LOCALE, getPageUrl } from "./constants";
import type { DishGroup } from "@/lib/supabase/dishes";

type PageKey = "home" | "menu" | "menus" | "vins" | "boissons" | "reservation" | "gallery" | "events" | "contact" | "restaurant-agde" | "restaurant-terrasse-agde" | "restaurant-cap-agde";

const PAGE_PATH: Record<PageKey, string> = {
  home: "",
  menu: "menu",
  menus: "menus",
  vins: "vins",
  boissons: "boissons",
  reservation: "reservation",
  gallery: "galerie",
  events: "evenements",
  contact: "contact",
  "restaurant-agde": "restaurant-agde",
  "restaurant-terrasse-agde": "restaurant-terrasse-agde",
  "restaurant-cap-agde": "restaurant-cap-agde",
};

export async function generatePageMetadata(
  locale: string,
  pageKey: PageKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo" });
  const path = PAGE_PATH[pageKey];
  const canonical = getPageUrl(locale, path);

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = getPageUrl(loc, path);
  }
  languages["x-default"] = getPageUrl(DEFAULT_LOCALE, path);

  return {
    title: t(`${pageKey}.title`),
    description: t(`${pageKey}.description`),
    keywords: t(`${pageKey}.keywords`),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: t(`${pageKey}.title`),
      description: t(`${pageKey}.description`),
      url: canonical,
      siteName: "Le Divino",
      locale: locale,
      type: pageKey === "home" ? "website" : "article",
      images: [
        {
          url: `${SITE_URL}/images/hero-exterior-night.jpg`,
          width: 1200,
          height: 630,
          alt: "Le Divino — Restaurant Agde",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t(`${pageKey}.title`),
      description: t(`${pageKey}.description`),
      images: [`${SITE_URL}/images/hero-exterior-night.jpg`],
    },
  };
}

export function homeBreadcrumbJsonLd(
  locale: string,
  homeLabel: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: getPageUrl(locale, ""),
      },
    ],
  };
}

export function breadcrumbJsonLd(
  locale: string,
  pageName: string,
  pageLabel: string,
) {
  const path = PAGE_PATH[pageName as PageKey] ?? pageName;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Le Divino",
        item: getPageUrl(locale, ""),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageLabel,
        item: getPageUrl(locale, path),
      },
    ],
  };
}

const LOCALE_SUFFIX: Record<string, "fr" | "en" | "it" | "es" | "de"> = {
  fr: "fr",
  en: "en",
  it: "it",
  es: "es",
  de: "de",
};

export function menuJsonLd(locale: string, groups: DishGroup[]) {
  const lang = LOCALE_SUFFIX[locale] ?? "fr";

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "La Carte — Le Divino",
    url: getPageUrl(locale, "menu"),
    hasMenuSection: groups.map((group) => ({
      "@type": "MenuSection",
      name: group.label,
      hasMenuItem: group.dishes.map((dish) => {
        const name = dish[`name_${lang}`] ?? dish.name_fr;
        const description = dish[`description_${lang}`] ?? dish.description_fr;

        return {
          "@type": "MenuItem",
          name,
          ...(description ? { description } : {}),
          offers: {
            "@type": "Offer",
            price: dish.price.toFixed(2),
            priceCurrency: "EUR",
          },
        };
      }),
    })),
  };
}
