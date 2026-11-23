/**
 * Les lieux d'hébergement d'urgence affichés sur la carte : lecture du GeoJSON et règles de
 * filtrage (fonctions pures). Ajouter une catégorie = l'ajouter à CATEGORIES (libellé au pluriel).
 */
export const CATEGORIES = [
  { id: 'gymnase', libelle: 'Gymnases et salles des fêtes' },
  { id: 'ecole', libelle: 'Écoles et salles communales' },
] as const

export type IdCategorie = (typeof CATEGORIES)[number]['id']

export interface Lieu {
  id: string
  nom: string
  categorie: IdCategorie
  commune: string
  adresse: string
  /** Nombre de places couchées proposées par la commune. */
  placesCouchees: number
  /** Téléphone de la commune. */
  telephone: string
  accessibleMobiliteReduite: boolean
  animauxAcceptes: boolean
  /** [longitude, latitude] (ordre GeoJSON). */
  position: [number, number]
}

const estCategorie = (valeur: unknown): valeur is IdCategorie => CATEGORIES.some((categorie) => categorie.id === valeur)

const estNombreEntierPositif = (valeur: unknown): valeur is number => typeof valeur === 'number' && Number.isInteger(valeur) && valeur >= 0

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
      estCategorie(properties?.categorie) &&
      typeof properties?.commune === 'string' &&
      typeof properties?.adresse === 'string' &&
      estNombreEntierPositif(properties?.placesCouchees) &&
      typeof properties?.telephone === 'string' &&
      typeof properties?.accessibleMobiliteReduite === 'boolean' &&
      typeof properties?.animauxAcceptes === 'boolean'
    if (!valide) continue
    lieux.push({
      id: properties!.id as string,
      nom: properties!.nom as string,
      categorie: properties!.categorie as IdCategorie,
      commune: properties!.commune as string,
      adresse: properties!.adresse as string,
      placesCouchees: properties!.placesCouchees as number,
      telephone: properties!.telephone as string,
      accessibleMobiliteReduite: properties!.accessibleMobiliteReduite as boolean,
      animauxAcceptes: properties!.animauxAcceptes as boolean,
      position: [coordonnees![0] as number, coordonnees![1] as number],
    })
  }
  return { lieux, ignores: elements.length - lieux.length }
}

export function filtrerLieux(lieux: Lieu[], categories: IdCategorie[]): Lieu[] {
  return lieux.filter((lieu) => categories.includes(lieu.categorie)).sort((premier, second) => premier.nom.localeCompare(second.nom, 'fr'))
}

export const libelleCategorie = (id: IdCategorie) => CATEGORIES.find((categorie) => categorie.id === id)?.libelle ?? id

export const totalPlacesCouchees = (lieux: Lieu[]): number => lieux.reduce((total, lieu) => total + lieu.placesCouchees, 0)

export const ouiOuNon = (valeur: boolean): string => (valeur ? 'Oui' : 'Non')

/** Numéro utilisable dans un lien « tel: » (chiffres et + uniquement). */
export const lienTelephone = (telephone: string): string => `tel:${telephone.replace(/[^\d+]/g, '')}`

/** Texte d'un lieu pour la bulle de la carte : mêmes informations que la liste. */
export const resumeLieu = (lieu: Lieu): string =>
  `${lieu.nom} — ${lieu.commune}, ${lieu.adresse}. Places couchées : ${lieu.placesCouchees}. Téléphone : ${lieu.telephone}. ` +
  `Accessible mobilité réduite : ${ouiOuNon(lieu.accessibleMobiliteReduite)}. Animaux acceptés : ${ouiOuNon(lieu.animauxAcceptes)}.`
