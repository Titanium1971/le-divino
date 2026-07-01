# Audit SEO / i18n — pages publiques Le Divino

Date : 2026-07-01
Périmètre : `src/app/[locale]/(public)/**/page.tsx` (20 pages)
Contexte : Next.js 15 App Router + next-intl. Locales `["fr","en","it","es","de"]`, `defaultLocale "fr"`, `localePrefix "as-needed"` (FR sans préfixe).
Helper central : `src/lib/seo/metadata.ts` → `generatePageMetadata` pose canonical auto-référente **et** `alternates.languages` (hreflang : 5 locales + `x-default`).

> **Audit uniquement — aucun fichier de code applicatif modifié.**

## Légende
- **OK** = utilise `generatePageMetadata` (canonical + hreflang complets, contenu traduit).
- **⚠️** = metadata custom, incomplet ou contenu non traduit.
- **canonical** : (a) `alternates.canonical` émis ? — **hreflang** : (b) `alternates.languages` émis ?

## Tableau récapitulatif

| Page (route) | Metadata | canonical (a) | hreflang (b) | Contenu traduit ? | Statut |
|---|---|---|---|---|---|
| `/` (home) | `generatePageMetadata("home")` | ✅ auto | ✅ 5+x-default | ✅ `getTranslations("home"/"seo")` | **OK** |
| `/menu` | `generatePageMetadata("menu")` | ✅ | ✅ | ✅ `menu` | **OK** |
| `/menus` | `generatePageMetadata("menus")` | ✅ | ✅ | ✅ `menus` | **OK** |
| `/vins` | `generatePageMetadata("vins")` | ✅ | ✅ | ✅ `wines` | **OK** |
| `/boissons` | `generatePageMetadata("boissons")` | ✅ | ✅ | ✅ `drinks` | **OK** |
| `/reservation` | `generatePageMetadata("reservation")` | ✅ | ✅ | ✅ `reservation` | **OK** |
| `/galerie` | `generatePageMetadata("gallery")` | ✅ | ✅ | ✅ `gallery` | **OK** |
| `/evenements` | `generatePageMetadata("events")` | ✅ | ✅ | ✅ `events` | **OK** |
| `/contact` | `generatePageMetadata("contact")` | ✅ | ✅ | ✅ `contact` | **OK** |
| `/restaurant-agde` | `generatePageMetadata("restaurant-agde")` | ✅ | ✅ | ✅ `landing.restaurant-agde` | **OK** |
| `/restaurant-terrasse-agde` | `generatePageMetadata("restaurant-terrasse-agde")` | ✅ | ✅ | ✅ `landing.restaurant-terrasse-agde` | **OK** |
| `/restaurant-cap-agde` | `generatePageMetadata("restaurant-cap-agde")` | ✅ | ✅ | ✅ `landing.restaurant-cap-agde` | **OK** |
| `/agde/promenade` | **custom** `generateMetadata` | ✅ (calc. manuel) | ❌ **absent** | ❌ **FR en dur** (title/desc/corps) | **⚠️ PROBLÈME** |
| `/agde/cathedrale-saint-etienne` | **custom** `generateMetadata` | ✅ (calc. manuel) | ❌ **absent** | ❌ **FR en dur** | **⚠️ PROBLÈME** |
| `/agde/musee-agathois` | **custom** `generateMetadata` | ✅ (calc. manuel) | ❌ **absent** | ❌ **FR en dur** | **⚠️ PROBLÈME** |
| `/agde/chateau-laurens` | **custom** `generateMetadata` | ✅ (calc. manuel) | ❌ **absent** | ❌ **FR en dur** | **⚠️ PROBLÈME** |
| `/mentions-legales` | **custom** `generateMetadata` | ❌ **absent** | ❌ **absent** | ✅ `getTranslations("legal")` | **⚠️ PROBLÈME** |
| `/politique-confidentialite` | **custom** `generateMetadata` | ❌ **absent** | ❌ **absent** | ✅ `getTranslations("privacy")` | **⚠️ PROBLÈME** |
| `/politique-cookies` | **custom** `generateMetadata` | ❌ **absent** | ❌ **absent** | ✅ `getTranslations("cookies")` | **⚠️ PROBLÈME** |
| `/reservation/merci` | **aucun** `generateMetadata` | ❌ absent | ❌ absent | — | **⚠️ (voir note)** |

## Pages problématiques — détail

### Groupe A — pages `/agde/*` (4 pages)
`promenade`, `cathedrale-saint-etienne`, `musee-agathois`, `chateau-laurens`.

Toutes suivent le même patron (vérifié sur `/agde/promenade`) :
- `generateMetadata` **custom**, canonical calculée à la main :
  `` `${SITE_URL}${locale === "fr" ? "" : `/${locale}`}/agde/<slug>` ``.
- **`alternates.languages` (hreflang) absent** → aucune balise `hreflang` émise. Google ne voit pas les variantes de langue de ces URLs.
- `openGraph.locale` figé en `"fr_FR"`.
- **Contenu 100 % en dur en français** : `title`, `description`, `keywords`, corps (H1, H2, paragraphes, cartes, JSON-LD, fil d'Ariane). Aucun `getTranslations`. `setRequestLocale(locale)` appelé mais inexploité côté contenu.
- Conséquence : mêmes URLs servent du FR quelle que soit la locale ; pas de signal hreflang ; contenu non localisable.

### Groupe B — pages légales (3 pages)
`mentions-legales`, `politique-confidentialite`, `politique-cookies`.

- `generateMetadata` custom émettant **seulement** `title` + `description` (via `getTranslations` namespaces `legal` / `privacy` / `cookies`).
- **Ni `alternates.canonical` ni `alternates.languages`** → pas de canonical auto-référente, pas de hreflang.
- Bon point : le **contenu est déjà traduit** (`getTranslations`), donc seul le bloc `alternates` manque.

### Note — `/reservation/merci`
Aucun `generateMetadata`. Page de confirmation post-réservation : candidate à `robots: noindex` plutôt qu'à canonical/hreflang. À trancher, hors scope strict de la demande.

## Cause racine
Deux mécanismes de metadata coexistent :
1. **`generatePageMetadata`** (helper central) — pose canonical + hreflang automatiquement. 12 pages l'utilisent → conformes.
2. **`generateMetadata` custom** — 7 pages (+ 1 sans metadata) contournent le helper et perdent le hreflang (groupes A+B) et/ou la canonical (groupe B).

Le helper `generatePageMetadata` ne couvre aujourd'hui que les `PageKey` du type union (`home`, `menu`, `menus`, `vins`, `boissons`, `reservation`, `gallery`, `events`, `contact`, `restaurant-agde`, `restaurant-terrasse-agde`, `restaurant-cap-agde`). Les routes `/agde/*` et légales n'y figurent pas → d'où le contournement.

## Inventaire des namespaces `src/messages/fr.json` (clés de 1er niveau)
```
contact
cookies
drinks
events
footer
gallery
home
landing
legal
menu
menus
metadata
nav
privacy
qr
reservation
reviews
seo
widget
wines
```

Observations pour préparer l'ajout d'un namespace de traduction :
- **`seo`** : contient les `title`/`description`/`keywords` consommés par `generatePageMetadata` (clés par `PageKey`).
- **`legal` / `privacy` / `cookies`** : déjà présents et utilisés par les 3 pages légales (contenu OK, manque seulement `alternates`).
- **`landing`** : regroupe les 3 landings `restaurant-*` déjà conformes → modèle à suivre pour de nouvelles landings.
- **Aucun namespace `agde`** (ni sous-clés dans `landing`/`seo`) pour les 4 pages touristiques → **c'est le namespace à créer** pour porter titres, descriptions, keywords et corps de `/agde/*`.
