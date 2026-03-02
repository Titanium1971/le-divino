import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Le Divino — Restaurant | Agde",
  description: "Restaurant de cuisine traditionnelle française au cœur d'Agde.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${raleway.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
