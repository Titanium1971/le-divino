import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_PAGES, LOCALES, DEFAULT_LOCALE } from "@/lib/seo/constants";

function buildUrl(locale: string, path: string): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const suffix = path ? `/${path}` : "";
  return `${SITE_URL}${prefix}${suffix}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of PUBLIC_PAGES) {
    // Build alternates for all locales + x-default
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
      languages[locale] = buildUrl(locale, page.path);
    }
    languages["x-default"] = buildUrl(DEFAULT_LOCALE, page.path);

    // One entry per locale
    for (const locale of LOCALES) {
      entries.push({
        url: buildUrl(locale, page.path),
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages },
      });
    }
  }

  return entries;
}
