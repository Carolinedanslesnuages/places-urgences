import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VueDsfr from '@gouvminint/vue-dsfr'
import CarteView from '../CarteView.vue'
import { violationsAccessibilite } from '@/__tests__/accessibilite'
import { useLieuxStore } from '@/stores/lieux'
import * as serviceGeorisques from '@/services/georisques'

vi.mock('@/services/georisques', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/georisques')>()),
  estEnZoneInondable: vi.fn<(position: [number, number]) => Promise<boolean>>(),
}))
const estEnZoneInondable = vi.mocked(serviceGeorisques.estEnZoneInondable)

const monter = () =>
  mount(CarteView, {
    global: { plugins: [VueDsfr], stubs: { CarteLieux: { template: '<div role="region" aria-label="Carte des lieux"></div>' } } },
    attachTo: document.body,
  })

describe('Imprimer la liste des lieux pour l’afficher au mur', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    estEnZoneInondable.mockReset()
  })
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('propose un bouton « Imprimer la liste des lieux » qui lance l’impression', async () => {
    estEnZoneInondable.mockResolvedValue(false)
    const imprimer = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = monter()
    await flushPromises()
    const bouton = wrapper.findAll('button').find((element) => element.text().includes('Imprimer la liste des lieux'))!
    await bouton.trigger('click')
    expect(imprimer).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('le tableau imprimé donne nom, commune, places couchées, téléphone et zone inondable de chaque lieu', async () => {
    const wrapper = monter()
    const premierLieu = useLieuxStore().lieuxAffiches[0]!
    const positionInondable = premierLieu.position
    estEnZoneInondable.mockImplementation(async (position) => position[0] === positionInondable[0] && position[1] === positionInondable[1])
    await useLieuxStore().verifierZonesInondables()
    await flushPromises()
    const tableau = wrapper.find('.impression-seulement table')
    expect(tableau.find('caption').exists()).toBe(true)
    expect(tableau.findAll('thead th').map((entete) => entete.text())).toEqual(['Nom', 'Commune', 'Places couchées', 'Téléphone', 'Zone inondable'])
    const lignes = tableau.findAll('tbody tr')
    expect(lignes).toHaveLength(useLieuxStore().lieuxAffiches.length)
    const cellules = lignes[0]!.findAll('th, td').map((cellule) => cellule.text())
    expect(cellules.slice(0, 4)).toEqual([premierLieu.nom, premierLieu.commune, String(premierLieu.placesCouchees), premierLieu.telephone])
    expect(cellules[4]).toContain('Zone inondable')
    expect(lignes[1]!.text()).toContain('Hors zone inondable')
    wrapper.unmount()
  })

  it('tant que la zone inondable n’est pas vérifiée, le tableau ne dit jamais « hors zone »', () => {
    estEnZoneInondable.mockReturnValue(new Promise(() => {}))
    const wrapper = monter()
    for (const ligne of wrapper.findAll('.impression-seulement tbody tr')) {
      expect(ligne.text()).toContain('Zone inondable non vérifiée')
    }
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique avec le tableau d’impression', async () => {
    estEnZoneInondable.mockResolvedValue(false)
    const wrapper = monter()
    await flushPromises()
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })
})
