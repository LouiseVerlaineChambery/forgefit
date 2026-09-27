# Denat Life V27 — Sport, nutrition & équilibre

Denat Life est une PWA personnelle et familiale installable sur iPhone. Elle réunit le suivi sportif de Jocelyn, le quotidien repas d’Anaïs et les fonctions partagées du foyer.

## V27
- Refonte de l’expérience pendant une séance de musculation : une seule série au centre de l’écran
- Gros contrôles +/− pour charge et répétitions, adaptés à l’incrément haut/bas du corps
- RPE 6 à 10 en un toucher
- Validation de série en un bouton avec lancement automatique du repos
- Navigation horizontale compacte entre exercices avec progression séries/exercice
- Reprise automatique sur le premier exercice non terminé après fermeture/rechargement
- Bouton d’annulation de la dernière validation pour corriger une fausse manipulation
- Technique et explications du coach repliées pour garder l’écran d’effort minimal
- Écran de fin de séance avec durée, séries validées et volume déplacé avant enregistrement
- Screen Wake Lock utilisé pendant la séance lorsque le navigateur le permet
- Timer enrichi avec +30 secondes en plus des contrôles existants

## V26.1
- Normalisation non destructive de l’ancien historique MyBodyNote et des anciens libellés d’exercices
- Les alias historiques sont reliés aux 65 exercices canoniques sans réécrire les séances originales
- Courbes de progression, coach de charge et historique ForgeFit utilisent désormais la même identité d’exercice
- Les futurs imports MyBodyNote utilisent automatiquement les noms canoniques lorsqu’une correspondance existe
- Audit visible dans Réglages : couverture de l’historique, alias raccordés et noms restant à identifier

## V26
- Moteur unique de progression musculation : les anciens conseils ForgeFit délèguent désormais au coach sport
- Double progression : répétitions d’abord, charge ensuite
- Fourchettes automatiques selon le type d’exercice (polyarticulaire, isolation, abdos/gainage)
- Une hausse de charge n’est proposée qu’après validation du haut de fourchette sur toutes les séries avec RPE maîtrisé
- Sans RPE fiable, la charge n’augmente pas automatiquement
- Une séance difficile conserve d’abord la charge ; deux références difficiles consécutives peuvent déclencher une baisse d’un cran
- Pendant la séance, Denat Life peut alléger une série trop difficile mais n’augmente pas la charge sur la seule base d’une série facile
- Exercices au poids du corps : progression prioritaire en répétitions
- Séances Hôtel/Nomade toujours exclues des références de charge
- La fiche de progression d’un exercice affiche maintenant la prochaine cible et la logique utilisée

## V25
- Nouvel écran Muscles dans la progression sportive
- Carte corporelle descriptive face/dos sur les 7 derniers jours
- Séries équivalentes par zone : 1 pour le muscle principal, 0,5 pour un groupe secondaire
- 7 zones suivies : pectoraux, dos, épaules, biceps, triceps, jambes et abdos
- Comparaison automatique avec les 7 jours précédents
- Exercices et séances nomades inclus dans le travail musculaire réellement effectué
- Indication des zones relativement peu sollicitées par rapport à la propre semaine de l’utilisateur, sans objectif de volume imposé
- Résumé musculaire directement visible sur l’écran Sport

## V24
- Bibliothèque structurée de plus de 60 exercices de musculation, recherchables par zone et matériel
- Métadonnées muscles, matériel, séries, répétitions et repos pour les exercices de la bibliothèque
- Sélecteur de bibliothèque lors de l’édition d’un programme, sans supprimer la saisie libre
- Animations « petit bonhomme » étendues aux pompes, dips, développé épaules, oiseau/reverse fly, fentes et gainage
- Mode Hôtel / Nomade : séances Full Body de 15, 30 ou 45 minutes
- Matériel nomade optionnel : haltères, élastique, banc et barre de traction ; aucune machine requise
- Les séances nomades restent dans l’historique et contribuent au suivi des muscles travaillés
- Les séances nomades ne déplacent pas la rotation du programme principal et ne servent pas de référence aux recommandations de charge

## V23
- Adaptation nutritionnelle quotidienne à partir des repas réellement enregistrés
- Compare le réel aux repas du menu déjà consommés, au lieu de supposer que le journal est complet
- Calcule le reste de la journée en kcal, protéines, glucides, lipides et fibres
- Ajuste modérément la portion du dîner, séparément pour Jocelyn et Anaïs
- Protéines et féculents peuvent évoluer indépendamment selon les écarts de la journée
- Objectifs personnels utilisés lorsqu’ils sont configurés ; sinon le menu prévu sert de repère sans imposer de cible arbitraire
- Journal incomplet signalé comme provisoire
- Aucun saut de repas ni compensation agressive : les corrections sont volontairement bornées
- Adaptation visible dans le coach repas et sur le tableau de bord

## V22
- Nouveau noyau nutritionnel local : kcal, protéines, glucides, lipides et fibres
- Distinction des poids secs et cuits pour les féculents
- Calcul des portions Jocelyn et Anaïs à partir des quantités des recettes
- Macros prévues par repas et par journée dans le menu
- Journal réel enrichi avec les 5 indicateurs nutritionnels
- Comparaison « menu prévu » / « réellement mangé » sur le tableau de bord
- Objectifs nutritionnels personnels facultatifs et synchronisables
- Progression quotidienne en pourcentage quand un objectif est renseigné
- Estimations explicites : les marques/étiquettes exactes restent prioritaires sur les valeurs génériques

## V21
- Moteur repas V2 avec mémoire de rotation sur plusieurs semaines
- Réduit fortement les dîners repris de la semaine précédente
- Équilibre les familles de protéines et les styles culinaires
- Favoris conservés, mais sans répétition forcée d’une semaine à l’autre
- Remplacements manuels et repas rapides toujours prioritaires
- Mémoire de rotation synchronisée par Denat Life Cloud
- Indicateur de variété visible dans le menu de la semaine

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
