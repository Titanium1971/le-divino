# Guide d'administration — Le Divino

## Accès au panneau d'administration

**URL :** https://www.ledivino-agde.fr/admin

Connectez-vous avec vos identifiants email/mot de passe. Après connexion, vous accédez au tableau de bord.

---

## 1. Dashboard (Tableau de bord)

Le Dashboard est la page d'accueil de l'administration. Il affiche en temps réel :

- **Réservations du jour** : nombre total, en attente, confirmées, nombre de couverts
- **Réservations de la semaine** : total, tendance par rapport à la semaine précédente
- **Taux de confirmation / annulation / no-show**
- **Répartition midi / soir** sur la semaine
- **Créneau le plus demandé**
- **Prochaines réservations** du jour et de la semaine
- **Prochains événements**
- **Graphique comparatif** semaine en cours vs semaine précédente

---

## 2. Plats (La Carte)

### Consulter les plats
La liste affiche tous les plats avec leur nom, catégorie, prix et disponibilité. Vous pouvez filtrer par catégorie (Entrées, Plats, Desserts).

### Ajouter un plat
Cliquez sur "Ajouter un plat". Remplissez :
- **Nom** (français obligatoire, + anglais, italien, espagnol, allemand)
- **Description** (français obligatoire, les autres langues peuvent être générées automatiquement)
- **Catégorie** : Entrée, Plat ou Dessert
- **Source** : La Carte (permanente) ou Menu du Marché (plats du jour)
- **Prix** en euros
- **Disponibilité** : activé/désactivé

### Générer du contenu IA
- **Générer la description** : cliquez sur le bouton IA pour générer une description appétissante
- **Traduire automatiquement** : traduit le français vers les 4 autres langues
- **Générer une image** : crée une photo du plat par intelligence artificielle

### Modifier / Supprimer
Cliquez sur un plat pour le modifier. Le bouton "Supprimer" est disponible dans le formulaire d'édition (avec confirmation).

---

## 3. Menus (Formules)

### Consulter les formules
Affiche les formules actives avec leur type, prix et nombre de plats associés.

### Ajouter une formule
Cliquez sur "Ajouter un menu". Remplissez :
- **Nom** (multilingue)
- **Type** : Entrée + Plat, Plat + Dessert, Entrée + Plat + Dessert
- **Description** (multilingue)
- **Prix**
- **Actif** : oui/non

### Associer des plats
Après création, vous pouvez associer des plats à la formule. Seuls les plats disponibles sont proposés.

---

## 4. Vins

### Consulter la carte des vins
La liste affiche tous les vins avec leur nom, couleur, prix bouteille/verre et disponibilité. Filtrez par couleur (Rouge, Blanc, Rosé, Pétillant).

### Ajouter un vin
Cliquez sur "Ajouter un vin". Remplissez :
- **Nom**
- **Région** et **Appellation**
- **Couleur** : Rouge, Blanc, Rosé, Pétillant
- **Millésime** (année)
- **Cépage**
- **Degré d'alcool**
- **Style** (description courte)
- **Prix bouteille** et **Prix au verre**
- **Description** (multilingue)
- **Image**

### Fonctionnalités IA
- Génération de descriptions de sommelier
- Traduction automatique
- Génération d'image

---

## 5. Boissons

### Consulter les boissons
Filtrez par catégorie : Softs, Cocktails, Bières Pression, Bières Bouteille, Spiritueux, Boissons Chaudes, Autres.

### Ajouter une boisson
- **Nom** (multilingue)
- **Catégorie**
- **Prix** (standard ou multiple selon le format : Galopin, 25cl, 50cl, 1L pour les bières pression)
- **Description** (multilingue)
- **Image**
- **Disponibilité**

---

## 6. Réservations

### Consulter les réservations
Trois modes d'affichage :
- **Liste** : toutes les réservations avec filtres par statut et date
- **Semaine** : vue calendrier hebdomadaire
- **Jour** : vue détaillée d'une journée

### Statuts des réservations
- **En attente** (orange) : le client a réservé mais n'a pas confirmé par email
- **Confirmée** (vert) : le client a cliqué sur le lien de confirmation dans l'email
- **Annulée** (rouge) : annulée par le client ou le restaurant
- **Terminée** (gris) : la visite a eu lieu
- **No-show** (gris foncé) : le client n'est pas venu

### Changer le statut
Cliquez sur une réservation pour ouvrir le détail. Utilisez le menu déroulant pour changer le statut.

### Créer une réservation manuellement
Cliquez sur "Nouvelle réservation" et remplissez : nom, email, téléphone, date, heure, nombre de convives, message optionnel.

### Supprimer une réservation
Dans le détail de la réservation, cliquez sur "Supprimer" (avec confirmation).

---

## 7. Clients

### Consulter les clients
La liste affiche tous les clients ayant interagi avec le site (réservation ou chatbot). Recherchez par nom, email ou téléphone.

### Informations affichées par client
- **Nom complet**, email, téléphone
- **Nombre de visites** et date de dernière visite
- **Langue préférée**
- **Date d'inscription** (première interaction)
- **Allergies** connues (badges rouges)
- **Préférences alimentaires** (badges bleus)
- **Notes sur les goûts** (résumé IA)

### Historique des réservations
En cliquant sur un client, son historique complet de réservations s'affiche avec :
- Date et heure de chaque réservation
- Nombre de convives
- Statut (confirmée, annulée, etc.)
- Message éventuel

### Alimentation automatique
La base clients se remplit automatiquement à chaque nouvelle réservation (via le formulaire du site ou le chatbot).

---

## 8. Événements

### Consulter les événements
La liste affiche les événements à venir et passés, avec badges de type colorés.

### Ajouter un événement
- **Titre** (multilingue)
- **Description** (multilingue)
- **Type** : Karaoké, Concert, Soirée privée, Jour férié, Animation, Autre
- **Date**
- **Heure de début** et **Heure de fin**
- **Image**

### Options de visibilité
- **Mis en avant** : affiché en premier sur le site
- **Afficher sur l'écran** : envoyé à l'écran 55"
- **Actif** : visible sur le site

### Fonctionnalités IA
- Génération de contenu (titre + description)
- Traduction automatique
- Génération d'image
- Création d'affiche (lien vers le module Affiches)

---

## 9. FAQ

### Consulter les FAQ
Liste des questions/réponses classées par ordre.

### Ajouter une FAQ
- **Question** (français obligatoire + 4 langues)
- **Réponse** (français obligatoire + 4 langues)
- **Ordre d'affichage**
- **Publié** : oui/non (brouillon ou visible sur le site)

### Traduction automatique
Les FAQ peuvent être traduites automatiquement vers les 4 langues.

**Important :** Les FAQ sont aussi utilisées par le chatbot comme base de connaissances. Ajoutez-y les questions récurrentes de vos clients.

---

## 10. Affiches IA

### Créer une affiche
1. **Choisir un template** parmi les modèles disponibles (soirée DJ, karaoké, concert, brunch, happy hour, etc.)
2. **Configurer** les variables (nom de l'événement, date, heure, artiste, etc.)
3. **Choisir l'orientation** : Portrait (9:16) ou Paysage (16:9)
4. **Choisir la police**
5. **Générer** : l'IA crée l'image de fond et le texte est superposé

### Actions sur une affiche
- **Télécharger** en PNG
- **Envoyer vers l'écran 55"** (push direct)
- **Marquer comme favori**
- **Supprimer**

### Filtrer
Filtrez par favoris pour retrouver vos meilleures créations.

---

## 11. Galerie

### Consulter la galerie
Affiche toutes les photos avec filtrage par tag : Restaurant, Plats, Événements, Équipe, Ambiance.

### Ajouter des photos
- **Glissez-déposez** des images ou cliquez pour parcourir
- Formats acceptés : JPG, PNG, WebP, GIF
- **Upload multiple** possible

### Gérer les photos
Pour chaque photo :
- **Tag** : assignez une catégorie
- **Légende** (multilingue)
- **Ordre** : déplacez vers le haut/bas
- **Publié** : visible ou masqué sur le site
- **Supprimer**

---

## 12. Écran 55"

### Principe
L'écran 55" du restaurant affiche un diaporama de slides en rotation automatique (8 secondes par slide).

### Consulter les slides
Liste des slides actives avec leur type et leur ordre.

### Types de slides
- **Affiche** : une affiche générée par le module Affiches
- **Image** : une photo simple
- **Texte** : un message personnalisé
- **Événement** : promotion d'un événement
- **Menu** : affichage d'une formule
- **Galerie** : rotation de photos
- **Plat du jour** : mise en avant d'un plat
- **QR Code** : affichage du QR code du menu

### Gérer les slides
- **Activer/Désactiver** chaque slide
- **Réordonner** (haut/bas)
- **Supprimer**
- **Aperçu** : voir le diaporama en temps réel

### Envoyer une affiche vers l'écran
Depuis le module Affiches, cliquez sur "Envoyer vers l'écran" pour créer automatiquement un slide avec l'affiche.

---

## 13. Paramètres

### Informations du restaurant
- Nom, adresse, téléphone, email, site web
- Liens réseaux sociaux (Instagram, Facebook, TripAdvisor, Google)

### Horaires d'ouverture
Configurez les horaires pour chaque jour de la semaine :
- Sélectionnez l'heure d'ouverture et de fermeture (par tranches de 30 minutes)
- Chaque jour peut être ouvert ou fermé

### Code PIN
Code PIN pour accéder au mode service (écran, etc.)

### QR Code
- Générez et téléchargez le QR code du menu digital
- Formats disponibles : SVG, PNG, PDF (7x7cm, 10x10cm, A4)

---

## 14. Congés (Fermetures exceptionnelles)

### Activer une fermeture
1. Activez le mode congés
2. Renseignez la **date de début** et la **date de fin**
3. Écrivez le **message** affiché sur le site (multilingue)

### Effet
- Un bandeau s'affiche sur le site pour informer les visiteurs
- Le chatbot prend en compte la fermeture et refuse les réservations pendant cette période
- Les réservations en ligne sont bloquées pour les dates concernées

### Désactiver
Désactivez simplement le toggle pour retirer le bandeau et réouvrir les réservations.

---

## 15. Activité (Journal d'audit)

### Consulter l'historique
Le journal enregistre automatiquement toutes les actions effectuées dans l'administration :
- **Création** d'un plat, vin, événement, réservation, etc.
- **Modification** avec le détail des champs modifiés
- **Suppression**

### Filtrer
- Par **utilisateur** (email de l'administrateur)
- Par **type d'entité** (plat, boisson, vin, événement, menu, réservation, etc.)

### Informations par entrée
- Qui a fait l'action
- Quelle action (créer, modifier, supprimer)
- Sur quel élément
- Quand (horodatage)
- Détails des changements

---

## 16. Chatbot Concierge (fonctionnement automatique)

Le chatbot est actif sur le site public. Il fonctionne de manière autonome mais utilise les données que vous gérez dans l'administration.

### Ce que le chatbot utilise
- **Plats** : recommande les plats disponibles avec les prix exacts
- **Vins** : conseille des accords mets-vins
- **Boissons** : présente la carte des boissons
- **Événements** : informe des événements à venir
- **Horaires** : communique les heures d'ouverture
- **FAQ** : répond aux questions fréquentes
- **Congés** : informe des fermetures exceptionnelles
- **Avis Google** : partage la note et les meilleurs avis

### Ce que le chatbot fait automatiquement
- Identifie les clients par prénom/nom et email
- Prend des réservations (avec emails de confirmation + alerte WhatsApp)
- Modifie des réservations (annulation automatique + recréation)
- Annule des réservations (avec email d'annulation)
- Mémorise les préférences et allergies des clients
- Répond en 5 langues (français, anglais, italien, espagnol, allemand)

### Impact de vos actions sur le chatbot
- Si vous **désactivez un plat**, le chatbot ne le recommandera plus
- Si vous **ajoutez un événement**, le chatbot le mentionnera
- Si vous **modifiez les horaires**, le chatbot utilisera les nouveaux
- Si vous **activez les congés**, le chatbot refusera les réservations
- Si vous **ajoutez une FAQ**, le chatbot l'utilisera pour répondre

---

## Notifications automatiques

### Lors d'une réservation (site ou chatbot)
- **Email au client** : confirmation avec bouton pour valider
- **Email au propriétaire** : alerte avec détails
- **WhatsApp au propriétaire** : notification instantanée

### Lors d'une annulation
- **Email au client** : confirmation d'annulation
- **Email au propriétaire** : alerte annulation
- **WhatsApp au propriétaire** : notification

### Lors d'une modification
- **Email au client** : annulation de l'ancienne + confirmation de la nouvelle
- **Email au propriétaire** : alerte modification
- **WhatsApp au propriétaire** : notification

---

## Bonnes pratiques

1. **Mettez à jour les plats régulièrement** — le chatbot ne recommande que ce qui est disponible
2. **Ajoutez des descriptions en français** — les traductions sont générées automatiquement
3. **Publiez les FAQ importantes** — le chatbot les utilise pour répondre aux questions
4. **Vérifiez les réservations chaque matin** — passez les "terminées" et les "no-show"
5. **Créez les événements à l'avance** — le chatbot les mentionne lors des réservations
6. **Activez les congés avant de partir** — le bandeau et le chatbot informent automatiquement
7. **Consultez la page Clients** — suivez vos clients fidèles et leurs préférences
