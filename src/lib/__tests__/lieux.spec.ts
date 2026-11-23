import { describe, it, expect } from 'vitest'
import { CATEGORIES, filtrerLieux, libelleCategorie, lienTelephone, lireLieux, ouiOuNon, resumeLieu, totalPlacesCouchees } from '../lieux'
import donnees from '@/donnees/lieux.json'

const proprietesCompletes = (id: string, categorie: string) => ({
  id,
  nom: `Lieu ${id}`,
  categorie,
  commune: 'Commune fictive',
  adresse: 'Adresse fictive',
  placesCouchees: 10,
  telephone: '02 99 00 00 00',
  accessibleMobiliteReduite: true,
  animauxAcceptes: false,
})

const point = (id: string, categorie: string, coordonnees: unknown = [2.35, 48.85], proprietes: Record<string, unknown> = {}) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: coordonnees },
  properties: { ...proprietesCompletes(id, categorie), ...proprietes },
})

describe('Lieux d’hébergement', () => {
  it('seuls deux types de lieux existent', () => {
    expect(CATEGORIES.map((categorie) => categorie.libelle)).toEqual(['Gymnases et salles des fêtes', 'Écoles et salles communales'])
  })

  it('lit tous les champs d’un lieu', () => {
    const { lieux } = lireLieux({ features: [point('a', 'ecole')] })
    expect(lieux).toEqual([
      {
        id: 'a',
        nom: 'Lieu a',
        categorie: 'ecole',
        commune: 'Commune fictive',
        adresse: 'Adresse fictive',
        placesCouchees: 10,
        telephone: '02 99 00 00 00',
        accessibleMobiliteReduite: true,
        animauxAcceptes: false,
        position: [2.35, 48.85],
      },
    ])
  })

  it('ignore, sans planter, un lieu incomplet ou invalide', () => {
    const { lieux, ignores } = lireLieux({
      features: [
        point('a', 'gymnase'),
        point('b', 'inconnue'),
        point('c', 'gymnase', ['x', 1]),
        point('d', 'gymnase', [2.35, 48.85], { placesCouchees: undefined }),
        point('e', 'gymnase', [2.35, 48.85], { telephone: undefined }),
        point('f', 'gymnase', [2.35, 48.85], { animauxAcceptes: 'oui' }),
        point('g', 'gymnase', [2.35, 48.85], { placesCouchees: -3 }),
        { type: 'Feature' },
      ],
    })
    expect(lieux.map((lieu) => lieu.id)).toEqual(['a'])
    expect(ignores).toBe(7)
    expect(lireLieux(null)).toEqual({ lieux: [], ignores: 0 })
  })

  it('filtre par type et trie par nom', () => {
    const { lieux } = lireLieux({ features: [point('z', 'ecole'), point('b', 'gymnase'), point('a', 'ecole')] })
    expect(filtrerLieux(lieux, ['ecole']).map((lieu) => lieu.id)).toEqual(['a', 'z'])
    expect(filtrerLieux(lieux, [])).toEqual([])
  })

  it('le total des places suit les lieux donnés', () => {
    const { lieux } = lireLieux({ features: [point('a', 'ecole', [1, 1], { placesCouchees: 40 }), point('b', 'gymnase', [1, 1], { placesCouchees: 120 })] })
    expect(totalPlacesCouchees(lieux)).toBe(160)
    expect(totalPlacesCouchees(filtrerLieux(lieux, ['ecole']))).toBe(40)
    expect(totalPlacesCouchees([])).toBe(0)
  })

  it('dit oui ou non en toutes lettres', () => {
    expect(ouiOuNon(true)).toBe('Oui')
    expect(ouiOuNon(false)).toBe('Non')
  })

  it('prépare le lien de téléphone et le résumé de la carte', () => {
    expect(lienTelephone('02 99 00 00 01')).toBe('tel:0299000001')
    const { lieux } = lireLieux({ features: [point('a', 'gymnase')] })
    const resume = resumeLieu(lieux[0]!)
    expect(resume).toContain('Places couchées : 10')
    expect(resume).toContain('Animaux acceptés : Non')
  })

  it('les données du projet sont toutes valides', () => {
    expect(lireLieux(donnees).ignores).toBe(0)
    expect(libelleCategorie('ecole')).toBe('Écoles et salles communales')
  })
})
