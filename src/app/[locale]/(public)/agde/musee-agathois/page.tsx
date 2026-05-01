import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SITE_URL } from "@/lib/seo/constants";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_URL}${locale === "fr" ? "" : `/${locale}`}/agde/musee-agathois`;

  return {
    title: "Restaurant proche du Musee Agathois | Le Divino — Cuisine traditionnelle",
    description:
      "Le Divino, restaurant a quelques minutes du Musee Agathois d'Agde. Cuisine francaise, terrasse place Jean Jaures. Parfait apres une visite du musee et de l'Ephebe.",
    keywords:
      "restaurant musee Agathois, restaurant centre historique Agde, dejeuner apres musee Agde",
    alternates: { canonical },
    openGraph: {
      title: "Restaurant proche du Musee Agathois | Le Divino",
      description:
        "Cuisine traditionnelle francaise a quelques minutes du Musee Agathois. Terrasse, produits locaux, place Jean Jaures a Agde.",
      url: canonical,
      siteName: "Le Divino",
      locale: "fr_FR",
      type: "article",
      images: [
        {
          url: `${SITE_URL}/images/salle-bord-eau.jpg`,
          width: 1200,
          height: 630,
          alt: "Restaurant Le Divino proche du Musee Agathois a Agde",
        },
      ],
    },
  };
}

function jsonLdBreadcrumb() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Le Divino",
        item: `${SITE_URL}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Agde",
        item: `${SITE_URL}/agde/musee-agathois`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Musee Agathois",
        item: `${SITE_URL}/agde/musee-agathois`,
      },
    ],
  };
}

function jsonLdLocalBusiness() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Le Divino",
    description:
      "Restaurant de cuisine traditionnelle francaise situe a quelques minutes a pied du Musee Agathois, place Jean Jaures a Agde.",
    url: `${SITE_URL}`,
    telephone: "+33448177875",
    email: "contact@ledivino-agde.fr",
    image: `${SITE_URL}/images/salle-bord-eau.jpg`,
    priceRange: "$$",
    servesCuisine: "French",
    address: {
      "@type": "PostalAddress",
      streetAddress: "5 place Jean Jaures",
      addressLocality: "Agde",
      postalCode: "34300",
      addressRegion: "Occitanie",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.3108,
      longitude: 3.4731,
    },
  };
}

function jsonLdTouristAttraction() {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Musee Agathois — Jules Baudou",
    description:
      "Musee d'histoire et d'archeologie d'Agde. Collections greco-romaines, Ephebe d'Agde (bronze hellenistique), traditions maritimes et vie quotidienne agathoise.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "5 rue de la Fraternite",
      addressLocality: "Agde",
      postalCode: "34300",
      addressCountry: "FR",
    },
  };
}

export default async function MuseeAgathoisPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumb()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdLocalBusiness()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdTouristAttraction()),
        }}
      />

      {/* ── Hero ── */}
      <section className="relative flex min-h-[60vh] items-center justify-center bg-brand-dark">
        <Image
          src="/images/salle-bord-eau.jpg"
          alt="Restaurant Le Divino a proximite du Musee Agathois, centre historique d'Agde"
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
          quality={80}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <nav
            aria-label="Fil d'Ariane"
            className="mb-8 text-xs font-light tracking-widest uppercase text-brand-cream/60"
          >
            <Link href="/" className="hover:text-brand-gold transition-colors">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span>Agde</span>
            <span className="mx-2">/</span>
            <span className="text-brand-cream/90">Musee Agathois</span>
          </nav>
          <h1 className="text-4xl font-extralight tracking-[0.15em] text-brand-cream md:text-5xl">
            Restaurant proche du Musee Agathois
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-lg font-light tracking-wide text-brand-cream/80">
            De l&apos;Ephebe d&apos;Agde a la table du Divino : un voyage entre culture et
            gastronomie
          </p>
        </div>
      </section>

      {/* ── Le Musee Agathois ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              Le Musee Agathois : memoire vivante d&apos;une cite millenaire
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
            <p>
              Niché au coeur du centre historique d&apos;Agde, le Musee Agathois — officiellement
              baptise Musee Agathois Jules Baudou — est l&apos;un de ces lieux ou l&apos;histoire
              prend chair. Installe dans un ancien hotel particulier de la rue de la Fraternite,
              a quelques centaines de metres de la place Jean Jaures, il rassemble des collections
              d&apos;une richesse remarquable qui retracent plus de vingt-six siecles d&apos;histoire
              agathoise, de la fondation grecque a l&apos;epoque contemporaine.
            </p>
            <p>
              Le musee doit une grande partie de sa renommee a un tresor exceptionnel : l&apos;Ephebe
              d&apos;Agde. Cette statue en bronze hellenistique, decouverte en 1964 dans le lit de
              l&apos;Herault par un plongeur amateur, est devenue l&apos;embleme de la ville. Haute
              d&apos;environ 1,40 metre, elle represente un jeune homme dans une pose d&apos;une grace
              saisissante. Les specialistes datent cette oeuvre du IIe siecle avant notre ere,
              et debattent encore de son origine exacte — romaine ou grecque. Quoi qu&apos;il en
              soit, sa beaute et son etat de conservation exceptionnel en font l&apos;une des
              pieces maitresses de l&apos;archeologie sous-marine francaise.
            </p>
            <p>
              Au-dela de l&apos;Ephebe, les salles du musee deploient un panorama fascinant de la
              civilisation agathoise. Les collections archeologiques rassemblent des amphores
              greco-romaines, des monnaies antiques, des outils de peche et de navigation qui
              rappellent le passe maritime de la cite. Les salles dediees a l&apos;ethnographie
              presentent les costumes traditionnels, les joutes languedociennes — cette tradition
              spectaculaire qui anime encore les fetes d&apos;ete — et les savoir-faire artisanaux
              qui ont faconne l&apos;identite de la ville.
            </p>
          </div>
        </div>
      </section>

      {/* ── Collections et tresors ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/bar-divino.jpg"
                  alt="Ambiance chaleureuse au restaurant Le Divino, a quelques pas du Musee Agathois"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75}
                />
              </div>
            </div>
          </div>
          <div className="mt-10 md:mt-0 md:w-1/2">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
              Un musee aux collections multiples
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-cream/80">
              <p>
                Le parcours museographique s&apos;organise en plusieurs sections thematiques.
                L&apos;espace consacre a la prehistoire et a l&apos;Antiquite presente les
                temoignages les plus anciens de l&apos;occupation humaine dans la basse vallee de
                l&apos;Herault : silex tailles, poteries, et surtout les vestiges de la colonie
                grecque d&apos;Agatha Tyche, fondee vers 525 avant J.-C. par des navigateurs
                venus de Phocee, via Massalia (Marseille).
              </p>
              <p>
                La section maritime est particulierement evocatrice. Maquettes de bateaux,
                instruments de navigation, filets et hamecons anciens illustrent la relation
                intime qu&apos;Agde a toujours entretenue avec la mer et le fleuve. On y decouvre
                comment les pecheurs agathois ont developpe des techniques de peche specifiques
                adaptees aux conditions locales, et comment le port d&apos;Agde a joue un role
                commercial important dans les echanges mediterraneens.
              </p>
              <p>
                Enfin, les salles consacrees aux traditions populaires sont un veritable voyage
                dans le temps. Reconstitution d&apos;interieurs agathois, collection de coiffes et
                de costumes des fetes votives, instruments de musique traditionnels : chaque
                vitrine raconte un pan de la vie quotidienne dans l&apos;Agde d&apos;autrefois.
                Les joutes nautiques, inscrites au patrimoine culturel immateriel, occupent une
                place de choix avec leurs trophees, leurs bannières et leurs photographies
                d&apos;epoque.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Du musee a la table ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:flex-row-reverse md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/exterior-terrace.jpg"
                  alt="Terrasse du Divino sur la place Jean Jaures, a quelques minutes du Musee Agathois"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75}
                />
              </div>
            </div>
          </div>
          <div className="mt-10 md:mt-0 md:w-1/2">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-3xl">
              Du musee a la table : Le Divino vous attend
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-dark/90">
              <p>
                Apres une visite du Musee Agathois, rien de tel qu&apos;un bon repas pour
                prolonger le plaisir de la decouverte. Le Divino se trouve a quelques minutes de
                marche, en remontant tranquillement les ruelles du centre historique jusqu&apos;a
                la place Jean Jaures. Le trajet est en lui-meme une promenade agreable, qui
                permet de s&apos;impregner de l&apos;atmosphere unique de la vieille ville en
                basalte.
              </p>
              <p>
                La cuisine du Divino entretient, a sa maniere, un lien fort avec le patrimoine
                agathois. Le chef puise son inspiration dans les traditions culinaires du
                Languedoc et de la Mediterranee, ces memes traditions que le musee documente et
                preserve. Les poissons arrives le matin meme du port du Grau d&apos;Agde, les
                legumes du marche, les herbes aromatiques de la garrigue : chaque ingredient est
                un hommage au terroir local. La carte des vins celebre les cepages
                languedociens — picpoul, grenache, syrah — qui prospèrent sur les sols
                volcaniques de la region.
              </p>
              <p>
                En terrasse, face aux facades de basalte de la place Jean Jaures, le dejeuner
                prend des airs de banquet mediterraneen. La lumiere du Midi, le murmure de la
                fontaine, le parfum des plats qui s&apos;echappe de la cuisine : c&apos;est une
                experience sensorielle complete qui vient naturellement couronner une matinee
                culturelle au musee. Le soir, l&apos;ambiance se fait plus intimiste, et la place
                baignee de lumiere doree invite au diner en amoureux ou entre amis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Parcours ideal ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
              Un parcours culturel et gourmand dans le centre d&apos;Agde
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base font-light leading-relaxed text-brand-cream/80">
            <p>
              Pour vivre une journee complete a Agde, nous vous suggerons un itineraire qui
              combine les richesses du patrimoine et les plaisirs de la table. Debutez par la
              visite du Musee Agathois le matin, en prenant le temps d&apos;admirer l&apos;Ephebe
              et de parcourir les collections a votre rythme. Comptez environ une heure trente
              pour une visite approfondie.
            </p>
            <p>
              En sortant du musee, dirigez-vous vers la place Jean Jaures en empruntant les
              ruelles du centre ancien. Faites un crochet par la{" "}
              <Link
                href="/agde/cathedrale-saint-etienne"
                className="text-brand-gold underline decoration-brand-gold/50 underline-offset-4 transition-colors hover:text-brand-cream"
              >
                cathedrale Saint-Etienne
              </Link>
              , a deux pas du musee, pour admirer sa silhouette de forteresse en basalte. Puis
              installez-vous au Divino pour un dejeuner qui celebre les saveurs du terroir
              languedocien.
            </p>
            <p>
              L&apos;apres-midi, poursuivez votre exploration par la{" "}
              <Link
                href="/agde/promenade"
                className="text-brand-gold underline decoration-brand-gold/50 underline-offset-4 transition-colors hover:text-brand-cream"
              >
                promenade en bord d&apos;Herault
              </Link>
              . Les quais offrent une perspective superbe sur la vieille ville et ses facades de
              pierre sombre. C&apos;est le complement ideal d&apos;une journee qui mele
              decouverte historique, plaisir gastronomique et flanerie au fil de l&apos;eau.
            </p>
          </div>
        </div>
      </section>

      {/* ── Infos pratiques ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-3xl">
            Informations pratiques
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <div className="mt-10 space-y-4 text-base font-light text-brand-dark/90">
            <div className="rounded-sm border border-brand-dark/10 p-6">
              <h3 className="text-sm font-normal tracking-[0.2em] uppercase text-brand-bordeaux">
                Le Divino
              </h3>
              <p className="mt-2">5 place Jean Jaures, 34300 Agde</p>
              <p>
                Tel :{" "}
                <a href="tel:+33448177875" className="underline hover:text-brand-bordeaux transition-colors">
                  04 48 17 78 75
                </a>
              </p>
              <p>Mardi au samedi 12h-14h / 19h-22h — Dimanche 12h-15h30</p>
              <p>Ferme le lundi</p>
            </div>
            <div className="rounded-sm border border-brand-dark/10 p-6">
              <h3 className="text-sm font-normal tracking-[0.2em] uppercase text-brand-bordeaux">
                Musee Agathois Jules Baudou
              </h3>
              <p className="mt-2">5 rue de la Fraternite, 34300 Agde</p>
              <p>A 5 minutes a pied du restaurant Le Divino</p>
              <p>Consultez les horaires d&apos;ouverture aupres de l&apos;Office de Tourisme</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Reservation ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-cream md:text-4xl">
            Reservez votre table apres le musee
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-base font-light text-brand-cream/80">
            De l&apos;Ephebe d&apos;Agde aux saveurs du Languedoc, prolongez votre voyage
            culturel par un repas d&apos;exception au Divino. Terrasse ensoleillée ou salle
            intimiste, nous vous attendons place Jean Jaures.
          </p>
          <Link
            href="/reservation"
            className="mt-10 inline-block border border-brand-gold px-12 py-4 text-xs font-normal tracking-[0.2em] uppercase text-brand-gold transition-all duration-300 hover:bg-brand-gold hover:text-brand-dark"
          >
            Reserver une table
          </Link>
          <p className="mt-6 text-sm font-light text-brand-cream/60">
            Ou par telephone au 04 48 17 78 75
          </p>
        </div>
      </section>

      {/* ── Decouvrir aussi ── */}
      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-3xl">
            Decouvrez aussi a Agde
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:flex-wrap">
            <Link
              href="/agde/chateau-laurens"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              Chateau Laurens
            </Link>
            <Link
              href="/agde/promenade"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              Promenade d&apos;Agde
            </Link>
            <Link
              href="/agde/cathedrale-saint-etienne"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              Cathedrale Saint-Etienne
            </Link>
            <Link
              href="/restaurant-agde"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              Restaurant a Agde
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
