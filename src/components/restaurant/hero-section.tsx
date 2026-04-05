"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background photo */}
      <Image
        src="/images/hero-exterior-night.webp"
        alt="Restaurant Le Divino de nuit place Jean Jaurès Agde"
        fill
        priority
        fetchPriority="high"
        className="object-cover"
        sizes="100vw"
        quality={70}
      />

      {/* Dark bordeaux overlay */}
      <div className="absolute inset-0 bg-brand-dark/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bordeaux/20 via-transparent to-brand-dark/80" />

      <div className="relative z-10 text-center px-4">
        {/* Title */}
        <h1 className="animate-hero-up text-6xl font-extralight tracking-[0.3em] text-brand-cream uppercase md:text-8xl lg:text-9xl">
          {t("title")}
        </h1>

        {/* Gold decorative line */}
        <div className="mx-auto mt-6 h-px animate-hero-line bg-brand-gold" />

        {/* Subtitle */}
        <p className="animate-hero-up-delay mt-6 text-sm font-light tracking-[0.25em] uppercase text-brand-gold md:text-base">
          {t("subtitle")}
        </p>

        {/* CTA */}
        <Link
          href="/reservation"
          className="animate-hero-up-delay-2 mt-12 inline-block border border-brand-cream/60 px-10 py-4 text-xs font-normal tracking-[0.2em] uppercase text-brand-cream transition-all duration-300 hover:border-brand-gold hover:text-brand-gold"
        >
          {t("cta")}
        </Link>
      </div>

      {/* Bottom fade to cream */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-brand-cream to-transparent" />
    </section>
  );
}
