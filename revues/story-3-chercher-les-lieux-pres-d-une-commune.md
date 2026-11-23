# Story #3 — Chercher les lieux près d’une commune

## Critères d’acceptation et preuves
| Critère | Test |
|---|---|
| La recherche propose les communes dont le nom commence par la saisie | `services/__tests__/communes.spec.ts` (filtre « commence par ») ; `views/__tests__/CarteViewCommune.spec.ts` (suggestions) |
| Après le choix, liste et carte triées du plus proche au plus lointain | `CarteViewCommune.spec.ts` (même ordre liste/carte) ; `lib/__tests__/distance.spec.ts` (tri) |
| Chaque lieu affiche sa distance en km | `CarteViewCommune.spec.ts` (distances en km, croissantes) ; `distance.spec.ts` (format « 12,4 km ») |
| Service en panne : message clair, liste conservée | `CarteViewCommune.spec.ts` (alerte + 6 lieux) |
| Filtres existants toujours utilisables | `CarteViewCommune.spec.ts` |

## Accessibilité
Automatique : test axe-core avec suggestions et message d’erreur affichés.

À vérifier par un humain :
- Parcours au clavier : champ, suggestions (boutons), liste.
- Lecteur d’écran : annonces « N communes proposées », « Commune choisie… » et message d’erreur.
- Distances lisibles dans la liste et la bulle de la carte.
- Affichage à 320 px et zoom 200 %.
- Point à noter : les suggestions sont une liste de boutons, pas un « combobox » ARIA complet.

## Périmètre
- Service public geo.api.gouv.fr, sans clé. Distances à vol d’oiseau, indicatives, sur des lieux fictifs.
- Nouveaux : calcul de distance, service des communes, store `commune`, champ de recherche.
- Modifiés : store des lieux (tri), liste et carte (distance), écran principal.
- Autre problème repéré : aucun.
- La page n’est pas ajoutée à la liste du contrôle CI (réservé aux développeurs).

## Contrôles
oxlint, eslint, type-check, tests unitaires et build : tous OK.
