# Lieux d'hébergement d'urgence (demande #1)

Réalisé hors story, en mode libre.

**Demande :** savoir où mettre les gens en cas d'inondation, à partir des places proposées par les communes.

## Critères et tests qui les prouvent
- Deux types seulement (gymnases et salles des fêtes ; écoles et salles communales), qui filtrent carte et liste : `lieux.spec.ts` (« seuls deux types »), `CarteView.spec.ts` (« uniquement les deux types », « annonce le total… »).
- Chaque lieu montre nom, commune, adresse, places, téléphone, accès, animaux : `CarteView.spec.ts` (« montre pour chaque lieu »), `lieux.spec.ts` (« lit tous les champs »).
- « Oui » ou « Non » en toutes lettres : `CarteView.spec.ts` (« écrit Oui ou Non »).
- Total des places qui suit le filtre : `lieux.spec.ts` (« le total des places »), `CarteView.spec.ts` (« annonce le total »).
- Lieu incomplet ignoré sans planter : `lieux.spec.ts` (« ignore, sans planter »).
- Carte et liste montrent les mêmes lieux : les deux lisent la même liste filtrée du store ; le texte de la bulle de la carte vient de la même donnée (`resumeLieu`, testé).
- Aucune erreur d'accessibilité automatique : `CarteView.spec.ts` (axe-core).

## Accessibilité
Faits : liste alternative à la carte, accès et animaux dits en texte, filtres DSFR, total annoncé (`role="status"`), un seul h1, téléphone en lien avec intitulé explicite.

**À vérifier par un humain :**
- Parcours complet au clavier, ordre de tabulation.
- Lecture des lieux et du total avec un lecteur d'écran.
- Lisibilité de la carte à 200 % et à 320 px.
- Les marqueurs de la carte (MapLibre) ne sont pas testés sous jsdom : à contrôler dans le navigateur, y compris le texte de la bulle.

## Périmètre
- Données : `src/donnees/lieux.json`, lues via le store existant. Lieux et téléphones **fictifs**, aucune donnée personnelle.
- Pas de date de mise à jour (non demandée). Hôtels et centres d'urgence exclus. Pas d'écran de saisie ni de places libres en temps réel.
- Titre de page et centrage initial de la carte adaptés.

## Résultat des contrôles
Tests ciblés : 15 réussis. Contrôle final (lint, types, tous les tests, construction) : voir ci-dessous.
