<script setup lang="ts">
import { libelleCategorie, type Lieu } from '@/lib/lieux'

/** La liste des lieux : l'alternative accessible à la carte, et l'endroit où l'on choisit un lieu. */
defineProps<{ lieux: Lieu[]; lieuChoisi: string | null }>()
const emit = defineEmits<{ choisir: [id: string] }>()
</script>

<template>
  <ul class="liste-lieux fr-p-0">
    <li v-for="lieu in lieux" :key="lieu.id" class="fr-mb-2w" :class="{ 'liste-lieux__choisi': lieu.id === lieuChoisi }">
      <h3 class="fr-h6 fr-mb-1v">{{ lieu.nom }}</h3>
      <p class="fr-text--sm fr-mb-1v">{{ libelleCategorie(lieu.categorie) }} — {{ lieu.adresse }}</p>
      <p v-if="lieu.description" class="fr-text--sm fr-mb-1v">{{ lieu.description }}</p>
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
