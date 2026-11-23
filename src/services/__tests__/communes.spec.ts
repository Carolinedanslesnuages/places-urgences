import { describe, it, expect, vi, afterEach } from 'vitest'
import { rechercherCommunes } from '../communes'

const reponseDuService = (corps: unknown, ok = true) => ({ ok, status: ok ? 200 : 503, json: async () => corps }) as Response

describe('Recherche de communes', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('ne garde que les communes dont le nom commence par la saisie', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        reponseDuService([
          { code: '44109', nom: 'Nantes', centre: { coordinates: [-1.55, 47.21] } },
          { code: '44001', nom: 'Anan', centre: { coordinates: [1, 43] } },
          { code: '44002', nom: 'Nanterre', centre: { coordinates: [2.2, 48.9] } },
        ]),
      ),
    )
    const communes = await rechercherCommunes('Nan')
    expect(communes.map((commune) => commune.nom)).toEqual(['Nantes', 'Nanterre'])
    expect(communes[0]!.position).toEqual([-1.55, 47.21])
  })

  it('n’appelle pas le service pour une saisie vide', async () => {
    const appel = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', appel)
    expect(await rechercherCommunes('  ')).toEqual([])
    expect(appel).not.toHaveBeenCalled()
  })

  it('lève une erreur si le service répond en erreur', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(reponseDuService([], false)))
    await expect(rechercherCommunes('Nan')).rejects.toThrow('Service des communes indisponible')
  })
})
