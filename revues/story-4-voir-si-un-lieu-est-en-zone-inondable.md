# Story #4 — Voir si un lieu est en zone inondable

## Critères d’acceptation et preuves
| Critère | Test |
|---|---|
| Zones inondables (crue moyenne, Géorisques) en bleu, sous les repères | `views/__tests__/CarteViewInondation.spec.ts` (couche bleue ajoutée après le fond, adresse Géorisques) |
| Lieu inondable : « Zone inondable » écrit en texte | `CarteViewInondation.spec.ts` (texte présent sur Rivebelle, absent ailleurs) |
| Géorisques ne répond pas : message, aucun lieu présenté comme sûr | `CarteViewInondation.spec.ts` (alerte, 6 lieux « Zone inondable non vérifiée ») ; `services/__tests__/georisques.spec.ts` (une panne lève une erreur, jamais « hors zone ») |
| Filtre « Hors zone inondable » | `CarteViewInondation.spec.ts` (5 lieux restent, liste et lieux de la carte) ; filtre désactivé en panne et pendant l’attente |

## Accessibilité
Automatique : tests axe-core avec lieu inondable, puis avec message de panne.

À vérifier par un humain :
- **Le nom de la couche Géorisques (`TRI_ZONE_INOND_MOY`) n’a pas pu être vérifié** (pas d’accès réseau pendant mon travail). À confirmer sur la carte réelle : si les zones n’apparaissent pas, ou si tous les lieux restent « non vérifiés », c’est le nom de la couche à corriger (un seul endroit).
- Contraste du bleu des zones avec le fond IGN (couleur fixée par Géorisques, opacité 70 %).
- Parcours au clavier : case « Hors zone inondable », puis liste.
- Lecteur d’écran : annonce du message de panne ou d’attente.
- Texte « Zone inondable » lisible dans la liste et la bulle de la carte.
- Affichage à 320 px et zoom 200 %.

## Périmètre
- Nouveaux : service Géorisques, règles d’inondation, style de la carte.
- Modifiés : store des lieux (état, filtre), liste, carte, écran principal.
- Tests existants : appel à Géorisques remplacé par un faux.
- Une panne sur un seul lieu suffit à déclarer la panne et à désactiver le filtre (choix prudent).
- Autre problème repéré : aucun.

## Contrôles
oxlint, eslint, type-check, tests unitaires et build : tous OK.
