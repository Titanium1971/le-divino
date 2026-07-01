# SEO / i18n — namespace `agde` (lot 3 : contenu)

Date : 2026-07-01
Périmètre : extraction + traduction du contenu des 4 pages touristiques `/agde/*`
(`promenade`, `cathedrale-saint-etienne`, `musee-agathois`, `chateau-laurens`).

> **Ce lot ne modifie AUCUNE `page.tsx`.** Il ne fait qu'ajouter le namespace `agde`
> dans les 5 fichiers de messages. Le branchement des pages sur ces clés = **lot 4**.

## Ce qui a été fait

- Création d'un namespace `agde` dans `src/messages/fr.json` (source FR fidèle au
  texte codé en dur dans les `page.tsx`, **accents restaurés** pour cohérence avec les
  namespaces existants comme `landing`).
- Traduction complète du namespace en **EN, IT, ES, DE** → ajouté dans
  `en.json`, `it.json`, `es.json`, `de.json`.
- **Iso-structure garantie** : les 5 fichiers ont exactement la même arborescence de
  clés sous `agde` (vérifié par script — 211 feuilles par langue, arbres identiques).
- JSON revalidé sur les 5 fichiers. Chaque fichier passe de 20 → **21 clés de 1er niveau**.

## Arborescence des clés ajoutées

```
agde
├── promenade   (56 clés)
├── cathedrale  (53 clés)
├── musee       (49 clés)
└── chateau     (53 clés)
```

### Clés communes à chaque page
| Clé | Rôle | Source dans le page.tsx |
|---|---|---|
| `seo_title` | `<title>` / metadata.title | `generateMetadata().title` |
| `seo_description` | meta description | `generateMetadata().description` |
| `seo_keywords` | meta keywords | `generateMetadata().keywords` |
| `og_title` | Open Graph title | `openGraph.title` |
| `og_description` | Open Graph description | `openGraph.description` |
| `og_image_alt` | alt de l'image OG | `openGraph.images[0].alt` |
| `breadcrumb_home` | libellé « Accueil » du fil d'Ariane | `<nav>` hero |
| `breadcrumb_region` | libellé « Agde » | `<nav>` hero |
| `breadcrumb_current` | libellé de la page courante | `<nav>` hero |
| `hero_alt` | alt de l'image hero | `<Image>` hero |
| `h1` | titre H1 | hero |
| `hero_subtitle` | sous-titre hero | hero |
| `s1_title` … `s3_p3` | titres + paragraphes des sections 1-3 | corps |
| `s2_image_alt`, `s3_image_alt` | alt des visuels de section | `<Image>` |
| `practical_*` | bloc « Informations pratiques » (labels + valeurs) | section infos |
| `cta_title`, `cta_text`, `cta_button`, `cta_phone` | bloc réservation | section CTA |
| `also_title` + `also_*` | bloc « Découvrez aussi à Agde » (libellés de liens) | section liens |

### Clés spécifiques par page
- **promenade** : section 4 = 4 cartes (`s4_card1_title/text` … `s4_card4_title/text`) ;
  section 5 = itinéraire (`s5_title`, `s5_p1..p3`) ; infos pratiques à plat
  (`practical_address_label/address`, `practical_phone_label`, `practical_hours_label/hours`,
  `practical_access_label/access`).
- **cathedrale** & **chateau** : section 4 = 3 étapes
  (`s4_step1_label/title/text` … `s4_step3_*`) ; infos pratiques à plat avec
  `practical_advice_label/advice` (Conseil).
- **musee** : section 4 = itinéraire (`s4_p1..p3`) ; infos pratiques = **2 cartes**
  (`practical_divino_*` et `practical_musee_*`).

## Rich-text : liens inline dans les paragraphes

4 paragraphes contiennent un lien interne. Le texte du lien est balisé avec la
balise next-intl **`<link>…</link>`** (à consommer via `t.rich(..., { link: chunks => <Link href=...>{chunks}</Link> })` au lot 4).

| Clé | Cible du lien (`href`) |
|---|---|
| `agde.promenade.s5_p1` | `/agde/cathedrale-saint-etienne` |
| `agde.promenade.s5_p3` | `/agde/musee-agathois` |
| `agde.musee.s4_p2` | `/agde/cathedrale-saint-etienne` |
| `agde.musee.s4_p3` | `/agde/promenade` |

Ces 4 clés portent la balise `<link>` **dans les 5 langues** (parité vérifiée par script).

## Conventions de traduction

- Noms propres non traduits : `Le Divino`, `place Jean Jaurès`, `Grau d'Agde`,
  `Château Laurens`, `Hérault`, `Languedoc`, `rue de la Fraternité`.
- Toponymes/monuments traduits ou adaptés selon la langue : ex. « Musée Agathois » →
  *Agathois Museum* (EN), *Museo Agatese* (IT), *Museo Agatense* (ES), *Musée Agathois* (DE) ;
  « cathédrale Saint-Étienne » → *Saint-Étienne Cathedral*, etc.
- Téléphone `04 48 17 78 75` conservé tel quel dans `cta_phone`.
- Horaires localisés (format 12h EN, 24h/`Uhr` DE, etc.).

## Confirmation finale

- ✅ 5 langues **complètes** (FR, EN, IT, ES, DE) — aucune clé manquante.
- ✅ **Iso-structure** : arbres de clés strictement identiques (211 feuilles/langue).
- ✅ JSON **valide** sur les 5 fichiers.
- ✅ Balises `<link>` présentes sur les mêmes clés dans les 5 langues.
- ✅ Aucune `page.tsx` modifiée (branchement = lot 4).
