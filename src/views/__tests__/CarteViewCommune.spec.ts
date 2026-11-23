import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VueDsfr from '@gouvminint/vue-dsfr'
import { defineComponent, type PropType } from 'vue'
import CarteView from '../CarteView.vue'
import { violationsAccessibilite } from '@/__tests__/accessibilite'
import type { Lieu } from '@/lib/lieux'
import * as serviceCommunes from '@/services/communes'

vi.mock('@/services/communes')
vi.mock('@/services/georisques', () => ({ estEnZoneInondable: vi.fn<() => Promise<boolean>>().mockResolvedValue(false) }))
const rechercherCommunes = vi.mocked(serviceCommunes.rechercherCommunes)

const nantesProchePontclair = { code: '44999', nom: 'Pontville', position: [-1.62, 47.19] as [number, number] }

// La carte (WebGL) est remplacée par un faux qui montre l'ordre des lieux qu'elle reçoit.
const CarteFausse = defineComponent({
  props: { lieux: { type: Array as PropType<Lieu[]>, required: true } },
  template: '<ol class="carte-fausse"><li v-for="lieu in lieux" :key="lieu.id">{{ lieu.id }}</li></ol>',
})

const monter = () =>
  mount(CarteView, { global: { plugins: [VueDsfr], stubs: { CarteLieux: CarteFausse } }, attachTo: document.body })

async function saisir(wrapper: ReturnType<typeof monter>, texte: string): Promise<void> {
  await wrapper.find('#champ-commune').setValue(texte)
  await flushPromises()
}

describe('Chercher les lieux près d’une commune', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    rechercherCommunes.mockReset()
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('propose les communes dont le nom commence par la saisie, avec une étiquette visible', async () => {
    rechercherCommunes.mockResolvedValue([nantesProchePontclair, { code: '44998', nom: 'Pontlieue', position: [-1.5, 47.2] }])
    const wrapper = monter()
    expect(wrapper.find('label[for="champ-commune"]').text()).toContain('Commune')
    await saisir(wrapper, 'Pont')
    expect(rechercherCommunes).toHaveBeenCalledWith('Pont')
    const propositions = wrapper.findAll('ul[aria-label="Communes proposées"] button').map((bouton) => bouton.text())
    expect(propositions).toEqual(['Pontville', 'Pontlieue'])
    wrapper.unmount()
  })

  it('trie la liste et la carte du lieu le plus proche au plus lointain, après le choix', async () => {
    rechercherCommunes.mockResolvedValue([nantesProchePontclair])
    const wrapper = monter()
    await saisir(wrapper, 'Pont')
    await wrapper.find('ul[aria-label="Communes proposées"] button').trigger('click')
    const ordreListe = wrapper.findAll('.liste-lieux h3').map((titre) => titre.text())
    const ordreCarte = wrapper.findAll('.carte-fausse li').map((element) => element.text())
    expect(ordreListe.slice(0, 2)).toEqual(['Gymnase Pontclair', 'École Marie Imaginaire'])
    expect(ordreCarte.slice(0, 2)).toEqual(['gymnase-pontclair', 'ecole-marie-imaginaire'])
    expect(ordreCarte).toHaveLength(ordreListe.length)
    wrapper.unmount()
  })

  it('affiche pour chaque lieu sa distance en km, croissante dans la liste', async () => {
    rechercherCommunes.mockResolvedValue([nantesProchePontclair])
    const wrapper = monter()
    await saisir(wrapper, 'Pont')
    await wrapper.find('ul[aria-label="Communes proposées"] button').trigger('click')
    const distances = wrapper.findAll('.liste-lieux li').map((element) => {
      const correspondance = element.text().match(/Distance à la commune choisie : ([\d,]+) km/)
      expect(correspondance).not.toBeNull()
      return Number(correspondance![1]!.replace(',', '.'))
    })
    expect(distances).toHaveLength(6)
    expect(distances).toEqual([...distances].sort((premier, second) => premier - second))
    expect(distances[0]).toBe(0)
    wrapper.unmount()
  })

  it('annonce la commune choisie et le nouvel ordre', async () => {
    rechercherCommunes.mockResolvedValue([nantesProchePontclair])
    const wrapper = monter()
    await saisir(wrapper, 'Pont')
    await wrapper.find('ul[aria-label="Communes proposées"] button').trigger('click')
    expect(wrapper.text()).toContain('Commune choisie : Pontville. Lieux triés du plus proche au plus lointain.')
    wrapper.unmount()
  })

  it('si le service ne répond pas : message clair, liste toujours affichée', async () => {
    rechercherCommunes.mockRejectedValue(new Error('hors service'))
    const wrapper = monter()
    await saisir(wrapper, 'Nan')
    expect(wrapper.find('.fr-alert').text()).toContain('la recherche de communes ne répond pas')
    expect(wrapper.findAll('.liste-lieux h3')).toHaveLength(6)
    wrapper.unmount()
  })

  it('les filtres existants restent utilisables avec une commune choisie', async () => {
    rechercherCommunes.mockResolvedValue([nantesProchePontclair])
    const wrapper = monter()
    await saisir(wrapper, 'Pont')
    await wrapper.find('ul[aria-label="Communes proposées"] button').trigger('click')
    await wrapper.find('#categorie-gymnase').setValue(false)
    expect(wrapper.findAll('.liste-lieux h3').map((titre) => titre.text())[0]).toBe('École Marie Imaginaire')
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique (suggestions et erreur affichées)', async () => {
    rechercherCommunes.mockResolvedValue([nantesProchePontclair])
    const wrapper = monter()
    await saisir(wrapper, 'Pont')
    expect(await violationsAccessibilite(document.body)).toEqual([])
    rechercherCommunes.mockRejectedValue(new Error('hors service'))
    await saisir(wrapper, 'Pontv')
    expect(wrapper.find('.fr-alert').exists()).toBe(true)
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })
})
