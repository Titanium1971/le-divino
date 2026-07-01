# Rapport final — Remédiation SEO/i18n Le Divino

Date : 2026-07-01
Périmètre : 20 pages publiques `src/app/[locale]/(public)/**`, Next.js 15 + next-intl (5 locales : fr, en, it, es, de ; `fr` = defaultLocale, `localePrefix: "as-needed"`).

## 1. Problème initial

**37 pages non indexées** par Google Search Console. Cause racine identifiée dans `docs/seo-i18n-audit.md` : deux mécanismes de metadata coexistaient dans le code.

- 12 pages utilisaient le helper central `generatePageMetadata` (`src/lib/seo/metadata.ts`) → canonical auto-référente + hreflang (5 langues + x-default) émis correctement.
- **7 pages** contournaient ce helper avec un `generateMetadata` custom, hors périmètre du `PageKey` union :
  - **Groupe A — 4 pages `/agde/*`** (promenade, cathédrale, musée, château) : canonical calculée à la main mais **hreflang totalement absent**, et **contenu 100% en dur en français** (aucun `getTranslations`) → mêmes URLs servaient du FR quelle que soit la locale.
  - **Groupe B — 3 pages légales** (mentions-légales, confidentialité, cookies) : contenu déjà traduit via `getTranslations`, mais **ni canonical ni hreflang** émis du tout.
- 1 page (`/reservation/merci`) sans metadata — hors scope, candidate à `noindex` (non traitée dans cette remédiation).

Conséquence Google : pages dupliquées sans signal de langue (hreflang manquant) + contenu non localisé → non-indexation en masse des variantes de langue.

## 2. Corrections apportées

### Groupe B — 3 pages légales (lot 2)
`mentions-legales`, `politique-confidentialite`, `politique-cookies` : ajout dans `generateMetadata` de `alternates.canonical` (via `getPageUrl`), `alternates.languages` (boucle sur `LOCALES` + `x-default`), et `openGraph.url`. Corps de page et traductions existantes non touchés.

### Groupe A — 4 pages `/agde/*` (lots 3 + 4)
- **Lot 3** : création du namespace `agde` dans les 5 fichiers `src/messages/*.json` — extraction fidèle du texte FR en dur puis traduction complète EN/IT/ES/DE (211 clés/langue, 4 sous-namespaces `promenade`/`cathedrale`/`musee`/`chateau`), y compris balises rich-text `<link>` pour les 4 paragraphes avec lien interne.
- **Lot 4** : branchement des 4 `page.tsx` sur ce namespace — `generateMetadata` migré vers `getTranslations`, `alternates.canonical` + `alternates.languages` (5 locales + x-default) ajoutés selon le même patron que le helper central, `openGraph.locale` mappé par table (`fr_FR/en_US/it_IT/es_ES/de_DE`) au lieu d'être figé en `fr_FR`. Corps de page (h1, sections, blocs pratiques, CTA, JSON-LD BreadcrumbList) intégralement piloté par i18n.

## 3. Résultat des vérifications

| Contrôle | Résultat |
|---|---|
| `npx tsc --noEmit` | **0 erreur** sur l'ensemble du projet |
| 5 fichiers `src/messages/*.json` | **JSON valide** (parse OK) sur les 5 |
| Namespace `agde` iso-structure | **211 clés identiques**, 0 manquante / 0 en trop, sur en/it/es/de vs fr |
| 7 pages corrigées — `alternates.canonical` | ✅ auto-référente via `getPageUrl(locale, path)`, respecte `as-needed` (pas de `/fr`) |
| 7 pages corrigées — `alternates.languages` | ✅ 5 locales + `x-default` sur les 7 |
| 7 pages corrigées — title/description | ✅ via `getTranslations`, distincts par langue |
| `src/app/sitemap.ts` | ✅ intact, couvre toujours les 19 `PUBLIC_PAGES` (dont les 4 `agde/*` et 3 légales) via boucle `LOCALES` + hreflang alternates |

Aucune régression détectée. Aucune erreur de type introduite par les lots 2 à 4.

## 4. Actions manuelles restantes (Cyril)

1. **Commit + déploiement Vercel** des changements (`src/messages/*.json`, 7 `page.tsx`).
2. **Search Console → Inspection URL → "Demander une indexation"** pour les pages FR importantes (accueil `/agde/*`, légales) une fois déployé.
3. Laisser **Google recrawler** — le `noindex` résiduel éventuel sur `/es` `/it` etc. (lié à l'absence antérieure de hreflang) se nettoiera seul une fois les signaux corrects en place.
4. **Délai d'effet attendu : ~1 à 3 semaines** avant de voir l'impact sur l'indexation dans Search Console.

---

## Récapitulatif

- **37 pages non indexées** → cause racine : 7 pages hors du helper SEO central, hreflang absent (4 pages agde) et/ou canonical absent (3 pages légales), contenu agde 100% FR en dur.
- **Corrigé** : légales → `alternates` complet ajouté ; agde/* → namespace i18n `agde` créé (211 clés × 5 langues) + pages branchées, canonical + hreflang + contenu traduit.
- **Vérifications** : tsc 0 erreur, JSON valide et iso-structure sur les 5 langues, canonical/hreflang/traductions confirmés sur les 7 pages, sitemap non régressé.
- **Reste à faire** : commit, déployer sur Vercel, demander réindexation Search Console pour les pages FR clés, patienter 1-3 semaines.
