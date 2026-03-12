import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_URL, LOCALES, DEFAULT_LOCALE, getPageUrl } from "./constants";

type PageKey = "home" | "menu" | "menus" | "vins" | "boissons" | "reservation" | "gallery" | "contact";

const PAGE_PATH: Record<PageKey, string> = {
  home: "",
  menu: "menu",
  menus: "menus",
  vins: "vins",
  boissons: "boissons",
  reservation: "reservation",
  gallery: "galerie",
  contact: "contact",
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
