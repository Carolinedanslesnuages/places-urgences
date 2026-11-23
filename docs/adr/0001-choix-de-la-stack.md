# ADR-0001 — Choix de la stack : carte Vue 3, DSFR et MapLibre

- **Statut** : Accepted
- **Date** : 2026-11-23
- **Décideurs** : Carolinedanslesnuages, via ADA
- **Sujet** : stack technique du projet Places urgences

## Contexte
Aider la préfecture à retrouver rapidement où loger des personnes sinistrées lors d’une inondation ou d’une tempête. Le besoin est de situer des lieux sur une carte. Seules les stacks d'ADA sont autorisées.

## Options considérées
### Option A — Vue 3 + DSFR + MapLibre, fond « Plan IGN » de la Géoplateforme
- Bibliothèque libre, fond de carte public de l'IGN ; données en GeoJSON.
### Option B — Service de carte d'un fournisseur privé
- **Pourquoi pas** : dépendance à un fournisseur et à ses conditions ; l'IGN fournit le fond public.

## Décision
**Option retenue : A.** La carte est doublée d'une liste, qui est l'alternative accessible.

## Conséquences
- **Positives** : fond de carte public ; carte et liste toujours cohérentes (même store).
- **Négatives** : MapLibre pèse environ 300 ko compressés ; WebGL nécessaire pour la carte.
- **À surveiller** : lieux saisis par les utilisateurs = une API à ajouter (nouvelle ADR).
