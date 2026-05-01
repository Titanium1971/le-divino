import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { CookieBanner } from "@/components/restaurant/cookie-banner";
import { GoogleAnalytics } from "@/components/restaurant/google-analytics";
import { SITE_URL, LOCALES, DEFAULT_LOCALE, buildRestaurantJsonLd, buildOrganizationJsonLd } from "@/lib/seo/constants";
import { createClient } from "@/lib/supabase/server";
import { getHoraires } from "@/lib/supabase/horaires";
import { getGoogleRating } from "@/lib/google-rating";
import "./globals.css";

export const revalidate = 3600;


const raleway = Raleway({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Le Divino — Restaurant | Agde",
  description: "Restaurant de cuisine traditionnelle française au cœur d'Agde.",
  alternates: {
    canonical: SITE_URL,
    languages: Object.fromEntries([
      ...LOCALES.map((l) => [l, l === DEFAULT_LOCALE ? SITE_URL : `${SITE_URL}/${l}`]),
      ["x-default", SITE_URL],
    ]),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const [horaires, rating] = await Promise.all([
    getHoraires(supabase),
    getGoogleRating(),
  ]);
  const jsonLd = buildRestaurantJsonLd(horaires, rating);
  const orgJsonLd = buildOrganizationJsonLd();

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://spncxhvqcytxdruevfrz.supabase.co" />
        <link rel="dns-prefetch" href="https://spncxhvqcytxdruevfrz.supabase.co" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${raleway.variable} font-sans antialiased`}>
        {children}
        <GoogleAnalytics />
        <CookieBanner />
      </body>
    </html>
  );
}
