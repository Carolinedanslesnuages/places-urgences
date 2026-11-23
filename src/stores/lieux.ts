import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import donnees from '@/donnees/lieux.json'
import { distanceKm, trierParDistance } from '@/lib/distance'
import { useCommuneStore } from '@/stores/commune'
import { CATEGORIES, filtrerLieux, lireLieux, type IdCategorie } from '@/lib/lieux'

/**
 * Les lieux, les filtres et le lieu choisi : partagés par la carte et la liste (qui montrent
 * toujours la même chose). Données : src/donnees/lieux.json, à remplacer par une API plus tard.
 */
export const useLieuxStore = defineStore('lieux', () => {
  const { lieux } = lireLieux(donnees)
  const tous = ref(lieux)
  const categoriesChoisies = ref<IdCategorie[]>(CATEGORIES.map((categorie) => categorie.id))
  const lieuChoisi = ref<string | null>(null)

  const communeChoisie = computed(() => useCommuneStore().communeChoisie)

  const lieuxAffiches = computed(() => {
    const lieuxFiltres = filtrerLieux(tous.value, categoriesChoisies.value)
    return communeChoisie.value ? trierParDistance(lieuxFiltres, communeChoisie.value.position) : lieuxFiltres
  })

  /** Distance en km de chaque lieu à la commune choisie (vide tant qu'aucune commune n'est choisie). */
  const distancesParLieu = computed<Record<string, number>>(() => {
    const commune = communeChoisie.value
    if (!commune) return {}
    return Object.fromEntries(tous.value.map((lieu) => [lieu.id, distanceKm(commune.position, lieu.position)]))
  })

  function choisir(id: string | null): void {
    lieuChoisi.value = id
  }

  return { tous, categoriesChoisies, lieuChoisi, lieuxAffiches, distancesParLieu, choisir }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useLieuxStore, import.meta.hot))
