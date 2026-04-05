import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "it", "es", "de"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  localeDetection: false,
});
