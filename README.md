# ForgeFit V2 — PWA iPhone

ForgeFit V2 est une application de musculation installable sur l’écran d’accueil d’un iPhone depuis Safari.

## Ce qui est inclus
- Programme Push / Pull / Jambes modifiable
- Création de séances et exercices personnalisés
- Suivi charge, répétitions et RPE
- Chronomètre de repos automatique
- Historique détaillé
- Volume d’entraînement
- Estimation 1RM et graphiques de progression
- Suggestion de charge basée sur la séance précédente et le RPE
- Export/import JSON
- Fonctionnement hors ligne après la première ouverture
- Interface 100 % française

## Installation sur iPhone
Une PWA doit être ouverte depuis une adresse HTTPS. Il faut donc déposer ce dossier sur un hébergement statique (GitHub Pages, Netlify, Cloudflare Pages, etc.).

Ensuite sur iPhone :
1. Ouvrir l’adresse de ForgeFit dans Safari.
2. Toucher Partager.
3. Choisir « Sur l’écran d’accueil ».
4. Ouvrir ForgeFit depuis son icône comme une application.

## Limitation Apple Santé
Safari/PWA n’a pas accès à HealthKit. Pour synchroniser Apple Santé ou Apple Watch, il faudra une version native ou un wrapper natif signé.

## IA
La V2 contient un moteur de recommandations local simple. Une IA en ligne peut être ajoutée plus tard via un backend sécurisé ; ne pas placer une clé API privée directement dans le JavaScript de la PWA.
