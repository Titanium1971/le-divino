import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LOCALES, DEFAULT_LOCALE, getPageUrl } from "@/lib/seo/constants";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const canonical = getPageUrl(locale, "politique-confidentialite");
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = getPageUrl(loc, "politique-confidentialite");
  }
  languages["x-default"] = getPageUrl(DEFAULT_LOCALE, "politique-confidentialite");
  return {
    title: t("seo_title"),
    description: t("seo_description"),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      url: canonical,
    },
  };
}

export default async function PolitiqueConfidentialitePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

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
                strong: (chunks) => (
                  <strong className="text-brand-cream">{chunks}</strong>
                ),
                website: (chunks) => (
                  <span className="text-brand-cream">{chunks}</span>
                ),
              })}
            </p>
            <p className="mt-3">{t("intro_commitment")}</p>
          </div>

          {/* 1. Responsable du traitement */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("controller_title")}
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="text-brand-cream/60">
                  {t("controller_identity_label")}
                </span>{" "}
                {t("controller_identity_value")}
              </li>
              <li>
                <span className="text-brand-cream/60">
                  {t("controller_address_label")}
                </span>{" "}
                {t("controller_address_value")}
              </li>
              <li>
                <span className="text-brand-cream/60">
                  {t("controller_email_label")}
                </span>{" "}
                <a
                  href="mailto:contact@ledivino-agde.fr"
                  className="text-brand-cream/90 hover:text-brand-gold transition-colors"
                >
                  contact@ledivino-agde.fr
                </a>
              </li>
              <li>
                <span className="text-brand-cream/60">
                  {t("controller_phone_label")}
                </span>{" "}
                <a
                  href="tel:+33448177875"
                  className="text-brand-cream/90 hover:text-brand-gold transition-colors"
                >
                  04 48 17 78 75
                </a>
              </li>
            </ul>
          </div>

          {/* 2. Données collectées */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("data_collected_title")}
            </h2>
            <p>{t("data_collected_intro")}</p>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-brand-cream font-normal mb-2">
                  {t("data_reservation_title")}
                </h3>
                <p>{t("data_reservation_desc")}</p>
              </div>
              <div>
                <h3 className="text-brand-cream font-normal mb-2">
                  {t("data_contact_title")}
                </h3>
                <p>{t("data_contact_desc")}</p>
              </div>
              <div>
                <h3 className="text-brand-cream font-normal mb-2">
                  {t("data_navigation_title")}
                </h3>
                <p>{t("data_navigation_desc")}</p>
              </div>
            </div>
          </div>

          {/* 3. Finalités */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("purposes_title")}
            </h2>
            <p>{t("purposes_intro")}</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>{t("purpose_reservations")}</li>
              <li>{t("purpose_contact")}</li>
              <li>{t("purpose_analytics")}</li>
              <li>{t("purpose_legal")}</li>
            </ul>
          </div>

          {/* 4. Base juridique */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("legal_basis_title")}
            </h2>
            <ul className="space-y-2">
              <li>
                <strong className="text-brand-cream">
                  {t("legal_basis_consent_label")}
                </strong>{" "}
                {t("legal_basis_consent_desc")}
              </li>
              <li>
                <strong className="text-brand-cream">
                  {t("legal_basis_contract_label")}
                </strong>{" "}
                {t("legal_basis_contract_desc")}
              </li>
              <li>
                <strong className="text-brand-cream">
                  {t("legal_basis_interest_label")}
                </strong>{" "}
                {t("legal_basis_interest_desc")}
              </li>
            </ul>
          </div>

          {/* 5. Durées de conservation */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("retention_title")}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-cream/20">
                    <th className="pb-3 pr-4 text-brand-cream font-normal">
                      {t("retention_header_type")}
                    </th>
                    <th className="pb-3 text-brand-cream font-normal">
                      {t("retention_header_duration")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-cream/10">
                  <tr>
                    <td className="py-3 pr-4">
                      {t("retention_reservation_type")}
                    </td>
                    <td className="py-3">
                      {t("retention_reservation_duration")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">
                      {t("retention_contact_type")}
                    </td>
                    <td className="py-3">
                      {t("retention_contact_duration")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">
                      {t("retention_analytics_type")}
                    </td>
                    <td className="py-3">
                      {t("retention_analytics_duration")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">
                      {t("retention_cookies_type")}
                    </td>
                    <td className="py-3">
                      {t("retention_cookies_duration")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Destinataires */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("recipients_title")}
            </h2>
            <p>{t("recipients_intro")}</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>
                <strong className="text-brand-cream">Vercel Inc.</strong>{" "}
                {t("recipient_vercel")}
              </li>
              <li>
                <strong className="text-brand-cream">Supabase Inc.</strong>{" "}
                {t("recipient_supabase")}
              </li>
              <li>
                <strong className="text-brand-cream">Google LLC</strong>{" "}
                {t("recipient_google")}
              </li>
            </ul>
            <p className="mt-3">{t("recipients_no_sale")}</p>
          </div>

          {/* 7. Vos droits */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("rights_title")}
            </h2>
            <p>{t("rights_intro")}</p>
            <ul className="mt-3 space-y-2">
              <li>
                <strong className="text-brand-cream">
                  {t("right_access_label")}
                </strong>{" "}
                {t("right_access_desc")}
              </li>
              <li>
                <strong className="text-brand-cream">
                  {t("right_rectification_label")}
                </strong>{" "}
                {t("right_rectification_desc")}
              </li>
              <li>
                <strong className="text-brand-cream">
                  {t("right_erasure_label")}
                </strong>{" "}
                {t("right_erasure_desc")}
              </li>
              <li>
                <strong className="text-brand-cream">
                  {t("right_restriction_label")}
                </strong>{" "}
                {t("right_restriction_desc")}
              </li>
              <li>
                <strong className="text-brand-cream">
                  {t("right_portability_label")}
                </strong>{" "}
                {t("right_portability_desc")}
              </li>
              <li>
                <strong className="text-brand-cream">
                  {t("right_objection_label")}
                </strong>{" "}
                {t("right_objection_desc")}
              </li>
              <li>
                <strong className="text-brand-cream">
                  {t("right_withdrawal_label")}
                </strong>{" "}
                {t("right_withdrawal_desc")}
              </li>
            </ul>
            <p className="mt-4">
              {t("rights_contact")}{" "}
              <a
                href="mailto:contact@ledivino-agde.fr"
                className="text-brand-gold hover:underline"
              >
                contact@ledivino-agde.fr
              </a>
            </p>
            <p className="mt-2">
              {t.rich("rights_response", {
                strong: (chunks) => (
                  <strong className="text-brand-cream">{chunks}</strong>
                ),
              })}
            </p>
          </div>

          {/* 8. Sécurité */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("security_title")}
            </h2>
            <p>{t("security_intro")}</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>{t("security_https")}</li>
              <li>{t("security_hosting")}</li>
              <li>{t("security_access")}</li>
              <li>{t("security_backup")}</li>
            </ul>
          </div>

          {/* 9. Cookies */}
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

          {/* 10. Mise à jour */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              {t("update_title")}
            </h2>
            <p>{t("update_text")}</p>
            <p className="mt-3 text-brand-cream/60">{t("update_date")}</p>
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
