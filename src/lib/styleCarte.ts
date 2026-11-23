import type { StyleSpecification } from 'maplibre-gl'
import { ADRESSE_TUILES_ZONES_INONDABLES } from '@/services/georisques'

const FOND_PLAN_IGN =
  'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2' +
  '&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png'

/** Fond « Plan IGN », puis les zones inondables en bleu par-dessus ; les repères des lieux se posent au-dessus des deux. */
export const styleCarte = (): StyleSpecification => ({
  version: 8,
  sources: {
    planIgn: { type: 'raster', tiles: [FOND_PLAN_IGN], tileSize: 256, attribution: '© IGN – Géoplateforme' },
    zonesInondables: { type: 'raster', tiles: [ADRESSE_TUILES_ZONES_INONDABLES], tileSize: 256, attribution: 'Zones inondables : Géorisques' },
  },
  layers: [
    { id: 'plan-ign', type: 'raster', source: 'planIgn' },
    { id: 'zones-inondables', type: 'raster', source: 'zonesInondables', paint: { 'raster-opacity': 0.7 } },
  ],
})
