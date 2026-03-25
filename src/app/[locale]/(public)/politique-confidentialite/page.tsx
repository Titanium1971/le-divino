import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — Le Divino",
  description:
    "Politique de confidentialité et protection des données personnelles du restaurant Le Divino, conformément au RGPD.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <section className="bg-brand-dark pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <h1 className="text-4xl font-light tracking-[0.2em] text-brand-cream uppercase md:text-5xl text-center">
          Politique de Confidentialité
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />

        <div className="mt-16 space-y-12 text-sm font-light leading-relaxed text-brand-cream/80">
          {/* Introduction */}
          <div>
            <p>
              Le restaurant <strong className="text-brand-cream">Le Divino</strong> (SIRET :
              99935890600017), situé au 5 place Jean Jaurès, 34300 Agde, France,
              s&apos;engage à protéger la vie privée des utilisateurs de son site
              internet{" "}
              <span className="text-brand-cream">www.ledivino-agde.fr</span>.
            </p>
            <p className="mt-3">
              La présente politique de confidentialité a pour objet de vous
              informer sur la manière dont nous collectons, utilisons et
              protégeons vos données personnelles, conformément au Règlement
              Général sur la Protection des Données (RGPD — Règlement UE
              2016/679) et à la loi Informatique et Libertés.
            </p>
          </div>

          {/* 1. Responsable du traitement */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              1. Responsable du traitement
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="text-brand-cream/60">Identité :</span> Le
                Divino
              </li>
              <li>
                <span className="text-brand-cream/60">Adresse :</span> 5 place
                Jean Jaurès, 34300 Agde, France
              </li>
              <li>
                <span className="text-brand-cream/60">Email :</span>{" "}
                <a
                  href="mailto:contact@ledivino-agde.fr"
                  className="text-brand-cream/90 hover:text-brand-gold transition-colors"
                >
                  contact@ledivino-agde.fr
                </a>
              </li>
              <li>
                <span className="text-brand-cream/60">Téléphone :</span>{" "}
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
              2. Données personnelles collectées
            </h2>
            <p>
              Nous collectons les données suivantes dans le cadre de
              l&apos;utilisation de notre site :
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-brand-cream font-normal mb-2">
                  Formulaire de réservation
                </h3>
                <p>
                  Nom, prénom, adresse email, numéro de téléphone, date et heure
                  souhaitées, nombre de convives, demandes spéciales
                  (allergies, occasions).
                </p>
              </div>
              <div>
                <h3 className="text-brand-cream font-normal mb-2">
                  Formulaire de contact
                </h3>
                <p>Nom, adresse email, objet et contenu du message.</p>
              </div>
              <div>
                <h3 className="text-brand-cream font-normal mb-2">
                  Navigation sur le site
                </h3>
                <p>
                  Données de navigation collectées via Google Analytics 4
                  (adresse IP anonymisée, pages consultées, durée de visite,
                  type d&apos;appareil, navigateur). Ces données ne sont
                  collectées qu&apos;avec votre consentement préalable.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Finalités */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              3. Finalités du traitement
            </h2>
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Gestion des réservations de table</li>
              <li>Réponse aux demandes de contact</li>
              <li>
                Amélioration de l&apos;expérience utilisateur et analyse
                statistique du site (Google Analytics 4)
              </li>
              <li>
                Respect des obligations légales et réglementaires
              </li>
            </ul>
          </div>

          {/* 4. Base juridique (Article 6 RGPD) */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              4. Base juridique du traitement (Article 6 RGPD)
            </h2>
            <ul className="space-y-2">
              <li>
                <strong className="text-brand-cream">Consentement</strong>{" "}
                (article 6.1.a) : pour les cookies analytiques et le dépôt de
                traceurs.
              </li>
              <li>
                <strong className="text-brand-cream">
                  Exécution d&apos;un contrat
                </strong>{" "}
                (article 6.1.b) : pour le traitement des réservations.
              </li>
              <li>
                <strong className="text-brand-cream">Intérêt légitime</strong>{" "}
                (article 6.1.f) : pour répondre aux demandes de contact et
                améliorer nos services.
              </li>
            </ul>
          </div>

          {/* 5. Durées de conservation */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              5. Durées de conservation
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-cream/20">
                    <th className="pb-3 pr-4 text-brand-cream font-normal">
                      Type de données
                    </th>
                    <th className="pb-3 text-brand-cream font-normal">
                      Durée de conservation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-cream/10">
                  <tr>
                    <td className="py-3 pr-4">Données de réservation</td>
                    <td className="py-3">
                      12 mois après la date de réservation
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Données de contact</td>
                    <td className="py-3">
                      12 mois après le dernier échange
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">
                      Données de navigation (analytics)
                    </td>
                    <td className="py-3">14 mois (paramétrage GA4)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Cookies de consentement</td>
                    <td className="py-3">13 mois (recommandation CNIL)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Destinataires */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              6. Destinataires des données
            </h2>
            <p>
              Vos données personnelles peuvent être transmises aux destinataires
              suivants :
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>
                <strong className="text-brand-cream">Vercel Inc.</strong>{" "}
                (hébergement du site) — États-Unis, couvert par les clauses
                contractuelles types (CCT)
              </li>
              <li>
                <strong className="text-brand-cream">Supabase Inc.</strong>{" "}
                (base de données) — États-Unis, couvert par les CCT
              </li>
              <li>
                <strong className="text-brand-cream">Google LLC</strong>{" "}
                (Google Analytics 4) — États-Unis, couvert par le Data Privacy
                Framework
              </li>
            </ul>
            <p className="mt-3">
              Aucune donnée n&apos;est vendue ou cédée à des tiers à des fins
              commerciales.
            </p>
          </div>

          {/* 7. Vos droits (Articles 15-22 RGPD) */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              7. Vos droits (Articles 15 à 22 du RGPD)
            </h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants sur vos
              données personnelles :
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <strong className="text-brand-cream">Droit d&apos;accès</strong>{" "}
                (art. 15) : obtenir la confirmation que des données vous
                concernant sont traitées et en recevoir une copie.
              </li>
              <li>
                <strong className="text-brand-cream">
                  Droit de rectification
                </strong>{" "}
                (art. 16) : faire corriger des données inexactes ou incomplètes.
              </li>
              <li>
                <strong className="text-brand-cream">
                  Droit à l&apos;effacement
                </strong>{" "}
                (art. 17) : demander la suppression de vos données dans les
                conditions prévues par la loi.
              </li>
              <li>
                <strong className="text-brand-cream">
                  Droit à la limitation
                </strong>{" "}
                (art. 18) : demander la limitation du traitement de vos données.
              </li>
              <li>
                <strong className="text-brand-cream">
                  Droit à la portabilité
                </strong>{" "}
                (art. 20) : recevoir vos données dans un format structuré et
                lisible par machine.
              </li>
              <li>
                <strong className="text-brand-cream">
                  Droit d&apos;opposition
                </strong>{" "}
                (art. 21) : vous opposer au traitement de vos données pour des
                motifs légitimes.
              </li>
              <li>
                <strong className="text-brand-cream">
                  Droit de retrait du consentement
                </strong>{" "}
                (art. 7) : retirer votre consentement à tout moment sans
                affecter la licéité du traitement antérieur.
              </li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous à :{" "}
              <a
                href="mailto:contact@ledivino-agde.fr"
                className="text-brand-gold hover:underline"
              >
                contact@ledivino-agde.fr
              </a>
            </p>
            <p className="mt-2">
              Nous nous engageons à répondre dans un délai de 30 jours. En cas
              de litige, vous pouvez introduire une réclamation auprès de la{" "}
              <strong className="text-brand-cream">CNIL</strong> (Commission
              Nationale de l&apos;Informatique et des Libertés) — cnil.fr.
            </p>
          </div>

          {/* 8. Sécurité */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              8. Sécurité des données
            </h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles
              appropriées pour protéger vos données personnelles contre tout
              accès non autorisé, modification, divulgation ou destruction :
            </p>
            <ul className="mt-3 list-disc list-inside space-y-1">
              <li>Chiffrement HTTPS (TLS) pour toutes les communications</li>
              <li>Hébergement sécurisé chez Vercel (certifié SOC 2)</li>
              <li>
                Accès restreint aux données (authentification administrateur)
              </li>
              <li>Sauvegardes régulières de la base de données</li>
            </ul>
          </div>

          {/* 9. Cookies */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              9. Cookies
            </h2>
            <p>
              Pour plus d&apos;informations sur les cookies utilisés sur ce site,
              veuillez consulter notre{" "}
              <Link
                href="/politique-cookies"
                className="text-brand-gold hover:underline"
              >
                Politique de Gestion des Cookies
              </Link>
              .
            </p>
          </div>

          {/* 10. Mise à jour */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              10. Mise à jour de cette politique
            </h2>
            <p>
              La présente politique de confidentialité peut être modifiée à tout
              moment. La date de dernière mise à jour est indiquée ci-dessous.
              Nous vous invitons à la consulter régulièrement.
            </p>
            <p className="mt-3 text-brand-cream/60">
              Dernière mise à jour : 25 mars 2026
            </p>
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
              href="/politique-cookies"
              className="text-brand-gold hover:underline"
            >
              Politique de Gestion des Cookies
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
