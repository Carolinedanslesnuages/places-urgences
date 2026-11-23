/**
 * Les lieux affichés sur la carte : lecture du GeoJSON et règles de filtrage (fonctions pures).
 * Ajouter une catégorie = l'ajouter à CATEGORIES (libellé au pluriel pour les filtres).
 */
export const CATEGORIES = [
  { id: 'accueil', libelle: 'Accueils du public' },
  { id: 'salle', libelle: 'Salles de réunion' },
  { id: 'equipement', libelle: 'Équipements' },
] as const

export type IdCategorie = (typeof CATEGORIES)[number]['id']

export interface Lieu {
  id: string
  nom: string
  categorie: IdCategorie
  adresse: string
  description: string
  /** [longitude, latitude] (ordre GeoJSON). */
  position: [number, number]
}

const estCategorie = (valeur: unknown): valeur is IdCategorie => CATEGORIES.some((categorie) => categorie.id === valeur)

/** Lit un GeoJSON de points ; ignore (sans planter) un élément incomplet, en le signalant. */
export function lireLieux(geojson: unknown): { lieux: Lieu[]; ignores: number } {
  const elements = (geojson as { features?: unknown[] })?.features ?? []
  const lieux: Lieu[] = []
  for (const element of elements) {
    const { geometry, properties } = (element ?? {}) as { geometry?: { type?: string; coordinates?: unknown }; properties?: Record<string, unknown> }
    const coordonnees = geometry?.coordinates
    const valide =
      geometry?.type === 'Point' &&
      Array.isArray(coordonnees) &&
      coordonnees.length >= 2 &&
      coordonnees.slice(0, 2).every((nombre) => typeof nombre === 'number' && Number.isFinite(nombre)) &&
      typeof properties?.id === 'string' &&
      typeof properties?.nom === 'string' &&
      estCategorie(properties?.categorie)
    if (!valide) continue
    lieux.push({
      id: properties!.id as string,
      nom: properties!.nom as string,
      categorie: properties!.categorie as IdCategorie,
      adresse: typeof properties!.adresse === 'string' ? properties!.adresse : '',
      description: typeof properties!.description === 'string' ? properties!.description : '',
      position: [coordonnees![0] as number, coordonnees![1] as number],
    })
  }
  return { lieux, ignores: elements.length - lieux.length }
}

export function filtrerLieux(lieux: Lieu[], categories: IdCategorie[]): Lieu[] {
  return lieux.filter((lieu) => categories.includes(lieu.categorie)).sort((premier, second) => premier.nom.localeCompare(second.nom, 'fr'))
}

export const libelleCategorie = (id: IdCategorie) => CATEGORIES.find((categorie) => categorie.id === id)?.libelle ?? id
