import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_PAGES, LOCALES, DEFAULT_LOCALE } from "@/lib/seo/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of PUBLIC_PAGES) {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
      const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
      const suffix = page.path ? `/${page.path}` : "";
      languages[locale] = `${SITE_URL}${prefix}${suffix}`;
    }
    // x-default points to the default locale (unprefixed)
    const suffix = page.path ? `/${page.path}` : "";
    languages["x-default"] = `${SITE_URL}${suffix}`;

    entries.push({
      url: `${SITE_URL}${suffix}`,
      lastModified: new Date(),
      changeFrequency: page.path === "" ? "weekly" : "monthly",
      priority: page.priority,
      alternates: { languages },
    });
  }

  return entries;
}
