# SEO / i18n — lot 4 : branchement des pages `/agde/*`

Date : 2026-07-01
Perimetre : `src/app/[locale]/(public)/agde/{promenade,cathedrale-saint-etienne,musee-agathois,chateau-laurens}/page.tsx`

## Changement commun aux 4 pages

- `generateMetadata` : textes FR codes en dur remplaces par `getTranslations({locale, namespace:"agde"})`
  → `t("<slug>.seo_title")`, `seo_description`, `seo_keywords`, `og_title`, `og_description`, `og_image_alt`.
- `alternates` complet : `canonical = getPageUrl(locale, "agde/<slug>")`, `languages` genere par boucle sur
  `LOCALES` (`fr,en,it,es,de`) + `x-default = getPageUrl("fr", "agde/<slug>")`.
- `openGraph.url = canonical`, `openGraph.type = "article"`, `openGraph.locale` mappe par table
  `OG_LOCALE` (`fr_FR/en_US/it_IT/es_ES/de_DE`) au lieu du code de locale brut.
- JSON-LD `BreadcrumbList` : `name` traduits via `breadcrumb_home` / `breadcrumb_region` / `breadcrumb_current`
  (les JSON-LD `Restaurant` et `TouristAttraction` restent en FR — hors perimetre de la tache).
- Corps de page : tous les textes (`h1`, `hero_subtitle`, sections `s1`-`s5`, blocs `practical_*`, `cta_*`,
  `also_*`) et les `alt` d'images passent par `t("<slug>.<cle>")`.
- Liens inline (rich text) : `t.rich("<slug>.<cle>", { link: chunks => <Link href=...>{chunks}</Link> })`
  pour les 4 paragraphes avec balise `<link>` (voir docs/seo-agde-i18n.md).
- Conserves : `revalidate = 3600`, `setRequestLocale(locale)`, imports `Image`/`Link`, structure visuelle,
  classes Tailwind `brand-*`.

## Details par page

- **promenade** : liens rich text dans `s5_p1` (→ cathedrale) et `s5_p3` (→ musee). Bloc pratique a plat
  (`practical_address/phone/hours/access`).
- **cathedrale-saint-etienne** : section 4 = 3 etapes (`s4_step1..3_label/title/text`). Bloc pratique avec
  `practical_advice_label/advice`.
- **musee-agathois** : section 4 = itineraire texte (`s4_p1..p3`), liens rich text dans `s4_p2` (→ cathedrale)
  et `s4_p3` (→ promenade). Bloc pratique = 2 cartes (`practical_divino_*`, `practical_musee_*`).
- **chateau-laurens** : section 4 = 3 etapes (`s4_step1..3_label/title/text`). Bloc pratique avec
  `practical_advice_label/advice`.

## Verification

- `npx tsc --noEmit` : 0 erreur sur les 4 fichiers modifies (et sur l'ensemble du projet).
- Aucune classe Tailwind, aucun import, aucune structure de section modifies — seul le contenu textuel
  et les metadonnees sont desormais pilotes par i18n.
