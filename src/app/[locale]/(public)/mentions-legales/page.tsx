import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("seo_title"),
    description: t("seo_description"),
  };
}

export default async function MentionsLegalesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <section className="bg-brand-dark pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <h1 className="text-4xl font-light tracking-[0.2em] text-brand-cream uppercase md:text-5xl text-center">
          {t("title")}
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />

        <div className="mt-16 space-y-12 text-sm font-light leading-relaxed text-brand-cream/80">
          {/* 1. Éditeur */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("editor_title")}
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="text-brand-cream/60">{t("company_name_label")}</span>{" "}
                {t("company_name")}
              </li>
              <li>
                <span className="text-brand-cream/60">{t("legal_form_label")}</span>{" "}
                {t("legal_form")}
              </li>
              <li>
                <span className="text-brand-cream/60">{t("siret_label")}</span>{" "}
                99935890600017
              </li>
              <li>
                <span className="text-brand-cream/60">{t("siren_label")}</span>{" "}
                999 358 906
              </li>
              <li>
                <span className="text-brand-cream/60">{t("address_label")}</span>{" "}
                {t("address")}
              </li>
              <li>
                <span className="text-brand-cream/60">{t("phone_label")}</span>{" "}
                <a
                  href="tel:+33448177875"
                  className="text-brand-cream/90 hover:text-brand-gold transition-colors"
                >
                  04 48 17 78 75
                </a>
              </li>
              <li>
                <span className="text-brand-cream/60">{t("email_label")}</span>{" "}
                <a
                  href="mailto:contact@ledivino-agde.fr"
                  className="text-brand-cream/90 hover:text-brand-gold transition-colors"
                >
                  contact@ledivino-agde.fr
                </a>
              </li>
              <li>
                <span className="text-brand-cream/60">
                  {t("publication_director_label")}
                </span>{" "}
                {t("publication_director")}
              </li>
            </ul>
          </div>

          {/* 2. Hébergeur */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("hosting_title")}
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="text-brand-cream/60">{t("hosting_name_label")}</span>{" "}
                {t("hosting_name")}
              </li>
              <li>
                <span className="text-brand-cream/60">{t("hosting_address_label")}</span>{" "}
                {t("hosting_address")}
              </li>
              <li>
                <span className="text-brand-cream/60">{t("hosting_website_label")}</span>{" "}
                {t("hosting_website")}
              </li>
            </ul>
          </div>

          {/* 3. Propriété intellectuelle */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("ip_title")}
            </h2>
            <p>{t("ip_text1")}</p>
            <p className="mt-3">{t("ip_text2")}</p>
          </div>

          {/* 4. Responsabilité */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("liability_title")}
            </h2>
            <p>{t("liability_text1")}</p>
            <p className="mt-3">{t("liability_text2")}</p>
          </div>

          {/* 5. Liens hypertextes */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("links_title")}
            </h2>
            <p>{t("links_text")}</p>
          </div>

          {/* 6. Données personnelles */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("data_title")}
            </h2>
            <p>
              {t("data_text")}{" "}
              <Link
                href="/politique-confidentialite"
                className="text-brand-gold hover:underline"
              >
                {t("data_link")}
              </Link>
              .
            </p>
          </div>

          {/* 7. Cookies */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("cookies_title")}
            </h2>
            <p>
              {t("cookies_text")}{" "}
              <Link
                href="/politique-cookies"
                className="text-brand-gold hover:underline"
              >
                {t("cookies_link")}
              </Link>
              .
            </p>
          </div>

          {/* 8. Droit applicable */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("law_title")}
            </h2>
            <p>{t("law_text")}</p>
          </div>

          {/* 9. Conception */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("design_title")}
            </h2>
            <p>
              {t("design_text")}{" "}
              <span className="text-brand-cream">{t("design_company")}</span>{" "}
              {t("design_suffix")}
            </p>
          </div>

          {/* Nav RGPD */}
          <div className="border-t border-brand-cream/20 pt-8 flex flex-wrap gap-6 text-xs">
            <Link
              href="/politique-confidentialite"
              className="text-brand-gold hover:underline"
            >
              {t("nav_privacy")}
            </Link>
            <Link
              href="/politique-cookies"
              className="text-brand-gold hover:underline"
            >
              {t("nav_cookies")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
