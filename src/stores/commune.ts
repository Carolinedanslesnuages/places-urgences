import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { rechercherCommunes, type Commune } from '@/services/communes'

/** La commune choisie par l'agent et les suggestions de la recherche : partagées par la liste et la carte. */
export const useCommuneStore = defineStore('commune', () => {
  const suggestions = ref<Commune[]>([])
  const communeChoisie = ref<Commune | null>(null)
  const serviceIndisponible = ref(false)
  let numeroDeRecherche = 0

  async function chercher(texteSaisi: string): Promise<void> {
    numeroDeRecherche += 1
    const numeroCourant = numeroDeRecherche
    try {
      const communes = await rechercherCommunes(texteSaisi)
      if (numeroCourant !== numeroDeRecherche) return
      suggestions.value = communes
      serviceIndisponible.value = false
    } catch {
      if (numeroCourant !== numeroDeRecherche) return
      suggestions.value = []
      serviceIndisponible.value = true
    }
  }

  function choisir(commune: Commune): void {
    numeroDeRecherche += 1
    communeChoisie.value = commune
    suggestions.value = []
    serviceIndisponible.value = false
  }

  function effacer(): void {
    numeroDeRecherche += 1
    communeChoisie.value = null
    suggestions.value = []
    serviceIndisponible.value = false
  }

  return { suggestions, communeChoisie, serviceIndisponible, chercher, choisir, effacer }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useCommuneStore, import.meta.hot))
