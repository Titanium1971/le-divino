# Fix SEO / i18n — pages légales Le Divino

Date : 2026-07-01
Périmètre : les 3 pages légales du groupe B de `docs/seo-i18n-audit.md`.
Objectif : émettre une **canonical auto-référente** (bon préfixe de locale) + `alternates.languages` **hreflang** (5 locales + `x-default`) + `openGraph.url`.
Contrainte respectée : **seul `generateMetadata` modifié**, corps de page inchangé (contenu déjà traduit via `getTranslations`).

## Méthode

Réutilisation du patron de `src/lib/seo/metadata.ts` (`generatePageMetadata`) :

```ts
import { LOCALES, DEFAULT_LOCALE, getPageUrl } from "@/lib/seo/constants";

const canonical = getPageUrl(locale, "<path>");
const languages: Record<string, string> = {};
for (const loc of LOCALES) {
  languages[loc] = getPageUrl(loc, "<path>");
}
languages["x-default"] = getPageUrl(DEFAULT_LOCALE, "<path>");

return {
  title: t("seo_title"),
  description: t("seo_description"),
  alternates: { canonical, languages },
  openGraph: { url: canonical },
};
```

`getPageUrl` gère le préfixe de locale (`fr` sans préfixe, autres → `/{loc}`), donc canonical et hreflang sont corrects par locale.

## Fichiers traités

| Fichier | `<path>` | Namespace | Cohérence `PUBLIC_PAGES` |
|---|---|---|---|
| `src/app/[locale]/(public)/mentions-legales/page.tsx` | `mentions-legales` | `legal` | ✅ ligne 130 |
| `src/app/[locale]/(public)/politique-confidentialite/page.tsx` | `politique-confidentialite` | `privacy` | ✅ ligne 131 |
| `src/app/[locale]/(public)/politique-cookies/page.tsx` | `politique-cookies` | `cookies` | ✅ ligne 132 |

Les 3 `<path>` matchent exactement les entrées de `PUBLIC_PAGES` dans `src/lib/seo/constants.ts`.

## Diffs résumés (identiques pour les 3 fichiers)

1. **Import ajouté** : `import { LOCALES, DEFAULT_LOCALE, getPageUrl } from "@/lib/seo/constants";`
2. **Dans `generateMetadata`** : calcul de `canonical` + boucle `languages` (5 locales) + `x-default`.
3. **Objet retourné** : ajout de
   - `alternates: { canonical, languages }`
   - `openGraph: { url: canonical }`

`title` / `description` traduits (`seo_title` / `seo_description`) conservés à l'identique. Corps de page (H1, sections, tables, JSON, nav RGPD) non touché.

## Vérification

- `npx tsc --noEmit` → **0 erreur**.
- Résultat : les 3 pages émettent désormais canonical auto-référente + hreflang 5 locales + `x-default` + `og:url`, au même niveau que les 12 pages conformes via `generatePageMetadata`.

## Reste hors périmètre (voir audit)

- Groupe A — 4 pages `/agde/*` : hreflang absent **et** contenu FR en dur (nécessite namespace `agde` + refonte, non traité ici).
- `/reservation/merci` : candidate à `robots: noindex`.
