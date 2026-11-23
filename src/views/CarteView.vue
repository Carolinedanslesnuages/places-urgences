<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import CarteLieux from '@/components/CarteLieux.vue'
import ListeLieux from '@/components/ListeLieux.vue'
import RechercheCommune from '@/components/RechercheCommune.vue'
import { CATEGORIES, totalPlacesCouchees } from '@/lib/lieux'
import { useLieuxStore } from '@/stores/lieux'

const magasin = useLieuxStore()
const { categoriesChoisies, lieuxAffiches, lieuChoisi, distancesParLieu, statutsInondation, etatGeorisques, horsZoneInondableSeulement } =
  storeToRefs(magasin)
onMounted(() => magasin.verifierZonesInondables())
const georisquesEnPanne = computed(() => etatGeorisques.value === 'panne')
const filtreHorsZoneDisponible = computed(() => etatGeorisques.value === 'disponible')
const options = CATEGORIES.map((categorie) => ({ id: `categorie-${categorie.id}`, name: 'categories', label: categorie.libelle, value: categorie.id }))
const total = computed(() => totalPlacesCouchees(lieuxAffiches.value))
const annonce = computed(() => {
  const nombre = lieuxAffiches.value.length
  return `${nombre} lieu${nombre > 1 ? 'x' : ''} affiché${nombre > 1 ? 's' : ''} — ${total.value} place${total.value > 1 ? 's' : ''} couchée${total.value > 1 ? 's' : ''} au total`
})
</script>

<template>
  <h1>Lieux d'hébergement d'urgence</h1>
  <p>Les lieux proposés par les communes sont présentés sur une carte et dans une liste, qui donnent les mêmes informations.</p>

  <DsfrCheckboxSet v-model="categoriesChoisies" legend="Afficher" :options="options" inline />
  <DsfrCheckbox
    id="filtre-hors-zone-inondable"
    v-model="horsZoneInondableSeulement"
    name="hors-zone-inondable"
    label="Hors zone inondable"
    :disabled="!filtreHorsZoneDisponible"
  />
  <p class="fr-text--bold" role="status">{{ annonce }}</p>
  <div role="status">
    <DsfrAlert v-if="georisquesEnPanne" type="warning" small>
      Géorisques ne répond pas : les zones inondables ne peuvent pas être vérifiées. Aucun lieu n'est présenté comme sûr, et le filtre « Hors zone inondable » est désactivé.
    </DsfrAlert>
    <p v-else-if="!filtreHorsZoneDisponible" class="fr-text--sm">Vérification des zones inondables en cours : le filtre « Hors zone inondable » sera disponible ensuite.</p>
  </div>
  <RechercheCommune />

  <div class="fr-grid-row fr-grid-row--gutters">
    <div class="fr-col-12 fr-col-lg-8">
      <CarteLieux
        :lieux="lieuxAffiches"
        :lieu-choisi="lieuChoisi"
        :distances="distancesParLieu"
        :statuts-inondation="statutsInondation"
        @choisir="magasin.choisir"
      />
    </div>
    <section class="fr-col-12 fr-col-lg-4" aria-labelledby="titre-liste">
      <h2 id="titre-liste" class="fr-h5">Liste des lieux</h2>
      <p v-if="lieuxAffiches.length === 0">Aucun lieu pour ces filtres : cochez au moins une catégorie.</p>
      <ListeLieux
        v-else
        :lieux="lieuxAffiches"
        :lieu-choisi="lieuChoisi"
        :distances="distancesParLieu"
        :statuts-inondation="statutsInondation"
        @choisir="magasin.choisir"
      />
    </section>
  </div>
</template>
