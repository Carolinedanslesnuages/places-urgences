<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommuneStore } from '@/stores/commune'
import type { Commune } from '@/services/communes'

/** Champ « Commune » : propose les communes dont le nom commence par la saisie. */
const magasin = useCommuneStore()
const { suggestions, communeChoisie, serviceIndisponible } = storeToRefs(magasin)
const texteSaisi = ref('')

async function surSaisie(texte: string | number | undefined): Promise<void> {
  texteSaisi.value = String(texte ?? '')
  if (texteSaisi.value.trim() === '') {
    magasin.effacer()
    return
  }
  await magasin.chercher(texteSaisi.value)
}

function choisirCommune(commune: Commune): void {
  texteSaisi.value = commune.nom
  magasin.choisir(commune)
}

const annonce = computed(() => {
  if (serviceIndisponible.value) return ''
  if (communeChoisie.value) return `Commune choisie : ${communeChoisie.value.nom}. Lieux triés du plus proche au plus lointain.`
  const nombre = suggestions.value.length
  if (texteSaisi.value.trim() === '') return ''
  return `${nombre} commune${nombre > 1 ? 's' : ''} proposée${nombre > 1 ? 's' : ''}`
})
</script>

<template>
  <div class="fr-mb-2w">
    <DsfrInput
      id="champ-commune"
      :model-value="texteSaisi"
      label-visible
      label="Commune : trier les lieux par distance"
      hint="Tapez le début du nom, puis choisissez une commune dans la liste proposée"
      autocomplete="off"
      @update:model-value="surSaisie"
    />
    <p role="status" class="fr-sr-only">{{ annonce }}</p>
    <ul v-if="suggestions.length" class="fr-raw-list fr-mt-1w" aria-label="Communes proposées">
      <li v-for="commune in suggestions" :key="commune.code">
        <DsfrButton tertiary no-outline size="sm" :label="commune.nom" @click="choisirCommune(commune)" />
      </li>
    </ul>
    <div role="status">
      <DsfrAlert
        v-if="serviceIndisponible"
        type="error"
        small
        description="Erreur : la recherche de communes ne répond pas pour le moment. La liste des lieux reste affichée, sans tri par distance. Réessayez dans un instant."
      />
    </div>
  </div>
</template>
