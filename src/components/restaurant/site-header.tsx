"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";

const NAV_ITEMS = ["home", "menu", "menus", "vins", "boissons", "events", "reservation", "gallery", "contact"] as const;

function getHref(key: string) {
  if (key === "home") return "/";
  if (key === "gallery") return "/galerie";
  if (key === "events") return "/evenements";
  return `/${key}`;
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(key: string) {
    const href = getHref(key);
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-brand-dark/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-normal tracking-[0.25em] text-brand-cream uppercase"
        >
          LE DIVINO
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_ITEMS.map((key) => (
            <Link
              key={key}
              href={getHref(key)}
              className={`text-[13px] font-normal tracking-[0.2em] uppercase transition-colors duration-300 hover:text-brand-gold ${
                isActive(key) ? "text-brand-gold" : "text-brand-cream"
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        {/* Right: language + mobile toggle */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-2 md:hidden"
            aria-label="Menu"
          >
            <span
              className={`h-[1.5px] w-7 bg-brand-cream transition-all duration-300 ${
                mobileOpen ? "translate-y-[4.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-7 bg-brand-cream transition-all duration-300 ${
                mobileOpen ? "-translate-y-[4.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-brand-cream/10 bg-brand-dark/98 backdrop-blur-md px-6 py-8 md:hidden">
          <div className="flex flex-col gap-6">
            {NAV_ITEMS.map((key) => (
              <Link
                key={key}
                href={getHref(key)}
                className={`text-base font-normal tracking-[0.2em] uppercase transition-colors hover:text-brand-gold ${
                  isActive(key) ? "text-brand-gold" : "text-brand-cream"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
