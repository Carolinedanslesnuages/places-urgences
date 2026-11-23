import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VueDsfr from '@gouvminint/vue-dsfr'
import CarteView from '../CarteView.vue'
import { useLieuxStore } from '@/stores/lieux'
import { violationsAccessibilite } from '@/__tests__/accessibilite'

// Pas d'appel réel à Géorisques dans ces tests (voir CarteViewInondation.spec.ts pour les zones inondables).
vi.mock('@/services/georisques', () => ({ estEnZoneInondable: vi.fn<() => Promise<boolean>>().mockRejectedValue(new Error('hors ligne')) }))

// La carte (WebGL) est remplacée : son contenu est vérifié dans le navigateur ; ici, la liste.
const monter = () =>
  mount(CarteView, {
    global: { plugins: [VueDsfr], stubs: { CarteLieux: { template: '<div role="region" aria-label="Carte des lieux"></div>' } } },
    attachTo: document.body,
  })

describe('Carte des lieux d’hébergement', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('liste tous les lieux, triés : l’alternative à la carte', () => {
    const wrapper = monter()
    const noms = wrapper.findAll('.liste-lieux h3').map((titre) => titre.text())
    expect(noms).toHaveLength(6)
    expect(noms).toEqual([...noms].sort((premier, second) => premier.localeCompare(second, 'fr')))
    expect(wrapper.find('h1').text()).toBe('Lieux d\'hébergement d\'urgence')
    wrapper.unmount()
  })

  it('montre pour chaque lieu : type, commune, adresse, places, téléphone, accès et animaux', () => {
    const wrapper = monter()
    const lieu = wrapper.findAll('.liste-lieux li').find((element) => element.text().includes('Gymnase de Rivebelle'))!
    expect(lieu.text()).toContain('Gymnases et salles des fêtes')
    expect(lieu.text()).toContain('Rivebelle (fictive) — 2 rue du Stade fictif, 44000 Rivebelle')
    expect(lieu.text()).toContain('Places couchées : 120')
    expect(lieu.text()).toContain('Téléphone de la commune : 02 99 00 00 01')
    expect(lieu.find('a').attributes('href')).toBe('tel:0299000001')
    expect(lieu.text()).toContain('Accessible aux personnes à mobilité réduite : Oui')
    expect(lieu.text()).toContain('Animaux acceptés : Non')
    wrapper.unmount()
  })

  it('écrit « Oui » ou « Non » en toutes lettres pour chaque lieu', () => {
    const wrapper = monter()
    const textes = wrapper.findAll('.liste-lieux li').map((element) => element.text())
    for (const texte of textes) {
      expect(texte).toMatch(/mobilité réduite : (Oui|Non)/)
      expect(texte).toMatch(/Animaux acceptés : (Oui|Non)/)
    }
    wrapper.unmount()
  })

  it('annonce le total des places, qui suit le filtre choisi', async () => {
    const wrapper = monter()
    expect(wrapper.find('[role="status"]').text()).toBe('6 lieux affichés — 480 places couchées au total')
    await wrapper.find('#categorie-gymnase').setValue(false)
    expect(wrapper.findAll('.liste-lieux h3').map((titre) => titre.text())).toEqual(['École Jules Exemple', 'École Marie Imaginaire', 'Salle communale de Valmer'])
    expect(wrapper.find('[role="status"]').text()).toBe('3 lieux affichés — 130 places couchées au total')
    await wrapper.find('#categorie-ecole').setValue(false)
    expect(wrapper.text()).toContain('Aucun lieu pour ces filtres')
    expect(wrapper.find('[role="status"]').text()).toBe('0 lieu affiché — 0 place couchée au total')
    wrapper.unmount()
  })

  it('propose uniquement les deux types de lieux comme filtres', () => {
    const wrapper = monter()
    const etiquettes = wrapper.findAll('fieldset label').map((etiquette) => etiquette.text())
    expect(etiquettes).toEqual(['Gymnases et salles des fêtes', 'Écoles et salles communales'])
    wrapper.unmount()
  })

  it('choisir un lieu dans la liste le désigne sur la carte', async () => {
    const wrapper = monter()
    const bouton = wrapper.find('button[aria-label="Voir Gymnase Pontclair sur la carte"]')
    await bouton.trigger('click')
    expect(useLieuxStore().lieuChoisi).toBe('gymnase-pontclair')
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
