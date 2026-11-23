import type { Lieu } from '@/lib/lieux'

/** Distances « à vol d'oiseau » entre une commune et les lieux (fonctions pures). */
const RAYON_TERRE_KM = 6371

/** Distance à vol d'oiseau, en kilomètres, entre deux positions [longitude, latitude]. */
export function distanceKm(depart: [number, number], arrivee: [number, number]): number {
  const enRadians = (degres: number) => (degres * Math.PI) / 180
  const ecartLatitude = enRadians(arrivee[1] - depart[1])
  const ecartLongitude = enRadians(arrivee[0] - depart[0])
  const partie =
    Math.sin(ecartLatitude / 2) ** 2 +
    Math.cos(enRadians(depart[1])) * Math.cos(enRadians(arrivee[1])) * Math.sin(ecartLongitude / 2) ** 2
  return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(partie))
}

/** Trie du plus proche au plus lointain de la position donnée (sans modifier la liste d'origine). */
export function trierParDistance(lieux: Lieu[], position: [number, number]): Lieu[] {
  return [...lieux].sort((premier, second) => distanceKm(position, premier.position) - distanceKm(position, second.position))
}

/** « 12,4 km » */
export const formaterKm = (kilometres: number): string =>
  `${kilometres.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
