/** Recherche de communes : service public geo.api.gouv.fr (sans clé ni compte). */
export interface Commune {
  code: string
  nom: string
  /** [longitude, latitude] (ordre GeoJSON). */
  position: [number, number]
}

const ADRESSE_SERVICE = 'https://geo.api.gouv.fr/communes'
const NOMBRE_MAXIMUM_SUGGESTIONS = 8

/** Communes dont le nom commence par le texte saisi. Lève une erreur si le service ne répond pas. */
export async function rechercherCommunes(texteSaisi: string): Promise<Commune[]> {
  const debutDuNom = texteSaisi.trim()
  if (debutDuNom.length === 0) return []
  const adresse = `${ADRESSE_SERVICE}?nom=${encodeURIComponent(debutDuNom)}&fields=nom,code,centre&boost=population&limit=20`
  const reponse = await fetch(adresse)
  if (!reponse.ok) throw new Error(`Service des communes indisponible (${reponse.status})`)
  const resultats = (await reponse.json()) as { code: string; nom: string; centre?: { coordinates?: [number, number] } }[]
  const debutMinuscule = debutDuNom.toLocaleLowerCase('fr')
  return resultats
    .filter((resultat) => resultat.centre?.coordinates && resultat.nom.toLocaleLowerCase('fr').startsWith(debutMinuscule))
    .slice(0, NOMBRE_MAXIMUM_SUGGESTIONS)
    .map((resultat) => ({ code: resultat.code, nom: resultat.nom, position: resultat.centre!.coordinates! }))
}
