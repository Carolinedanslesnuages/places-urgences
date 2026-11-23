<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import type { Map as CarteMapLibre, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// Le worker de MapLibre, construit par Vite (sinon introuvable une fois le site construit).
import adresseWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { Lieu } from '@/lib/lieux'

/**
 * Carte MapLibre, fond « Plan IGN » de la Géoplateforme (data.geopf.fr). Elle double la liste
 * des lieux, qui reste l'alternative accessible (RGAA) : tout ce qui est sur la carte est dans la liste.
 */
const props = defineProps<{ lieux: Lieu[]; lieuChoisi: string | null }>()
const emit = defineEmits<{ choisir: [id: string] }>()

const conteneur = useTemplateRef<HTMLDivElement>('conteneur')
let carte: CarteMapLibre | null = null
let marqueurs: Marker[] = []
let maplibre: typeof import('maplibre-gl') | null = null

const FOND_PLAN_IGN =
  'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2' +
  '&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png'

function afficherLieux(): void {
  if (!carte || !maplibre) return
  marqueurs.forEach((marqueur) => marqueur.remove())
  marqueurs = props.lieux.map((lieu) => {
    const marqueur = new maplibre!.Marker({ color: lieu.id === props.lieuChoisi ? '#e1000f' : '#000091' })
      .setLngLat(lieu.position)
      .setPopup(new maplibre!.Popup({ offset: 24 }).setText(`${lieu.nom} — ${lieu.adresse}`))
      .addTo(carte!)
    const element = marqueur.getElement()
    element.setAttribute('aria-label', lieu.nom)
    element.addEventListener('click', () => emit('choisir', lieu.id))
    return marqueur
  })
  if (props.lieux.length) {
    const limites = new maplibre.LngLatBounds()
    props.lieux.forEach((lieu) => limites.extend(lieu.position))
    carte.fitBounds(limites, { padding: 60, maxZoom: 15, duration: 0 })
  }
}

onMounted(async () => {
  // Chargé à la demande : MapLibre a besoin de WebGL (absent des tests, présent dans le navigateur).
  maplibre = await import('maplibre-gl')
  maplibre.setWorkerUrl(adresseWorker)
  if (!conteneur.value) return
  carte = new maplibre.Map({
    container: conteneur.value,
    style: {
      version: 8,
      sources: {
        planIgn: { type: 'raster', tiles: [FOND_PLAN_IGN], tileSize: 256, attribution: '© IGN – Géoplateforme' },
      },
      layers: [{ id: 'plan-ign', type: 'raster', source: 'planIgn' }],
    },
    center: [2.35, 48.86],
    zoom: 11,
    cooperativeGestures: true,
  })
  carte.addControl(new maplibre.NavigationControl({ showCompass: false }))
  carte.on('load', afficherLieux)
})

watch(() => [props.lieux, props.lieuChoisi] as const, afficherLieux)
watch(
  () => props.lieuChoisi,
  (id) => {
    const lieu = props.lieux.find((candidat) => candidat.id === id)
    if (lieu && carte) carte.flyTo({ center: lieu.position, zoom: 15, essential: false })
  },
)
onUnmounted(() => carte?.remove())
</script>

<template>
  <div
    ref="conteneur"
    class="carte"
    role="region"
    aria-label="Carte des lieux (la liste des lieux donne les mêmes informations)"
  />
</template>

<style scoped>
.carte {
  width: 100%;
  height: 32rem;
  min-height: 20rem;
}
@media (prefers-reduced-motion: reduce) {
  .carte :deep(*) {
    transition: none !important;
  }
}
</style>
