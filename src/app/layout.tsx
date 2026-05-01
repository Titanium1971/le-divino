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
        {/* TEMP DEBUG — affiche les erreurs JS directement à l'écran. À retirer une fois le bug iOS résolu. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  function show(msg){
    try{
      var d=document.getElementById('__err_overlay');
      if(!d){
        d=document.createElement('div');
        d.id='__err_overlay';
        d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#b00;color:#fff;font:12px/1.4 monospace;padding:10px;max-height:70vh;overflow:auto;white-space:pre-wrap;word-break:break-word;';
        (document.body||document.documentElement).appendChild(d);
      }
      d.textContent += msg + '\\n---\\n';
    }catch(e){}
  }
  window.addEventListener('error', function(e){
    show('[error] ' + (e.message||'?') + ' @ ' + (e.filename||'?') + ':' + (e.lineno||'?') + ':' + (e.colno||'?') + (e.error&&e.error.stack?'\\n'+e.error.stack:''));
  });
  window.addEventListener('unhandledrejection', function(e){
    var r=e.reason;
    show('[promise] ' + (r&&r.message?r.message:String(r)) + (r&&r.stack?'\\n'+r.stack:''));
  });
  show('[ua] ' + navigator.userAgent);
  show('[crypto.randomUUID] ' + (typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?'ok':'MISSING'));
  try{ var t=sessionStorage.getItem('x'); show('[sessionStorage] ok'); }catch(e){ show('[sessionStorage] FAIL: '+e.message); }
  try{ var t=localStorage.getItem('x'); show('[localStorage] ok'); }catch(e){ show('[localStorage] FAIL: '+e.message); }
})();
`,
          }}
        />
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
