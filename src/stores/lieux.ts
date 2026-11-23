import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import donnees from '@/donnees/lieux.json'
import { distanceKm, trierParDistance } from '@/lib/distance'
import { useCommuneStore } from '@/stores/commune'
import { CATEGORIES, filtrerLieux, lireLieux, type IdCategorie } from '@/lib/lieux'
import { garderHorsZoneInondable, type StatutInondation } from '@/lib/inondation'
import { estEnZoneInondable } from '@/services/georisques'

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

  /** Résultat de Géorisques par lieu ; un lieu absent n'est pas vérifié. */
  const resultatsInondation = ref<Record<string, boolean>>({})
  const etatGeorisques = ref<'en-cours' | 'disponible' | 'panne'>('en-cours')
  const horsZoneInondableSeulement = ref(false)

  const statutsInondation = computed<Record<string, StatutInondation>>(() =>
    Object.fromEntries(
      tous.value.map((lieu) => {
        const estInondable = resultatsInondation.value[lieu.id]
        const statut: StatutInondation = estInondable === undefined ? 'non-verifie' : estInondable ? 'inondable' : 'hors-zone'
        return [lieu.id, statut]
      }),
    ),
  )

  const lieuxAffiches = computed(() => {
    const lieuxFiltres = filtrerLieux(tous.value, categoriesChoisies.value)
    // Le filtre n'agit que si Géorisques a répondu pour tous les lieux : sinon rien n'est présenté comme sûr.
    const lieuxVisibles =
      horsZoneInondableSeulement.value && etatGeorisques.value === 'disponible' ? garderHorsZoneInondable(lieuxFiltres, statutsInondation.value) : lieuxFiltres
    return communeChoisie.value ? trierParDistance(lieuxVisibles, communeChoisie.value.position) : lieuxVisibles
  })

  /** Interroge Géorisques pour chaque lieu. Au moindre échec : panne annoncée, lieux concernés « non vérifiés ». */
  async function verifierZonesInondables(): Promise<void> {
    etatGeorisques.value = 'en-cours'
    const reponses = await Promise.allSettled(tous.value.map((lieu) => estEnZoneInondable(lieu.position)))
    const resultats: Record<string, boolean> = {}
    let toutAReponse = true
    reponses.forEach((reponse, indice) => {
      if (reponse.status === 'fulfilled' && typeof reponse.value === 'boolean') resultats[tous.value[indice]!.id] = reponse.value
      else toutAReponse = false
    })
    resultatsInondation.value = resultats
    etatGeorisques.value = toutAReponse ? 'disponible' : 'panne'
  }

  /** Distance en km de chaque lieu à la commune choisie (vide tant qu'aucune commune n'est choisie). */
  const distancesParLieu = computed<Record<string, number>>(() => {
    const commune = communeChoisie.value
    if (!commune) return {}
    return Object.fromEntries(tous.value.map((lieu) => [lieu.id, distanceKm(commune.position, lieu.position)]))
  })

  function choisir(id: string | null): void {
    lieuChoisi.value = id
  }

  return {
    tous,
    categoriesChoisies,
    lieuChoisi,
    lieuxAffiches,
    distancesParLieu,
    choisir,
    statutsInondation,
    etatGeorisques,
    horsZoneInondableSeulement,
    verifierZonesInondables,
  }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useLieuxStore, import.meta.hot))
