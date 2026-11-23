import { describe, it, expect } from 'vitest'
import { filtrerLieux, libelleCategorie, lireLieux } from '../lieux'
import donnees from '@/donnees/lieux.json'

const point = (id: string, categorie: string, coordonnees: unknown = [2.35, 48.85]) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: coordonnees },
  properties: { id, nom: `Lieu ${id}`, categorie, adresse: 'Adresse fictive' },
})

describe('Lieux de la carte', () => {
  it('lit les points GeoJSON valides et ignore, sans planter, ceux qui sont incomplets', () => {
    const { lieux, ignores } = lireLieux({
      features: [point('a', 'salle'), point('b', 'inconnue'), point('c', 'accueil', ['x', 1]), { type: 'Feature' }],
    })
    expect(lieux).toEqual([{ id: 'a', nom: 'Lieu a', categorie: 'salle', adresse: 'Adresse fictive', description: '', position: [2.35, 48.85] }])
    expect(ignores).toBe(3)
    expect(lireLieux(null)).toEqual({ lieux: [], ignores: 0 })
  })

  it('filtre par catégories et trie par nom', () => {
    const { lieux } = lireLieux({ features: [point('z', 'salle'), point('b', 'accueil'), point('a', 'salle')] })
    expect(filtrerLieux(lieux, ['salle']).map((lieu) => lieu.id)).toEqual(['a', 'z'])
    expect(filtrerLieux(lieux, [])).toEqual([])
  })

  it('les données du projet sont toutes valides', () => {
    expect(lireLieux(donnees).ignores).toBe(0)
    expect(libelleCategorie('salle')).toBe('Salles de réunion')
  })
})
