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
  const canonical = `${SITE_URL}${locale === "fr" ? "" : `/${locale}`}/agde/promenade`;

  return {
    title: "Restaurant pres de la Promenade d'Agde | Le Divino — Cuisine francaise",
    description:
      "Decouvrez Le Divino, restaurant a quelques pas de la promenade d'Agde. Cuisine traditionnelle francaise, terrasse sur la place Jean Jaures. Ideal apres une balade.",
    keywords:
      "restaurant promenade Agde, manger a Agde centre, restaurant terrasse Agde, dejeuner Agde vieille ville",
    alternates: { canonical },
    openGraph: {
      title: "Restaurant pres de la Promenade d'Agde | Le Divino",
      description:
        "Cuisine traditionnelle francaise a deux pas de la promenade d'Agde. Terrasse, produits locaux, ambiance chaleureuse place Jean Jaures.",
      url: canonical,
      siteName: "Le Divino",
      locale: "fr_FR",
      type: "article",
      images: [
        {
          url: `${SITE_URL}/images/exterior-terrace.jpg`,
          width: 1200,
          height: 630,
          alt: "Terrasse du restaurant Le Divino pres de la promenade d'Agde",
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
        item: `${SITE_URL}/agde/promenade`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Promenade d'Agde",
        item: `${SITE_URL}/agde/promenade`,
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
      "Restaurant de cuisine traditionnelle francaise situe a quelques pas de la promenade d'Agde, place Jean Jaures.",
    url: `${SITE_URL}`,
    telephone: "+33448177875",
    email: "contact@ledivino-agde.fr",
    image: `${SITE_URL}/images/exterior-terrace.jpg`,
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
    name: "Promenade d'Agde",
    description:
      "Promenade en bord de l'Herault dans le centre historique d'Agde. Balades le long des quais, vue sur la vieille ville en basalte noir.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Agde",
      postalCode: "34300",
      addressCountry: "FR",
    },
  };
}

export default async function PromenadeAgdePage({ params }: Props) {
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
          src="/images/exterior-terrace.jpg"
          alt="Restaurant Le Divino a proximite de la promenade d'Agde, terrasse place Jean Jaures"
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
            <span className="text-brand-cream/90">Promenade</span>
          </nav>
          <h1 className="text-4xl font-extralight tracking-[0.15em] text-brand-cream md:text-5xl">
            Restaurant pres de la Promenade d&apos;Agde
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-lg font-light tracking-wide text-brand-cream/80">
            Une halte gourmande a quelques pas des quais de l&apos;Herault
          </p>
        </div>
      </section>

      {/* ── La Promenade d'Agde : un ecrin de patrimoine ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              La Promenade d&apos;Agde : un ecrin de patrimoine en bord d&apos;Herault
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
            <p>
              La promenade d&apos;Agde est l&apos;un de ces lieux ou le temps semble ralentir.
              Longeant les rives de l&apos;Herault, elle offre un panorama unique sur la vieille
              ville, ses facades en pierre de basalte noir et ses toits de tuiles ocre qui se
              decoupent sur le ciel du Midi. Que vous soyez de passage ou habitant de longue date,
              cette balade en bordure de fleuve reste un incontournable pour qui veut comprendre
              l&apos;ame d&apos;Agde.
            </p>
            <p>
              Les quais, bordes de platanes centenaires, accueillent promeneurs et cyclistes a
              toute heure de la journee. Le matin, la lumiere douce caresse les pierres volcaniques
              de la cite. En fin d&apos;apres-midi, les reflets dores du soleil couchant sur
              l&apos;eau de l&apos;Herault composent un tableau dont on ne se lasse pas. C&apos;est
              ici, entre le fleuve et les ruelles du centre historique, que bat le coeur veritable
              de la ville, loin de l&apos;effervescence estivale du Cap d&apos;Agde.
            </p>
            <p>
              Le parcours serpente depuis le pont en aval jusqu&apos;aux abords de la cathedrale
              Saint-Etienne, passant devant des maisons de pecheurs restaurees, des jardins
              secrets, et quelques terrasses de cafes ou l&apos;on s&apos;attarde volontiers.
              Chaque saison apporte son charme : les platanes bourgeonnants au printemps, leur
              ombre genereuse en ete, les teintes fauves de l&apos;automne, et la quietude
              cristalline de l&apos;hiver. La promenade d&apos;Agde est bien plus qu&apos;un simple
              chemin — c&apos;est une invitation a la flanerie, un trait d&apos;union entre le
              patrimoine historique et l&apos;art de vivre mediterraneen.
            </p>
          </div>
        </div>
      </section>

      {/* ── Un lieu charge d'histoire ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/salle-bord-eau.jpg"
                  alt="Vue sur l'Herault depuis le centre d'Agde, a proximite du restaurant Le Divino"
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
              Un lieu charge d&apos;histoire
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-cream/80">
              <p>
                Fondee il y a plus de 2 600 ans par les Grecs de Phocee sous le nom
                d&apos;Agatha Tyche, Agde est l&apos;une des plus anciennes villes de France. La
                promenade qui longe le fleuve temoigne de cette histoire millenaire. En marchant
                le long des quais, on croise les vestiges d&apos;un passe maritime glorieux : anciens
                entrepots de negociants, anneaux d&apos;amarrage en fer forge, et escaliers de
                pierre descendant vers les berges ou accostaient jadis les barques de peche.
              </p>
              <p>
                La pierre de basalte, ce materiau volcanique sombre qui donne a Agde son surnom
                de &laquo; Perle noire de la Mediterranee &raquo;, est omnipresente le long de la
                promenade. Elle habille les murs des maisons, pave certains troncons du chemin et
                confere a l&apos;ensemble une atmospherique singuliere, a la fois austere et
                profondement elegante. C&apos;est un paysage urbain que l&apos;on ne retrouve nulle
                part ailleurs sur le littoral languedocien.
              </p>
              <p>
                Au fil de votre balade, ne manquez pas d&apos;observer les details
                architecturaux : linteaux sculptes, portes cloutees, fenetres a meneaux. Chaque
                facade raconte un chapitre de l&apos;histoire agathoise, du Moyen Age a la
                Renaissance, des guerres de Religion a l&apos;essor touristique contemporain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Le Divino : a quelques pas de la promenade ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:flex-row-reverse md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/bar-divino.jpg"
                  alt="Interieur chaleureux du restaurant Le Divino a Agde"
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
              Le Divino : une table d&apos;exception a deux pas de la promenade
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-dark/90">
              <p>
                Au terme de votre promenade — ou pour la ponctuer d&apos;une pause
                gourmande — Le Divino vous accueille au 5 place Jean Jaures, a quelques
                metres seulement des quais de l&apos;Herault. Ce restaurant de cuisine
                traditionnelle francaise est devenu, au fil des saisons, un rendez-vous
                privilegie pour les amateurs de bonne chair qui arpentent le centre historique
                d&apos;Agde.
              </p>
              <p>
                Installe sur l&apos;une des plus belles places de la vieille ville, Le Divino
                dispose d&apos;une terrasse ombragee ou il fait bon s&apos;attabler apres une
                longue marche. L&apos;ambiance y est a la fois decontractee et raffinee : nappes
                soignees, eclairage tamisé le soir, et un service attentif qui laisse le temps de
                savourer chaque instant. La place Jean Jaures, avec ses facades de basalte et
                sa fontaine, offre un cadre de repas dont on se souvient longtemps.
              </p>
              <p>
                La cuisine du Divino met en valeur les produits du terroir languedocien et les
                arrivages de la Mediterranee toute proche. Le chef compose des assiettes ou la
                tradition francaise rencontre l&apos;inspiration meridionale : poissons frais du
                jour, viandes selectionnees aupres de producteurs locaux, legumes de saison
                issus du marche d&apos;Agde. La carte des vins, quant a elle, fait la part belle
                aux appellations du Languedoc et de la vallee du Rhone, avec quelques pepites
                venues d&apos;ailleurs pour les palais curieux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pourquoi dejeuner pres de la promenade ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
              Pourquoi dejeuner ou diner pres de la promenade d&apos;Agde ?
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Cadre authentique",
                text: "La place Jean Jaures offre un decor de village provencal en plein coeur de la cite historique, loin de l'agitation touristique.",
              },
              {
                title: "Terrasse ombragee",
                text: "Installez-vous en plein air pour profiter de la douceur mediterraneenne tout en degustant une cuisine raffinee.",
              },
              {
                title: "Produits locaux",
                text: "Le chef privilegia les circuits courts : poissons du Grau d'Agde, legumes du marche, vins du Languedoc.",
              },
              {
                title: "Ideal apres la balade",
                text: "A quelques pas des quais, Le Divino est l'etape naturelle pour prolonger le plaisir d'une promenade en bord d'Herault.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 h-px w-10 bg-brand-gold" />
                <h3 className="text-sm font-normal tracking-[0.2em] uppercase text-brand-cream">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-brand-cream/70">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parcours suggere ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              Un parcours entre patrimoine et gastronomie
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
            <p>
              Pour profiter pleinement de votre visite a Agde, voici un itineraire que nous
              aimons recommander. Commencez par une promenade matinale le long de l&apos;Herault,
              en partant du quai du Chapitre. Admirez la vue sur le fleuve et les toits de la
              vieille ville. Poursuivez jusqu&apos;a la{" "}
              <Link
                href="/agde/cathedrale-saint-etienne"
                className="text-brand-bordeaux underline decoration-brand-gold underline-offset-4 transition-colors hover:text-brand-gold"
              >
                cathedrale Saint-Etienne
              </Link>
              , imposante forteresse de basalte qui veille sur la cite depuis le XIIe siecle.
            </p>
            <p>
              Apres votre visite de la cathedrale, remontez la rue jusqu&apos;a la place Jean
              Jaures — c&apos;est la que Le Divino vous attend pour un dejeuner en terrasse ou
              dans la salle elegante du restaurant. Le midi, la formule du jour permet de
              decouvrir la cuisine du chef a prix doux, tandis que le soir, la carte complete
              invite a un repas plus elabore, accorde aux meilleurs vins de la region.
            </p>
            <p>
              L&apos;apres-midi, prolongez la decouverte en vous rendant au{" "}
              <Link
                href="/agde/musee-agathois"
                className="text-brand-bordeaux underline decoration-brand-gold underline-offset-4 transition-colors hover:text-brand-gold"
              >
                Musee Agathois
              </Link>
              , a quelques minutes a pied, pour plonger dans l&apos;histoire fascinante de la
              ville et admirer le celebre Ephebe d&apos;Agde. Un programme complet qui mele
              culture, patrimoine et plaisirs de la table — tout ce qui fait le charme d&apos;une
              journee dans le centre historique d&apos;Agde.
            </p>
          </div>
        </div>
      </section>

      {/* ── Infos pratiques ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
            Informations pratiques
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <div className="mt-10 space-y-3 text-base font-light text-brand-cream/80">
            <p>
              <strong className="font-normal text-brand-cream">Adresse :</strong> 5 place Jean
              Jaures, 34300 Agde
            </p>
            <p>
              <strong className="font-normal text-brand-cream">Telephone :</strong>{" "}
              <a href="tel:+33448177875" className="underline hover:text-brand-gold transition-colors">
                04 48 17 78 75
              </a>
            </p>
            <p>
              <strong className="font-normal text-brand-cream">Horaires :</strong> Mardi au
              samedi 12h-14h / 19h-22h — Dimanche 12h-15h30 — Ferme le lundi
            </p>
            <p>
              <strong className="font-normal text-brand-cream">Acces :</strong> A 2 minutes a pied
              de la promenade des quais de l&apos;Herault
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Reservation ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-cream md:text-4xl">
            Reservez votre table apres la promenade
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-base font-light text-brand-cream/80">
            Une balade en bord d&apos;Herault merite une belle table. Reservez en ligne ou
            appelez-nous pour un dejeuner en terrasse ou un diner aux chandelles place Jean
            Jaures.
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
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/agde/cathedrale-saint-etienne"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              Cathedrale Saint-Etienne
            </Link>
            <Link
              href="/agde/musee-agathois"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              Musee Agathois
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
