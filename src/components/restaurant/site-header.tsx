"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { restaurantConfig } from "@/restaurant.config";

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-medium tracking-wide">
          {restaurantConfig.name}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-light tracking-wide hover:text-primary">
            {t("home")}
          </Link>
          <Link href="/menu" className="text-sm font-light tracking-wide hover:text-primary">
            {t("menu")}
          </Link>
          <Link
            href="/reservation"
            className="text-sm font-light tracking-wide hover:text-primary"
          >
            {t("reservation")}
          </Link>
          <Link href="/galerie" className="text-sm font-light tracking-wide hover:text-primary">
            {t("gallery")}
          </Link>
          <Link href="/contact" className="text-sm font-light tracking-wide hover:text-primary">
            {t("contact")}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
