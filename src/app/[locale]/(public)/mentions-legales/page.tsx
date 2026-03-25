import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions Légales — Le Divino",
  description:
    "Mentions légales du restaurant Le Divino, 5 place Jean Jaurès, 34300 Agde. SIRET 99935890600017.",
};

export default function MentionsLegalesPage() {
  return (
    <section className="bg-brand-dark pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <h1 className="text-4xl font-light tracking-[0.2em] text-brand-cream uppercase md:text-5xl text-center">
          Mentions Légales
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />

        <div className="mt-16 space-y-12 text-sm font-light leading-relaxed text-brand-cream/80">
          {/* 1. Éditeur */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              1. Éditeur du site
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="text-brand-cream/60">Raison sociale :</span>{" "}
                Le Divino
              </li>
              <li>
                <span className="text-brand-cream/60">Forme juridique :</span>{" "}
                Société par actions simplifiée (SAS)
              </li>
              <li>
                <span className="text-brand-cream/60">SIRET :</span>{" "}
                99935890600017
              </li>
              <li>
                <span className="text-brand-cream/60">SIREN :</span>{" "}
                999 358 906
              </li>
              <li>
                <span className="text-brand-cream/60">Adresse :</span> 5 place
                Jean Jaurès, 34300 Agde, France
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
                <span className="text-brand-cream/60">
                  Directeur de la publication :
                </span>{" "}
                Le gérant de l&apos;établissement Le Divino
              </li>
            </ul>
          </div>

          {/* 2. Hébergeur */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              2. Hébergeur
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="text-brand-cream/60">Nom :</span> Vercel Inc.
              </li>
              <li>
                <span className="text-brand-cream/60">Adresse :</span> 440 N
                Barranca Ave #4133, Covina, CA 91723, États-Unis
              </li>
              <li>
                <span className="text-brand-cream/60">Site web :</span>{" "}
                vercel.com
              </li>
            </ul>
          </div>

          {/* 3. Propriété intellectuelle */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              3. Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images,
              photographies, logos, vidéos, éléments graphiques et sonores) est
              la propriété exclusive de Le Divino ou de ses partenaires et est
              protégé par les lois françaises et internationales relatives à la
              propriété intellectuelle.
            </p>
            <p className="mt-3">
              Toute reproduction, représentation, modification, publication,
              adaptation ou exploitation de tout ou partie des éléments du site,
              quel que soit le moyen ou le procédé utilisé, est interdite sauf
              autorisation écrite préalable de Le Divino.
            </p>
          </div>

          {/* 4. Responsabilité */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              4. Limitation de responsabilité
            </h2>
            <p>
              Le Divino s&apos;efforce de fournir des informations aussi précises
              que possible sur ce site. Toutefois, il ne pourra être tenu
              responsable des omissions, inexactitudes ou carences dans la mise à
              jour, qu&apos;elles soient de son fait ou du fait de tiers.
            </p>
            <p className="mt-3">
              Les informations présentes sur ce site sont données à titre
              indicatif et sont susceptibles d&apos;évoluer. Notamment, les menus,
              tarifs et horaires d&apos;ouverture peuvent être modifiés sans
              préavis.
            </p>
          </div>

          {/* 5. Liens hypertextes */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              5. Liens hypertextes
            </h2>
            <p>
              Le site peut contenir des liens vers d&apos;autres sites internet.
              Le Divino ne dispose d&apos;aucun contrôle sur le contenu de ces
              sites tiers et décline toute responsabilité quant à leur contenu ou
              aux éventuels dommages résultant de leur utilisation.
            </p>
          </div>

          {/* 6. Données personnelles */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              6. Données personnelles
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD) et à la loi Informatique et Libertés, vous disposez de
              droits sur vos données personnelles. Pour en savoir plus,
              consultez notre{" "}
              <Link
                href="/politique-confidentialite"
                className="text-brand-gold hover:underline"
              >
                Politique de Confidentialité
              </Link>
              .
            </p>
          </div>

          {/* 7. Cookies */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              7. Cookies
            </h2>
            <p>
              Ce site utilise des cookies. Pour en savoir plus sur leur
              utilisation et vos options de gestion, consultez notre{" "}
              <Link
                href="/politique-cookies"
                className="text-brand-gold hover:underline"
              >
                Politique de Gestion des Cookies
              </Link>
              .
            </p>
          </div>

          {/* 8. Droit applicable */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              8. Droit applicable
            </h2>
            <p>
              Les présentes mentions légales sont régies par le droit français.
              En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </div>

          {/* 9. Conception */}
          <div>
            <h2 className="text-lg font-normal tracking-[0.15em] text-brand-gold uppercase mb-4">
              9. Conception et réalisation
            </h2>
            <p>
              Site conçu et développé par{" "}
              <span className="text-brand-cream">CC Développement</span> —
              Création de sites web sur mesure.
            </p>
          </div>

          {/* Nav RGPD */}
          <div className="border-t border-brand-cream/20 pt-8 flex flex-wrap gap-6 text-xs">
            <Link
              href="/politique-confidentialite"
              className="text-brand-gold hover:underline"
            >
              Politique de Confidentialité
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
