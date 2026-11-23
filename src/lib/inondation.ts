/** Situation d'un lieu face aux inondations. Tant qu'elle n'est pas connue, le lieu n'est jamais « sûr ». */
export type StatutInondation = 'inondable' | 'hors-zone' | 'non-verifie'

export const TEXTE_ZONE_INONDABLE = 'Zone inondable'
export const TEXTE_NON_VERIFIE = 'Zone inondable non vérifiée'

/** Texte d'avertissement d'un lieu ; vide pour un lieu vérifié hors zone. */
export function avertissementInondation(statut: StatutInondation): string {
  if (statut === 'inondable') return TEXTE_ZONE_INONDABLE
  if (statut === 'non-verifie') return TEXTE_NON_VERIFIE
  return ''
}

/** Lieux vérifiés hors zone inondable (un lieu non vérifié n'en fait jamais partie). */
export const garderHorsZoneInondable = <T extends { id: string }>(lieux: T[], statuts: Record<string, StatutInondation>): T[] =>
  lieux.filter((lieu) => statuts[lieu.id] === 'hors-zone')
