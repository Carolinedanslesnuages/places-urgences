import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VueDsfr from '@gouvminint/vue-dsfr'
import CarteView from '../CarteView.vue'
import { violationsAccessibilite } from '@/__tests__/accessibilite'
import { useLieuxStore } from '@/stores/lieux'
import * as serviceGeorisques from '@/services/georisques'
import { styleCarte } from '@/lib/styleCarte'

vi.mock('@/services/georisques', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/georisques')>()),
  estEnZoneInondable: vi.fn<(position: [number, number]) => Promise<boolean>>(),
}))
const estEnZoneInondable = vi.mocked(serviceGeorisques.estEnZoneInondable)

const LIEU_INONDABLE = 'Gymnase de Rivebelle'

/** Rivebelle est inondable, tous les autres lieux sont hors zone. */
function simulerRivebelleInondable(): void {
  const positionRivebelle = useLieuxStore().tous.find((lieu) => lieu.nom === LIEU_INONDABLE)!.position
  estEnZoneInondable.mockImplementation(async (position) => position[0] === positionRivebelle[0] && position[1] === positionRivebelle[1])
}

const monter = () =>
  mount(CarteView, {
    global: { plugins: [VueDsfr], stubs: { CarteLieux: { template: '<div role="region" aria-label="Carte des lieux"></div>' } } },
    attachTo: document.body,
  })

const elementLieu = (wrapper: ReturnType<typeof monter>, nom: string) => wrapper.findAll('.liste-lieux li').find((element) => element.text().includes(nom))!

describe('Voir si un lieu est en zone inondable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    estEnZoneInondable.mockReset()
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('affiche les zones inondables (crue moyenne, Géorisques) en bleu, sous les repères de la carte', () => {
    const style = styleCarte()
    const identifiants = style.layers.map((couche) => couche.id)
    expect(identifiants).toEqual(['plan-ign', 'zones-inondables'])
    const source = style.sources.zonesInondables as { tiles: string[] }
    expect(source.tiles[0]).toContain('mapsref.brgm.fr/wxs/georisques')
    expect(source.tiles[0]).toContain(serviceGeorisques.COUCHE_CRUE_MOYENNE)
  })

  it('écrit « Zone inondable » en texte sur un lieu inondable, et rien sur un lieu hors zone', async () => {
    setActivePinia(createPinia())
    const wrapper = monter()
    simulerRivebelleInondable()
    await useLieuxStore().verifierZonesInondables()
    await flushPromises()
    expect(elementLieu(wrapper, LIEU_INONDABLE).text()).toContain('Zone inondable')
    expect(elementLieu(wrapper, LIEU_INONDABLE).text()).not.toContain('non vérifiée')
    const autre = elementLieu(wrapper, 'École Jules Exemple')
    expect(autre.text()).not.toContain('Zone inondable')
    wrapper.unmount()
  })

  it('si Géorisques ne répond pas, le dit et ne présente aucun lieu comme sûr', async () => {
    estEnZoneInondable.mockRejectedValue(new Error('Géorisques indisponible (503)'))
    const wrapper = monter()
    await flushPromises()
    expect(wrapper.find('[role="status"] .fr-alert').text()).toContain('Géorisques ne répond pas')
    const lieux = wrapper.findAll('.liste-lieux li')
    expect(lieux).toHaveLength(6)
    for (const lieu of lieux) expect(lieu.text()).toContain('Zone inondable non vérifiée')
    wrapper.unmount()
  })

  it('pendant la panne, le filtre « Hors zone inondable » est désactivé et ne masque rien', async () => {
    estEnZoneInondable.mockRejectedValue(new Error('hors ligne'))
    const wrapper = monter()
    await flushPromises()
    const filtre = wrapper.find('#filtre-hors-zone-inondable')
    expect(filtre.attributes('disabled')).toBeDefined()
    useLieuxStore().horsZoneInondableSeulement = true
    await flushPromises()
    expect(wrapper.findAll('.liste-lieux li')).toHaveLength(6)
    wrapper.unmount()
  })

  it('le filtre « Hors zone inondable » masque les lieux inondables dans la liste', async () => {
    const wrapper = monter()
    simulerRivebelleInondable()
    await useLieuxStore().verifierZonesInondables()
    await flushPromises()
    expect(wrapper.find('label[for="filtre-hors-zone-inondable"]').text()).toContain('Hors zone inondable')
    expect(wrapper.findAll('.liste-lieux li')).toHaveLength(6)
    await wrapper.find('#filtre-hors-zone-inondable').setValue(true)
    const noms = wrapper.findAll('.liste-lieux h3').map((titre) => titre.text())
    expect(noms).toHaveLength(5)
    expect(noms).not.toContain(LIEU_INONDABLE)
    expect(useLieuxStore().lieuxAffiches.map((lieu) => lieu.nom)).not.toContain(LIEU_INONDABLE)
    wrapper.unmount()
  })

  it('tant que la réponse n’est pas arrivée, les lieux sont « non vérifiés » et le filtre est désactivé', () => {
    estEnZoneInondable.mockReturnValue(new Promise(() => {}))
    const wrapper = monter()
    expect(elementLieu(wrapper, LIEU_INONDABLE).text()).toContain('Zone inondable non vérifiée')
    expect(wrapper.find('#filtre-hors-zone-inondable').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique, avec avertissements et message de panne', async () => {
    estEnZoneInondable.mockRejectedValue(new Error('hors ligne'))
    const wrapper = monter()
    await flushPromises()
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique, avec un lieu inondable', async () => {
    const wrapper = monter()
    simulerRivebelleInondable()
    await useLieuxStore().verifierZonesInondables()
    await flushPromises()
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })
})
