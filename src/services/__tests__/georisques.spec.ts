import { describe, it, expect, afterEach, vi } from 'vitest'
import { adresseQuestionPosition, estEnZoneInondable } from '../georisques'

const reponseGml = (corps: string, ok = true, status = 200) => ({ ok, status, text: async () => corps }) as Response
const GML_HORS_ZONE = '<?xml version="1.0"?><msGMLOutput></msGMLOutput>'
const GML_EN_ZONE = '<msGMLOutput><ALEA_SYNT_01_02MOY_layer><ALEA_SYNT_01_02MOY_feature></ALEA_SYNT_01_02MOY_feature></ALEA_SYNT_01_02MOY_layer></msGMLOutput>'

describe('Service Géorisques', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('dit qu’une position est en zone inondable quand Géorisques renvoie un élément', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseGml(GML_EN_ZONE)))
    expect(await estEnZoneInondable([-1.55, 47.22])).toBe(true)
  })

  it('dit qu’une position est hors zone quand Géorisques ne renvoie rien', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseGml(GML_HORS_ZONE)))
    expect(await estEnZoneInondable([-1.55, 47.22])).toBe(false)
  })

  it('lève une erreur (jamais « hors zone ») si Géorisques est en panne ou répond de travers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseGml('', false, 503)))
    await expect(estEnZoneInondable([-1.55, 47.22])).rejects.toThrow('503')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseGml('<html>erreur</html>')))
    await expect(estEnZoneInondable([-1.55, 47.22])).rejects.toThrow('inattendue')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('réseau')))
    await expect(estEnZoneInondable([-1.55, 47.22])).rejects.toThrow('réseau')
  })

  it('interroge la couche crue moyenne autour de la position (latitude avant longitude)', () => {
    const adresse = adresseQuestionPosition([-1.5, 47.2])
    expect(adresse).toContain('GetFeatureInfo')
    expect(adresse).toContain('QUERY_LAYERS=ALEA_SYNT_01_02MOY')
    expect(adresse).toContain('BBOX=47.199950,-1.500050,47.200050,-1.499950')
  })
})
