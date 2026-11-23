import { describe, it, expect, afterEach, vi } from 'vitest'
import { adresseQuestionPosition, estEnZoneInondable } from '../georisques'

const reponseJson = (corps: unknown, ok = true, status = 200) => ({ ok, status, json: async () => corps }) as Response

describe('Service Géorisques', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('dit qu’une position est en zone inondable quand Géorisques renvoie un élément', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({ features: [{ type: 'Feature' }] })))
    expect(await estEnZoneInondable([-1.55, 47.22])).toBe(true)
  })

  it('dit qu’une position est hors zone quand Géorisques ne renvoie rien', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({ features: [] })))
    expect(await estEnZoneInondable([-1.55, 47.22])).toBe(false)
  })

  it('lève une erreur (jamais « hors zone ») si Géorisques est en panne ou répond de travers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({}, false, 503)))
    await expect(estEnZoneInondable([-1.55, 47.22])).rejects.toThrow('503')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({ erreur: 'x' })))
    await expect(estEnZoneInondable([-1.55, 47.22])).rejects.toThrow('inattendue')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('réseau')))
    await expect(estEnZoneInondable([-1.55, 47.22])).rejects.toThrow('réseau')
  })

  it('interroge la couche crue moyenne autour de la position (latitude avant longitude)', () => {
    const adresse = adresseQuestionPosition([-1.5, 47.2])
    expect(adresse).toContain('GetFeatureInfo')
    expect(adresse).toContain('BBOX=47.199950,-1.500050,47.200050,-1.499950')
  })
})
