import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import donnees from '@/donnees/lieux.json'
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

  const lieuxAffiches = computed(() => filtrerLieux(tous.value, categoriesChoisies.value))

  function choisir(id: string | null): void {
    lieuChoisi.value = id
  }

  return { tous, categoriesChoisies, lieuChoisi, lieuxAffiches, choisir }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useLieuxStore, import.meta.hot))
