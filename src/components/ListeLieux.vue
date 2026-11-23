<script setup lang="ts">
import { libelleCategorie, lienTelephone, ouiOuNon, type Lieu } from '@/lib/lieux'

/** La liste des lieux : l'alternative accessible à la carte, et l'endroit où l'on choisit un lieu. */
defineProps<{ lieux: Lieu[]; lieuChoisi: string | null }>()
const emit = defineEmits<{ choisir: [id: string] }>()
</script>

<template>
  <ul class="liste-lieux fr-p-0">
    <li v-for="lieu in lieux" :key="lieu.id" class="fr-mb-2w" :class="{ 'liste-lieux__choisi': lieu.id === lieuChoisi }">
      <h3 class="fr-h6 fr-mb-1v">{{ lieu.nom }}</h3>
      <p class="fr-text--sm fr-mb-1v">{{ libelleCategorie(lieu.categorie) }}</p>
      <p class="fr-text--sm fr-mb-1v">{{ lieu.commune }} — {{ lieu.adresse }}</p>
      <p class="fr-text--sm fr-mb-1v">Places couchées : {{ lieu.placesCouchees }}</p>
      <p class="fr-text--sm fr-mb-1v">
        Téléphone de la commune :
        <a :href="lienTelephone(lieu.telephone)">{{ lieu.telephone }}<span class="fr-sr-only"> (appeler la commune de {{ lieu.commune }})</span></a>
      </p>
      <p class="fr-text--sm fr-mb-1v">Accessible aux personnes à mobilité réduite : {{ ouiOuNon(lieu.accessibleMobiliteReduite) }}</p>
      <p class="fr-text--sm fr-mb-1v">Animaux acceptés : {{ ouiOuNon(lieu.animauxAcceptes) }}</p>
      <DsfrButton
        size="sm"
        tertiary
        icon="fr-icon-map-pin-2-line"
        :label="lieu.id === lieuChoisi ? 'Affiché sur la carte' : 'Voir sur la carte'"
        :aria-label="`Voir ${lieu.nom} sur la carte`"
        :aria-pressed="lieu.id === lieuChoisi ? 'true' : 'false'"
        @click="emit('choisir', lieu.id)"
      />
    </li>
  </ul>
</template>

<style scoped>
.liste-lieux {
  list-style: none;
}
.liste-lieux__choisi {
  border-left: 4px solid var(--border-active-blue-france);
  padding-left: 0.75rem;
}
</style>
