import { describe, it, expect } from 'vitest'
import { distanceKm, formaterKm, trierParDistance } from '../distance'
import { lireLieux } from '../lieux'
import donnees from '@/donnees/lieux.json'

describe('Distances à vol d’oiseau', () => {
  it('donne 0 pour deux positions identiques', () => {
    expect(distanceKm([-1.55, 47.22], [-1.55, 47.22])).toBe(0)
  })

  it('donne environ 111 km pour un degré de latitude', () => {
    expect(distanceKm([0, 47], [0, 48])).toBeGreaterThan(110.5)
    expect(distanceKm([0, 47], [0, 48])).toBeLessThan(111.5)
  })

  it('trie les lieux du plus proche au plus lointain, sans modifier la liste d’origine', () => {
    const { lieux } = lireLieux(donnees)
    const pontclair: [number, number] = [-1.62, 47.19]
    const ordre = trierParDistance(lieux, pontclair).map((lieu) => distanceKm(pontclair, lieu.position))
    expect(ordre).toEqual([...ordre].sort((premier, second) => premier - second))
    expect(trierParDistance(lieux, pontclair)[0]!.id).toBe('gymnase-pontclair')
    expect(lieux[0]!.id).toBe('gymnase-rivebelle')
  })

  it('écrit la distance en kilomètres avec une virgule', () => {
    expect(formaterKm(12.44)).toBe('12,4 km')
  })
})
