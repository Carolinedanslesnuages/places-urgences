<script setup lang="ts">
import { avertissementInondation, TEXTE_ZONE_INONDABLE, type StatutInondation } from '@/lib/inondation'
import type { Lieu } from '@/lib/lieux'

/** Tableau réservé à l'impression (affichage au mur) : invisible à l'écran, où la liste fait foi. */
const props = defineProps<{
  lieux: Lieu[]
  statutsInondation: Record<string, StatutInondation>
}>()

const texteInondation = (identifiant: string): string =>
  avertissementInondation(props.statutsInondation[identifiant] ?? 'non-verifie') || 'Hors zone inondable'
</script>

<template>
  <div class="impression-seulement">
    <table>
      <caption>
        Lieux d'hébergement d'urgence — {{ lieux.length }} lieu{{ lieux.length > 1 ? 'x' : '' }}
      </caption>
      <thead>
        <tr>
          <th scope="col">Nom</th>
          <th scope="col">Commune</th>
          <th scope="col">Places couchées</th>
          <th scope="col">Téléphone</th>
          <th scope="col">Zone inondable</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="lieu in lieux" :key="lieu.id">
          <th scope="row">{{ lieu.nom }}</th>
          <td>{{ lieu.commune }}</td>
          <td>{{ lieu.placesCouchees }}</td>
          <td>{{ lieu.telephone }}</td>
          <td :class="{ 'impression-seulement__alerte': texteInondation(lieu.id) !== 'Hors zone inondable' }">
            {{ texteInondation(lieu.id) === TEXTE_ZONE_INONDABLE ? 'OUI — ' + TEXTE_ZONE_INONDABLE : texteInondation(lieu.id) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.impression-seulement {
  display: none;
}
@media print {
  .fr-header,
  .fr-footer,
  .fr-skiplinks,
  .ne-pas-imprimer {
    display: none !important;
  }
  .impression-seulement {
    display: block;
  }
  .impression-seulement table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14pt;
  }
  .impression-seulement caption {
    font-size: 18pt;
    font-weight: bold;
    text-align: left;
    margin-bottom: 0.5rem;
  }
  .impression-seulement th,
  .impression-seulement td {
    border: 1px solid #000;
    padding: 0.4rem 0.6rem;
    text-align: left;
  }
  .impression-seulement tr {
    break-inside: avoid;
  }
  .impression-seulement__alerte {
    font-weight: bold;
  }
}
</style>
