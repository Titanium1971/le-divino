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
  const canonical = `${SITE_URL}${locale === "fr" ? "" : `/${locale}`}/agde/chateau-laurens`;

  return {
    title: "Restaurant pres du Chateau Laurens d'Agde | Le Divino — Place Jean Jaures",
    description:
      "Le Divino, restaurant a quelques minutes du Chateau Laurens d'Agde. Cuisine francaise traditionnelle, terrasse place Jean Jaures. Dejeuner ou diner apres la visite de la villa Belle Epoque.",
    keywords:
      "restaurant Chateau Laurens Agde, manger pres Chateau Laurens, restaurant villa Belle Epoque Agde, ou diner apres Chateau Laurens",
    alternates: { canonical },
    openGraph: {
      title: "Restaurant pres du Chateau Laurens d'Agde | Le Divino",
      description:
        "Cuisine traditionnelle francaise a quelques minutes du Chateau Laurens, joyau Belle Epoque d'Agde. Terrasse, produits locaux, place Jean Jaures.",
      url: canonical,
      siteName: "Le Divino",
      locale: "fr_FR",
      type: "article",
      images: [
        {
          url: `${SITE_URL}/images/hero-exterior-night.jpg`,
          width: 1200,
          height: 630,
          alt: "Restaurant Le Divino pres du Chateau Laurens d'Agde",
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
        item: `${SITE_URL}/agde/chateau-laurens`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Chateau Laurens",
        item: `${SITE_URL}/agde/chateau-laurens`,
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
      "Restaurant de cuisine traditionnelle francaise a quelques minutes du Chateau Laurens d'Agde, place Jean Jaures.",
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
    name: "Chateau Laurens d'Agde",
    description:
      "Villa Belle Epoque eclectique construite entre 1898 et 1901 par Emmanuel Laurens. Joyau du patrimoine d'Agde, melange unique d'Art Nouveau, d'orientalisme et de neo-egyptien. Restaure et ouvert au public en 2023.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Agde",
      postalCode: "34300",
      addressCountry: "FR",
    },
  };
}

export default async function ChateauLaurensAgdePage({ params }: Props) {
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
          alt="Restaurant Le Divino pres du Chateau Laurens d'Agde, vue de nuit"
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
            <span className="text-brand-cream/90">Chateau Laurens</span>
          </nav>
          <h1 className="text-4xl font-extralight tracking-[0.15em] text-brand-cream md:text-5xl">
            Restaurant pres du Chateau Laurens d&apos;Agde
          </h1>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-lg font-light tracking-wide text-brand-cream/80">
            Prolongez votre visite de la villa Belle Epoque par une table d&apos;exception
          </p>
        </div>
      </section>

      {/* ── Le Chateau Laurens ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-bordeaux md:text-4xl">
              Le Chateau Laurens : reve oriental sur les bords de l&apos;Herault
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base font-light leading-relaxed text-brand-dark/90 md:text-lg">
            <p>
              Pose au coeur de l&apos;Ile des Loisirs, sur les berges paisibles de l&apos;Herault,
              le Chateau Laurens est sans doute le monument le plus surprenant d&apos;Agde. Loin
              des forteresses austeres en basalte qui peuplent la vieille ville, cette villa
              raconte une autre histoire : celle d&apos;un homme du tournant du XXe siecle, riche
              heritier et grand voyageur, qui voulut faire de sa demeure un manifeste
              architectural. Construit entre 1898 et 1901 pour Emmanuel Laurens, le chateau
              melange avec une audace rare l&apos;Art Nouveau, l&apos;orientalisme, le style
              neo-egyptien et la mythologie greco-romaine. Le resultat est une residence
              eclectique unique, longtemps oubliee puis triomphalement restauree.
            </p>
            <p>
              Apres plusieurs decennies de silence et un long chantier de restauration mene par
              la communaute d&apos;agglomeration Agde Herault Mediterranee, le Chateau Laurens
              a rouvert ses portes au public en 2023. Le bouche-a-oreille a fait le reste : la
              villa est devenue en quelques mois l&apos;une des visites incontournables du
              Languedoc, attirant aussi bien les amateurs d&apos;art que les curieux qui
              decouvrent, ebahis, des plafonds peints, des vitraux orientalisants et des sols
              mosaiques d&apos;une finesse rare.
            </p>
            <p>
              La visite traverse une succession de salons themes : la salle des Lotus aux
              colonnes egyptiennes, le boudoir oriental aux moucharabiehs sculptes, la
              bibliotheque aux boiseries fleuries, ou encore la salle de musique avec son
              orgue d&apos;origine. Chaque piece est une scene, chaque detail un clin d&apos;oeil
              aux voyages d&apos;Emmanuel Laurens en Egypte, en Inde, en Grece. On ressort de la
              visite avec le sentiment d&apos;avoir traverse un reve d&apos;esthete fortune,
              fige a l&apos;aube du XXe siecle.
            </p>
          </div>
        </div>
      </section>

      {/* ── Histoire et restauration ── */}
      <section className="bg-brand-dark/90 py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/salle-bord-eau.jpg"
                  alt="Salle elegante du Divino, table reservee apres la visite du Chateau Laurens"
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
              D&apos;un reve d&apos;heritier a un joyau public
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-cream/80">
              <p>
                Emmanuel Laurens, fils d&apos;une famille agathoise enrichie par le commerce et
                la pharmacie, avait herite jeune d&apos;une fortune consequente apres le
                deces inattendu d&apos;un parent egyptien. Plutot que de la placer, il choisit
                de la depenser pour donner forme a ses passions : la musique, les voyages, et
                une certaine idee du beau. Il fit appel a l&apos;architecte Olivier Garros,
                puis a une nuee d&apos;artisans peintres, mosaistes, ferronniers, ebenistes,
                pour faconner cette villa qui devait etre, selon ses mots, &laquo; le rêve
                accompli d&apos;un homme libre &raquo;.
              </p>
              <p>
                Apres sa mort en 1959, le chateau passa de main en main, fut un temps lieu de
                villegiature puis abandonne. Les decennies de friche ont failli avoir raison de
                son ame : peintures murales menacees par l&apos;humidite, vitraux fendus,
                mosaiques disparaissant sous les depots. Il aura fallu pres de vingt ans
                d&apos;etudes et de travaux pour redonner au monument son eclat d&apos;origine.
                Inscrit aux Monuments Historiques, le Chateau Laurens est aujourd&apos;hui un
                exemple international de restauration patrimoniale.
              </p>
              <p>
                Le parc qui entoure la villa merite egalement le detour. Arbres centenaires,
                glycines, canal d&apos;eau vive : tout invite a prolonger la visite a
                l&apos;exterieur, dans une atmosphere paisible qui contraste agreablement avec
                la richesse foisonnante des interieurs. Au printemps et en ete, des
                evenements culturels — concerts, lectures, expositions temporaires — animent
                regulierement le site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Le Divino apres la visite ── */}
      <section className="bg-brand-cream py-24">
        <div className="mx-auto max-w-5xl px-6 md:flex md:flex-row-reverse md:items-center md:gap-12">
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-sm">
              <div className="aspect-[4/3]">
                <Image
                  src="/images/exterior-terrace.jpg"
                  alt="Terrasse du restaurant Le Divino, place Jean Jaures, ideale apres la visite du Chateau Laurens"
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
              Le Divino : la table qui prolonge le reve
            </h2>
            <div className="mt-4 h-px w-12 bg-brand-gold" />
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-brand-dark/90">
              <p>
                Apres une visite aussi riche que celle du Chateau Laurens, l&apos;envie est
                grande de s&apos;asseoir, de respirer, et de se laisser porter par un bon
                repas. La place Jean Jaures, ou se trouve Le Divino, est a une dizaine de
                minutes a pied du chateau en empruntant les berges de l&apos;Herault — une
                promenade agreable qui prolonge naturellement l&apos;etat d&apos;esprit
                contemplatif de la visite.
              </p>
              <p>
                Notre cuisine francaise traditionnelle, a accent mediterraneen, fait la part
                belle aux produits frais et aux producteurs locaux. Les poissons sont peches
                au Grau d&apos;Agde, les legumes viennent des maraichers de la plaine, les
                vins sont selectionnes parmi les meilleurs domaines du Languedoc. C&apos;est
                ce meme souci d&apos;authenticite et de transmission qui anime aussi bien la
                cuisine du Divino que la restauration du Chateau Laurens : faire vivre un
                patrimoine, sans le figer.
              </p>
              <p>
                Le cadre du restaurant, chaleureux et soigne, prolonge cette atmosphere. La
                terrasse ombragee est ideale pour un dejeuner apres la visite ; la salle
                interieure, intimiste, accueille les diners du soir dans une lumiere tamisee.
                Beaucoup de visiteurs du chateau, francais comme etrangers, terminent leur
                journee chez nous — et nous racontent, autour d&apos;un verre, leurs decouvertes
                du jour.
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
              Une journee a Agde : Chateau Laurens, gastronomie et patrimoine
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                step: "Matin",
                title: "Visite du Chateau Laurens",
                text: "Comptez environ 1h30 pour parcourir les salons, le parc et profiter pleinement des decors restaures. Reservation conseillee, surtout en haute saison.",
              },
              {
                step: "Midi",
                title: "Dejeuner au Divino",
                text: "Rejoignez la place Jean Jaures a pied le long de l'Herault. Notre formule du midi, basee sur le marche du jour, offre un excellent contraste avec la richesse du chateau.",
              },
              {
                step: "Apres-midi",
                title: "Vieille ville et cathedrale",
                text: "Flanez dans les ruelles de la vieille ville, decouvrez la cathedrale Saint-Etienne en basalte noir, puis revenez longer l'Herault au coucher du soleil.",
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
              Jaures, 34300 Agde — environ 10 minutes a pied du Chateau Laurens en longeant
              l&apos;Herault
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
              <strong className="font-normal text-brand-dark">Conseil :</strong> Reservez votre
              table a l&apos;avance les jours d&apos;affluence du chateau (mercredi, samedi
              apres-midi en particulier)
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Reservation ── */}
      <section className="bg-brand-dark py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extralight tracking-[0.15em] text-brand-cream md:text-4xl">
            Reservez votre table apres le Chateau Laurens
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-brand-gold" />
          <p className="mt-6 text-base font-light text-brand-cream/80">
            Apres avoir admire les salons orientaux et les vitraux du Chateau Laurens, offrez-vous
            un dejeuner ou un diner a la hauteur de votre journee. Nous vous accueillons place
            Jean Jaures, a quelques minutes du chateau.
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
              href="/agde/promenade"
              className="border border-brand-bordeaux px-8 py-3 text-xs font-normal tracking-[0.2em] uppercase text-brand-bordeaux transition-all duration-300 hover:bg-brand-bordeaux hover:text-brand-cream"
            >
              Promenade d&apos;Agde
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
