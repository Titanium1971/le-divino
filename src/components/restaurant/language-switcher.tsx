"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  fr: "FR",
  en: "EN",
  it: "IT",
  es: "ES",
  de: "DE",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <select
      value={locale}
      onChange={(e) => onChange(e.target.value)}
      aria-label={
        locale === "en"
          ? "Choose language"
          : locale === "it"
            ? "Scegli la lingua"
            : locale === "es"
              ? "Elegir idioma"
              : locale === "de"
                ? "Sprache wählen"
                : "Choisir la langue"
      }
      className="appearance-none rounded-none border border-brand-cream/40 bg-transparent px-3 py-1.5 text-[11px] font-light tracking-[0.15em] text-brand-cream transition-colors hover:border-brand-gold hover:text-brand-gold focus:outline-none"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc} className="bg-brand-dark text-brand-cream">
          {localeLabels[loc]}
        </option>
      ))}
    </select>
  );
}
