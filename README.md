# Denat Life V20.1 — Sport, nutrition & équilibre

Denat Life est une PWA personnelle et familiale installable sur iPhone. Elle réunit le suivi sportif de Jocelyn, le quotidien repas d’Anaïs et les fonctions partagées du foyer.

## V20.1
- Suppression sécurisée dans la timeline avec annulation pendant 6 secondes
- Restauration fidèle des repas, signaux d’équilibre et séances supprimés par erreur
- Saisie antidatée améliorée : `le 24/09`, `le 24/09/2026`, `il y a 3 jours`
- Protection contre la confusion entre une note comme `Énergie 8/10` et une date

## V20
- Deux profils personnels : Jocelyn et Anaïs
- Données sport, journal alimentaire et équilibre séparées par profil
- Menu, recettes, courses et organisation du foyer partagés
- Timeline quotidienne avec saisie naturelle et antidatée
- Repas : journal, estimation kcal/protéines, menus, recettes et courses
- Sport : séances, séries, répétitions, charges, RPE, historique et progression
- Équilibre : poids, sommeil et énergie du jour
- Exemples de saisie : `Poids 82,4 kg`, `J’ai dormi 7h30`, `Énergie 8/10`
- Synchronisation Denat Life Cloud avec cache hors ligne
- Protection des modifications hors ligne à travers les redémarrages
- Fonctionnement installable en PWA et cache Service Worker

## Profils
### Jocelyn
Priorité à la musculation, la progression, la récupération et la nutrition.

### Anaïs
Priorité aux repas, aux courses et au quotidien. Le sport reste disponible sans objectif imposé.

## Foyer partagé
Les menus, recettes, courses et éléments d’organisation communs restent partagés entre les deux profils.

## Apple Santé
Une PWA Safari n’accède pas directement à HealthKit. Denat Life prévoit un pont via le backend Denat Life / Raccourcis Apple pour recevoir des données de santé lorsque cette intégration est configurée.

## Publication
La branche `main` alimente GitHub Pages :
- Application : https://louiseverlainechambery.github.io/forgefit/
- Sport : /forgefit/sport/
- Repas : /forgefit/repas/

## Principe de développement
Les évolutions doivent rester rétrocompatibles avec les données existantes. Les nouvelles données personnelles utilisent des clés par profil et les données du foyer restent communes.
