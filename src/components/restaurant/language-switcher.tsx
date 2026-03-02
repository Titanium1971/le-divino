"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  fr: "FR",
  en: "EN",
  it: "IT",
  es: "ES",
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
      className="rounded border bg-transparent px-2 py-1 text-sm font-light"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeLabels[loc]}
        </option>
      ))}
    </select>
  );
}
