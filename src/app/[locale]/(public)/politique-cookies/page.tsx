import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de Gestion des Cookies — Le Divino",
  description:
    "Politique de gestion des cookies du restaurant Le Divino. Informations sur Google Analytics 4, consentement et paramétrage.",
};

export default function PolitiqueCookiesPage() {
  return (
    <section className="bg-brand-dark pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <h1 className="text-4xl font-light tracking-[0.2em] text-brand-cream uppercase md:text-5xl text-center">
          Politique de Gestion des Cookies
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />

        <div className="mt-16 space-y-12 text-sm font-light leading-relaxed text-brand-cream/80">
          {/* Introduction */}
          <div>
            <p>
              Le site{" "}
              <span className="text-brand-cream">www.ledivino-agde.fr</span>,
              édité par <strong className="text-brand-cream">Le Divino</strong>{" "}
              (SIRET : 99935890600017), utilise des cookies et traceurs. Cette
              politique vous informe sur leur nature, leur finalité et les
              moyens dont vous disposez pour les gérer, conformément à la
              directive ePrivacy et aux recommandations de la CNIL.
            </p>
          </div>

          {/* 1. Qu'est-ce qu'un cookie ? */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              1. Qu&apos;est-ce qu&apos;un cookie ?
            </h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal
              (ordinateur, smartphone, tablette) lors de la visite d&apos;un site
              web. Il permet au site de mémoriser des informations sur votre
              visite (langue préférée, pages consultées, etc.) afin de faciliter
              votre navigation ultérieure.
            </p>
          </div>

          {/* 2. Cookies utilisés */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              2. Cookies utilisés sur ce site
            </h2>

            {/* Cookies essentiels */}
            <div className="mt-4">
              <h3 className="text-brand-cream font-normal mb-3">
                Cookies strictement nécessaires
              </h3>
              <p>
                Ces cookies sont indispensables au fonctionnement du site et ne
                peuvent pas être désactivés. Ils ne stockent aucune donnée
                personnelle.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-brand-cream/20">
                      <th className="pb-2 pr-4 text-brand-cream font-normal">
                        Cookie
                      </th>
                      <th className="pb-2 pr-4 text-brand-cream font-normal">
                        Finalité
                      </th>
                      <th className="pb-2 text-brand-cream font-normal">
                        Durée
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream/10">
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs text-brand-cream/70">
                        cookie_consent
                      </td>
                      <td className="py-2 pr-4">
                        Mémorisation de votre choix de consentement aux cookies
                      </td>
                      <td className="py-2">13 mois</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs text-brand-cream/70">
                        NEXT_LOCALE
                      </td>
                      <td className="py-2 pr-4">
                        Mémorisation de la langue choisie
                      </td>
                      <td className="py-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cookies analytiques */}
            <div className="mt-8">
              <h3 className="text-brand-cream font-normal mb-3">
                Cookies analytiques (Google Analytics 4)
              </h3>
              <p>
                Ces cookies nous permettent de mesurer l&apos;audience du site et
                d&apos;analyser le comportement des visiteurs afin
                d&apos;améliorer nos services. Ils ne sont déposés qu&apos;après
                votre{" "}
                <strong className="text-brand-cream">
                  consentement explicite
                </strong>
                .
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-brand-cream/20">
                      <th className="pb-2 pr-4 text-brand-cream font-normal">
                        Cookie
                      </th>
                      <th className="pb-2 pr-4 text-brand-cream font-normal">
                        Finalité
                      </th>
                      <th className="pb-2 text-brand-cream font-normal">
                        Durée
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream/10">
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs text-brand-cream/70">
                        _ga
                      </td>
                      <td className="py-2 pr-4">
                        Identification unique du visiteur (GA4)
                      </td>
                      <td className="py-2">14 mois</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs text-brand-cream/70">
                        _ga_*
                      </td>
                      <td className="py-2 pr-4">
                        Conservation de l&apos;état de la session (GA4)
                      </td>
                      <td className="py-2">14 mois</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                <strong className="text-brand-cream">Fournisseur :</strong>{" "}
                Google LLC — Les données sont transférées aux États-Unis dans le
                cadre du Data Privacy Framework (DPF).
              </p>
            </div>
          </div>

          {/* 3. Consentement */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              3. Votre consentement
            </h2>
            <p>
              Lors de votre première visite, un bandeau de consentement vous
              permet de :
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>
                <strong className="text-brand-cream">Accepter tous</strong> les
                cookies (essentiels + analytiques)
              </li>
              <li>
                <strong className="text-brand-cream">
                  Refuser les cookies non essentiels
                </strong>{" "}
                (seuls les cookies strictement nécessaires restent actifs)
              </li>
              <li>
                <strong className="text-brand-cream">Personnaliser</strong> vos
                préférences en activant ou désactivant chaque catégorie
              </li>
            </ul>
            <p className="mt-3">
              Votre choix est sauvegardé pour une durée de 13 mois. Vous pouvez
              modifier vos préférences à tout moment en supprimant vos cookies
              via les paramètres de votre navigateur.
            </p>
          </div>

          {/* 4. Désactivation via navigateur */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              4. Gérer les cookies via votre navigateur
            </h2>
            <p>
              Vous pouvez configurer votre navigateur pour accepter ou refuser
              les cookies. Voici les liens vers les paramètres des principaux
              navigateurs :
            </p>
            <ul className="mt-3 space-y-1">
              <li>
                <strong className="text-brand-cream">Chrome :</strong>{" "}
                Paramètres &gt; Confidentialité et sécurité &gt; Cookies
              </li>
              <li>
                <strong className="text-brand-cream">Firefox :</strong>{" "}
                Paramètres &gt; Vie privée et sécurité &gt; Cookies
              </li>
              <li>
                <strong className="text-brand-cream">Safari :</strong>{" "}
                Préférences &gt; Confidentialité &gt; Cookies
              </li>
              <li>
                <strong className="text-brand-cream">Edge :</strong>{" "}
                Paramètres &gt; Confidentialité &gt; Cookies
              </li>
            </ul>
          </div>

          {/* 5. Opt-out Google Analytics */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              5. Opt-out Google Analytics
            </h2>
            <p>
              Vous pouvez également désactiver Google Analytics de manière
              spécifique en installant le{" "}
              <strong className="text-brand-cream">
                module complémentaire de navigateur
              </strong>{" "}
              fourni par Google, disponible pour Chrome, Firefox, Safari, Edge et
              Opera.
            </p>
          </div>

          {/* 6. Mise à jour */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              6. Mise à jour de cette politique
            </h2>
            <p>
              La présente politique de cookies peut être modifiée à tout moment
              afin de refléter les évolutions légales ou techniques. La date de
              dernière mise à jour est indiquée ci-dessous.
            </p>
            <p className="mt-3 text-brand-cream/60">
              Dernière mise à jour : 25 mars 2026
            </p>
          </div>

          {/* 7. Contact */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              7. Contact
            </h2>
            <p>
              Pour toute question relative aux cookies ou à la protection de vos
              données, contactez-nous :
            </p>
            <ul className="mt-3 space-y-1">
              <li>
                <span className="text-brand-cream/60">Email :</span>{" "}
                <a
                  href="mailto:contact@ledivino-agde.fr"
                  className="text-brand-gold hover:underline"
                >
                  contact@ledivino-agde.fr
                </a>
              </li>
              <li>
                <span className="text-brand-cream/60">Adresse :</span> 5 place
                Jean Jaurès, 34300 Agde, France
              </li>
            </ul>
          </div>

          {/* Nav RGPD */}
          <div className="border-t border-brand-cream/20 pt-8 flex flex-wrap gap-6 text-xs">
            <Link
              href="/mentions-legales"
              className="text-brand-gold hover:underline"
            >
              Mentions Légales
            </Link>
            <Link
              href="/politique-confidentialite"
              className="text-brand-gold hover:underline"
            >
              Politique de Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
