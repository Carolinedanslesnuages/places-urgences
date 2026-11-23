/**
 * Zones inondables, scénario « crue moyenne » : service public Géorisques (WMS, sans clé ni compte).
 * Le nom de la couche est isolé ici : c'est le seul endroit à changer si Géorisques le renomme.
 */
const ADRESSE_SERVICE = 'https://mapsref.brgm.fr/wxs/georisques/risques'
export const COUCHE_CRUE_MOYENNE = 'TRI_ZONE_INOND_MOY'
/** Demi-côté (en degrés) de la petite fenêtre interrogée autour d'un lieu : quelques mètres. */
const DEMI_COTE_DEGRES = 0.00005

/** Modèle d'adresse des tuiles bleues pour la carte ({bbox-epsg-3857} est remplacé par MapLibre). */
export const ADRESSE_TUILES_ZONES_INONDABLES =
  `${ADRESSE_SERVICE}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${COUCHE_CRUE_MOYENNE}&STYLES=` +
  '&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}'

/** Adresse qui demande à Géorisques ce qui se trouve exactement à cette position. */
export function adresseQuestionPosition([longitude, latitude]: [number, number]): string {
  // En WMS 1.3.0 avec EPSG:4326, l'ordre de la fenêtre est latitude puis longitude.
  const fenetre = [latitude - DEMI_COTE_DEGRES, longitude - DEMI_COTE_DEGRES, latitude + DEMI_COTE_DEGRES, longitude + DEMI_COTE_DEGRES]
    .map((degres) => degres.toFixed(6))
    .join(',')
  return (
    `${ADRESSE_SERVICE}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=${COUCHE_CRUE_MOYENNE}&QUERY_LAYERS=${COUCHE_CRUE_MOYENNE}` +
    `&STYLES=&CRS=EPSG:4326&BBOX=${fenetre}&WIDTH=3&HEIGHT=3&I=1&J=1&INFO_FORMAT=application/json&FEATURE_COUNT=1`
  )
}

/** Vrai si la position est dans une zone inondable. Lève une erreur si Géorisques ne répond pas. */
export async function estEnZoneInondable(position: [number, number]): Promise<boolean> {
  const reponse = await fetch(adresseQuestionPosition(position))
  if (!reponse.ok) throw new Error(`Géorisques indisponible (${reponse.status})`)
  const resultat = (await reponse.json()) as { features?: unknown[] }
  if (!Array.isArray(resultat.features)) throw new Error('Réponse Géorisques inattendue')
  return resultat.features.length > 0
}
