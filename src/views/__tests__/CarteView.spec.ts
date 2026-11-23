import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VueDsfr from '@gouvminint/vue-dsfr'
import CarteView from '../CarteView.vue'
import { useLieuxStore } from '@/stores/lieux'
import { violationsAccessibilite } from '@/__tests__/accessibilite'

// La carte (WebGL) est remplacée : son contenu est vérifié dans le navigateur ; ici, la liste.
const monter = () =>
  mount(CarteView, {
    global: { plugins: [VueDsfr], stubs: { CarteLieux: { template: '<div role="region" aria-label="Carte des lieux"></div>' } } },
    attachTo: document.body,
  })

describe('Carte des lieux', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('liste tous les lieux, triés, avec catégorie et adresse : l’alternative à la carte', () => {
    const wrapper = monter()
    const noms = wrapper.findAll('.liste-lieux h3').map((titre) => titre.text())
    expect(noms).toHaveLength(6)
    expect(noms).toEqual([...noms].sort((premier, second) => premier.localeCompare(second, 'fr')))
    expect(wrapper.find('.liste-lieux').text()).toContain('Salles de réunion — 8 boulevard Imaginaire, 75011 Paris')
    expect(wrapper.find('[role="status"]').text()).toBe('6 lieux affichés')
    wrapper.unmount()
  })

  it('filtre par catégorie et l’annonce', async () => {
    const wrapper = monter()
    await wrapper.find('#categorie-accueil').setValue(false)
    await wrapper.find('#categorie-equipement').setValue(false)
    expect(wrapper.findAll('.liste-lieux h3').map((titre) => titre.text())).toEqual(['Salle de réunion Bastille', 'Salle Montparnasse'])
    expect(wrapper.find('[role="status"]').text()).toBe('2 lieux affichés')
    await wrapper.find('#categorie-salle').setValue(false)
    expect(wrapper.text()).toContain('Aucun lieu pour ces filtres')
    wrapper.unmount()
  })

  it('choisir un lieu dans la liste le désigne sur la carte', async () => {
    const wrapper = monter()
    const bouton = wrapper.find('button[aria-label="Voir Local vélos sur la carte"]')
    await bouton.trigger('click')
    expect(useLieuxStore().lieuChoisi).toBe('local-velos')
    expect(bouton.attributes('aria-pressed')).toBe('true')
    expect(bouton.text()).toBe('Affiché sur la carte')
    wrapper.unmount()
  })

  it('aucune violation d’accessibilité automatique', async () => {
    const wrapper = monter()
    expect(await violationsAccessibilite(document.body)).toEqual([])
    wrapper.unmount()
  })
})
