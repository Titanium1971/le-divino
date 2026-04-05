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
  const canonical = `${SITE_URL}${locale === "fr" ? "" : `/${locale}`}/agde/cathedrale-saint-etienne`;

  return {
    title: "Restaurant a cote de la Cathedrale d'Agde | Le Divino — Place Jean Jaures",
    description:
      "Le Divino, restaurant a cote de la cathedrale Saint-Etienne d'Agde. Cuisine francaise traditionnelle, terrasse place Jean Jaures. Dejeuner ou diner apres la visite.",
    keywords:
      "restaurant cathedrale Agde, restaurant place Jean Jaures Agde, manger pres cathedrale Saint-Etienne",
    alternates: { canonical },
    openGraph: {
      title: "Restaurant a cote de la Cathedrale d'Agde | Le Divino",
      description:
        "Cuisine traditionnelle francaise juste a cote de la cathedrale Saint-Etienne d'Agde. Terrasse, produits locaux, place Jean Jaures.",
      url: canonical,
      siteName: "Le Divino",
      locale: "fr_FR",
      type: "article",
      images: [
        {
          url: `${SITE_URL}/images/hero-exterior-night.jpg`,
          width: 1200,
          height: 630,
          alt: "Restaurant Le Divino a cote de la cathedrale Saint-Etienne d'Agde",
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
        item: `${SITE_URL}/agde/cathedrale-saint-etienne`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Cathedrale Saint-Etienne",
        item: `${SITE_URL}/agde/cathedrale-saint-etienne`,
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
      "Restaurant de cuisine traditionnelle francaise situe a cote de la cathedrale Saint-Etienne d'Agde, place Jean Jaures.",
    url: `${SITE_URL}`,
    telephone: "+33448177875",
    email: "contact@ledivino-agde.fr",
    image: `${SITE_URL}/images/hero-exterior-night.jpg`,
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
    name: "Cathedrale Saint-Etienne d'Agde",
    description:
      "Cathedrale-forteresse du XIIe siecle construite en basalte noir. Monument historique classe, l'un des edifices les plus remarquables du Languedoc.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Agde",
      postalCode: "34300",
      addressCountry: "FR",
    },
  };
}

export default async function CathedraleAgdePage({ params }: Props) {
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
          src="/images/hero-exterior-night.jpg"
          alt="Restaurant Le Divino a cote de la cathedrale Saint-Etienne d'Agde, vue de nuit"
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
            <span className="text-brand-cream/90">Cathedrale Saint-Etienne</span>
          </nav>
          <h1 className="text-4xl font-extralight tracking-[0.15em] text-brand-cream md:text-5xl">
            Restaurant pres de la Cathedrale Saint-Etienne d&apos;Agde
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-lg font-light tracking-wide text-brand-cream/80">
            Savourez une cuisine d&apos;exception a l&apos;ombre de la forteresse millenaire
          </p>
        </div>
      </section>

      {/* ── La Cathedrale Saint-Etienne ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              La Cathedrale Saint-Etienne : sentinelle de basalte noir
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
            <p>
              Dominant la vieille ville de sa silhouette massive, la cathedrale Saint-Etienne
              d&apos;Agde est un monument qui ne ressemble a aucun autre. Erigee au XIIe siecle
              sur les fondations d&apos;un edifice carolingien plus ancien, cette
              cathedrale-forteresse a ete construite entierement en pierre de basalte noir,
              ce materiau volcanique qui fait la singularite architecturale d&apos;Agde. Ses murs
              epais, ses creneaux et son clocher donjon temoignent d&apos;une epoque ou les
              edifices religieux devaient aussi proteger la population des incursions barbaresques
              venues de la mer.
            </p>
            <p>
              Classee monument historique depuis 1840, la cathedrale Saint-Etienne est l&apos;un
              des plus anciens edifices fortifies du Languedoc. Sa nef unique, austere et
              majestueuse, impressionne par sa hauteur sous voute et par l&apos;atmosphere de
              recueillement qui y regne. Les chapelles laterales abritent quelques oeuvres d&apos;art
              sacre remarquables, et le chevet roman, visible depuis la place de la Marine,
              rappelle l&apos;epoque ou Agde etait un port fluvial d&apos;importance.
            </p>
            <p>
              L&apos;exterieur de l&apos;edifice n&apos;est pas moins fascinant. Les
              contreforts puissants, les meurtieres et le chemin de ronde racontent a eux seuls
              des siecles d&apos;histoire mouvementee. En levant les yeux vers le clocher, on
              distingue les pierres plus claires des restaurations successives, temoins de la
              volonte constante de preserver ce joyau du patrimoine agathois. La cathedrale
              trône au coeur d&apos;un lacis de ruelles etroites et de placettes ombragees qui
              menent naturellement a la place Jean Jaures, centre nevralgique de la vie sociale
              de la vieille ville.
            </p>
          </div>
        </div>
      </section>

      {/* ── Histoire et architecture ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/interieur-salle-bar.jpg"
                  alt="Interieur elegant du restaurant Le Divino pres de la cathedrale d'Agde"
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
              Neuf siecles d&apos;histoire a portee de regard
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-cream/80">
              <p>
                La construction de la cathedrale debuta vers 1173, sous l&apos;episcopat de
                l&apos;eveque Guillaume. L&apos;edifice fut concu des l&apos;origine comme une
                forteresse : Agde, ville cotiere, subissait alors regulierement les raids des
                pirates sarrasins. La population devait pouvoir se refugier dans la cathedrale
                en cas d&apos;attaque, ce qui explique l&apos;epaisseur considerable de ses murs
                — pres de deux metres par endroits — et la presence d&apos;elements defensifs
                inhabituels pour un lieu de culte.
              </p>
              <p>
                Au cours des siecles suivants, la cathedrale fut a la fois lieu de priere,
                refuge militaire et symbole du pouvoir episcopal sur la ville. Les eveques
                d&apos;Agde y siegerent jusqu&apos;a la Revolution, et l&apos;edifice traversa
                les guerres de Religion, les conflits avec Beziers, et les soubresauts de
                l&apos;histoire languedocienne sans jamais perdre sa fonction sacree.
              </p>
              <p>
                Aujourd&apos;hui, la cathedrale Saint-Etienne est un site incontournable pour
                tout visiteur d&apos;Agde. Les visites guidees organisees par l&apos;Office de
                Tourisme permettent de decouvrir ses secrets : les marques de tacherons gravees
                dans le basalte, la crypte enfouie sous le choeur, et la vue panoramique depuis
                le sommet du clocher donjon sur les toits de la ville et le cours de l&apos;Herault.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Le Divino a cote de la cathedrale ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:flex-row-reverse md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/exterior-terrace.jpg"
                  alt="Terrasse du restaurant Le Divino, place Jean Jaures, a cote de la cathedrale d'Agde"
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
              Le Divino : votre restaurant a l&apos;ombre de la cathedrale
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-dark/90">
              <p>
                En sortant de la cathedrale Saint-Etienne, il suffit de quelques pas pour
                rejoindre la place Jean Jaures et la terrasse du Divino. Cette proximite
                fait du restaurant l&apos;adresse naturelle pour prolonger une visite culturelle
                par un moment de plaisir gastronomique. Nombre de visiteurs decouvrent
                d&apos;ailleurs Le Divino apres avoir admire la cathedrale — et y reviennent
                ensuite pour sa cuisine autant que pour son cadre.
              </p>
              <p>
                Le chef du Divino propose une cuisine traditionnelle francaise a accent
                mediterraneen, elaboree a partir de produits frais et de saison. Les poissons
                arrivent chaque matin du Grau d&apos;Agde, les fruits et legumes proviennent des
                maraichers de la plaine de l&apos;Herault, et les viandes sont selectionnees
                aupres d&apos;eleveurs de la region. Chaque assiette raconte le terroir, avec
                la meme honnetete que les pierres de basalte racontent l&apos;histoire de la cite.
              </p>
              <p>
                L&apos;interieur du restaurant merite aussi le detour. La salle, chaleureuse et
                intimiste, allie pierres apparentes et decoration contemporaine dans un
                equilibre de bon gout. Le soir, l&apos;eclairage tamisé et les bougies creent
                une ambiance particulierement propice aux diners romantiques — le cadre parfait
                apres une deambulation au crepuscule dans les ruelles millenaires de la vieille
                ville.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Suggestions de visite ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extralight tracking-[0.15em] text-brand-cream md:text-3xl">
              Votre journee a Agde : cathedrale, gastronomie et patrimoine
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                step: "Matin",
                title: "Visite de la cathedrale",
                text: "Commencez par la decouverte de la cathedrale Saint-Etienne. Comptez environ une heure pour apprecier l'architecture, la nef et la vue depuis le clocher.",
              },
              {
                step: "Midi",
                title: "Dejeuner au Divino",
                text: "Rejoignez la place Jean Jaures pour un dejeuner en terrasse. La formule du midi offre un excellent rapport qualite-prix avec des produits du marche.",
              },
              {
                step: "Apres-midi",
                title: "Promenade et musee",
                text: "Flanez le long de la promenade en bord d'Herault, puis visitez le Musee Agathois pour completer votre immersion dans l'histoire d'Agde.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="text-xs font-normal tracking-[0.3em] uppercase text-brand-gold">
                  {item.step}
                </span>
                <h3 className="mt-3 text-sm font-normal tracking-[0.2em] uppercase text-brand-cream">
                  {item.title}
                </h3>
                <div className="mx-auto my-4 h-px w-10 bg-brand-gold" />
                <p className="text-sm font-light leading-relaxed text-brand-cream/70">
                  {item.text}
                </p>
              </div>
            ))}
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
          <div className="mt-10 space-y-3 text-base font-light text-brand-dark/90">
            <p>
              <strong className="font-normal text-brand-dark">Adresse :</strong> 5 place Jean
              Jaures, 34300 Agde — a 1 minute a pied de la cathedrale Saint-Etienne
            </p>
            <p>
              <strong className="font-normal text-brand-dark">Telephone :</strong>{" "}
              <a href="tel:+33448177875" className="underline hover:text-brand-bordeaux transition-colors">
                04 48 17 78 75
              </a>
            </p>
            <p>
              <strong className="font-normal text-brand-dark">Horaires :</strong> Mardi au
              samedi 12h-14h / 19h-22h — Dimanche 12h-15h30 — Ferme le lundi
            </p>
            <p>
              <strong className="font-normal text-brand-dark">Conseil :</strong> Reservez pour
              le dejeuner en haute saison, la terrasse est tres prisee apres les visites de la
              cathedrale
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Reservation ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-cream md:text-4xl">
            Reservez votre table pres de la cathedrale
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-base font-light text-brand-cream/80">
            Apres la decouverte de la cathedrale Saint-Etienne, offrez-vous un moment de
            gastronomie au Divino. Dejeuner en terrasse ou diner intimiste, nous vous
            accueillons place Jean Jaures.
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
              href="/agde/promenade"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              Promenade d&apos;Agde
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
