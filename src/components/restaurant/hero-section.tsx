"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-extralight tracking-widest md:text-7xl">{t("title")}</h1>
        <p className="mt-4 text-lg font-light text-muted-foreground md:text-xl">
          {t("subtitle")}
        </p>
        <Button asChild variant="outline" size="lg" className="mt-8">
          <Link href="/reservation">{t("cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
