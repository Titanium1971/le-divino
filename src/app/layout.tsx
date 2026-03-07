import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { SITE_URL, LOCALES, DEFAULT_LOCALE, RESTAURANT_JSON_LD } from "@/lib/seo/constants";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(RESTAURANT_JSON_LD) }}
        />
      </head>
      <body className={`${raleway.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
