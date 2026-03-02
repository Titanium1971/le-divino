import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/restaurant/hero-section";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

const HIGHLIGHT_IMAGES: Record<string, string> = {
  cuisine: "/images/bar-divino.jpg",
  ambiance: "/images/salle-bar-divino.jpg",
  service: "/images/interieur-salle-bar.jpg",
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      {/* ── Hero plein écran ── */}
      <HeroSection />

      {/* ── Section Bienvenue ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              {t("welcome.title")}
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
            <p className="mx-auto mt-8 max-w-2xl text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
              {t("welcome.description")}
            </p>
          </div>

          {/* Landscape photo of the dining room */}
          <div className="relative mt-14 overflow-hidden rounded-sm">
            <div className="aspect-[21/9]">
              <Image
                src="/images/salle-bord-eau.jpg"
                alt="Salle du restaurant Le Divino"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1024px"
                quality={80}
              />
            </div>
            {/* Subtle vignette edges */}
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(15,10,10,0.15)]" />
          </div>
        </div>
      </section>

      {/* ── 3 Highlights with photos ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
          {(["cuisine", "ambiance", "service"] as const).map((key) => (
            <div key={key} className="group">
              {/* Photo */}
              <div className="relative overflow-hidden rounded-sm">
                <div className="aspect-[4/3]">
                  <Image
                    src={HIGHLIGHT_IMAGES[key]}
                    alt={t(`highlights.${key}.title`)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={75}
                  />
                </div>
                {/* Dark overlay on photo */}
                <div className="absolute inset-0 bg-brand-dark/20 transition-opacity duration-500 group-hover:bg-brand-dark/10" />
                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-dark/50 to-transparent" />
              </div>

              {/* Text below */}
              <div className="mt-6 text-center">
                <div className="mx-auto mb-4 h-px w-10 bg-brand-gold" />
                <h3 className="text-sm font-normal tracking-[0.2em] uppercase text-brand-cream">
                  {t(`highlights.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-brand-cream/80">
                  {t(`highlights.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Réservation ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
            {t("hero.cta")}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <Link
            href="/reservation"
            className="mt-10 inline-block border border-brand-bordeaux px-12 py-4 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
          >
            {t("hero.cta")}
          </Link>
        </div>
      </section>
    </>
  );
}
