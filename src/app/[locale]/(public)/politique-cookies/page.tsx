import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookies" });
  return {
    title: t("seo_title"),
    description: t("seo_description"),
  };
}

export default async function PolitiqueCookiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cookies");

  return (
    <section className="bg-brand-dark pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <h1 className="text-4xl font-light tracking-[0.2em] text-brand-cream uppercase md:text-5xl text-center">
          {t("title")}
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />

        <div className="mt-16 space-y-12 text-sm font-light leading-relaxed text-brand-cream/80">
          {/* Introduction */}
          <div>
            <p>
              {t.rich("intro_text", {
                website: (chunks) => (
                  <span className="text-brand-cream">{chunks}</span>
                ),
                strong: (chunks) => (
                  <strong className="text-brand-cream">{chunks}</strong>
                ),
              })}
            </p>
          </div>

          {/* 1. Qu'est-ce qu'un cookie ? */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("what_title")}
            </h2>
            <p>{t("what_text")}</p>
          </div>

          {/* 2. Cookies utilisés */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("used_title")}
            </h2>

            {/* Cookies essentiels */}
            <div className="mt-4">
              <h3 className="text-brand-cream font-normal mb-3">
                {t("essential_title")}
              </h3>
              <p>{t("essential_text")}</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-brand-cream/20">
                      <th className="pb-2 pr-4 text-brand-cream font-normal">
                        {t("table_cookie")}
                      </th>
                      <th className="pb-2 pr-4 text-brand-cream font-normal">
                        {t("table_purpose")}
                      </th>
                      <th className="pb-2 text-brand-cream font-normal">
                        {t("table_duration")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream/10">
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs text-brand-cream/70">
                        cookie_consent
                      </td>
                      <td className="py-2 pr-4">
                        {t("cookie_consent_purpose")}
                      </td>
                      <td className="py-2">{t("cookie_consent_duration")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs text-brand-cream/70">
                        NEXT_LOCALE
                      </td>
                      <td className="py-2 pr-4">
                        {t("next_locale_purpose")}
                      </td>
                      <td className="py-2">{t("next_locale_duration")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cookies analytiques */}
            <div className="mt-8">
              <h3 className="text-brand-cream font-normal mb-3">
                {t("analytics_title")}
              </h3>
              <p>
                {t.rich("analytics_text", {
                  strong: (chunks) => (
                    <strong className="text-brand-cream">{chunks}</strong>
                  ),
                })}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-brand-cream/20">
                      <th className="pb-2 pr-4 text-brand-cream font-normal">
                        {t("table_cookie")}
                      </th>
                      <th className="pb-2 pr-4 text-brand-cream font-normal">
                        {t("table_purpose")}
                      </th>
                      <th className="pb-2 text-brand-cream font-normal">
                        {t("table_duration")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream/10">
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs text-brand-cream/70">
                        _ga
                      </td>
                      <td className="py-2 pr-4">{t("ga_purpose")}</td>
                      <td className="py-2">{t("ga_duration")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs text-brand-cream/70">
                        _ga_*
                      </td>
                      <td className="py-2 pr-4">{t("ga_star_purpose")}</td>
                      <td className="py-2">{t("ga_star_duration")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                {t.rich("analytics_provider", {
                  strong: (chunks) => (
                    <strong className="text-brand-cream">{chunks}</strong>
                  ),
                })}
              </p>
            </div>
          </div>

          {/* 3. Consentement */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("consent_title")}
            </h2>
            <p>{t("consent_text")}</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>
                {t.rich("consent_accept", {
                  strong: (chunks) => (
                    <strong className="text-brand-cream">{chunks}</strong>
                  ),
                })}
              </li>
              <li>
                {t.rich("consent_refuse", {
                  strong: (chunks) => (
                    <strong className="text-brand-cream">{chunks}</strong>
                  ),
                })}
              </li>
              <li>
                {t.rich("consent_customize", {
                  strong: (chunks) => (
                    <strong className="text-brand-cream">{chunks}</strong>
                  ),
                })}
              </li>
            </ul>
            <p className="mt-3">{t("consent_duration")}</p>
          </div>

          {/* 4. Désactivation via navigateur */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("browser_title")}
            </h2>
            <p>{t("browser_text")}</p>
            <ul className="mt-3 space-y-1">
              <li>
                <strong className="text-brand-cream">Chrome :</strong>{" "}
                {t("browser_chrome")}
              </li>
              <li>
                <strong className="text-brand-cream">Firefox :</strong>{" "}
                {t("browser_firefox")}
              </li>
              <li>
                <strong className="text-brand-cream">Safari :</strong>{" "}
                {t("browser_safari")}
              </li>
              <li>
                <strong className="text-brand-cream">Edge :</strong>{" "}
                {t("browser_edge")}
              </li>
            </ul>
          </div>

          {/* 5. Opt-out Google Analytics */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("optout_title")}
            </h2>
            <p>
              {t.rich("optout_text", {
                strong: (chunks) => (
                  <strong className="text-brand-cream">{chunks}</strong>
                ),
              })}
            </p>
          </div>

          {/* 6. Mise à jour */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("update_title")}
            </h2>
            <p>{t("update_text")}</p>
            <p className="mt-3 text-brand-cream/60">{t("update_date")}</p>
          </div>

          {/* 7. Contact */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("contact_title")}
            </h2>
            <p>{t("contact_text")}</p>
            <ul className="mt-3 space-y-1">
              <li>
                <span className="text-brand-cream/60">
                  {t("contact_email_label")}
                </span>{" "}
                <a
                  href="mailto:contact@ledivino-agde.fr"
                  className="text-brand-gold hover:underline"
                >
                  contact@ledivino-agde.fr
                </a>
              </li>
              <li>
                <span className="text-brand-cream/60">
                  {t("contact_address_label")}
                </span>{" "}
                {t("contact_address")}
              </li>
            </ul>
          </div>

          {/* Nav RGPD */}
          <div className="border-t border-brand-cream/20 pt-8 flex flex-wrap gap-6 text-xs">
            <Link
              href="/mentions-legales"
              className="text-brand-gold hover:underline"
            >
              {t("nav_legal")}
            </Link>
            <Link
              href="/politique-confidentialite"
              className="text-brand-gold hover:underline"
            >
              {t("nav_privacy")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
