<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import type { Map as CarteMapLibre, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// Le worker de MapLibre, construit par Vite (sinon introuvable une fois le site construit).
import adresseWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { formaterKm } from '@/lib/distance'
import { avertissementInondation, type StatutInondation } from '@/lib/inondation'
import { resumeLieu, type Lieu } from '@/lib/lieux'
import { styleCarte } from '@/lib/styleCarte'

/**
 * Carte MapLibre, fond « Plan IGN » de la Géoplateforme (data.geopf.fr). Elle double la liste
 * des lieux, qui reste l'alternative accessible (RGAA) : tout ce qui est sur la carte est dans la liste.
 */
const props = defineProps<{
  lieux: Lieu[]
  lieuChoisi: string | null
  distances?: Record<string, number>
  statutsInondation?: Record<string, StatutInondation>
}>()
const emit = defineEmits<{ choisir: [id: string] }>()

const conteneur = useTemplateRef<HTMLDivElement>('conteneur')
let carte: CarteMapLibre | null = null
let marqueurs: Marker[] = []
let maplibre: typeof import('maplibre-gl') | null = null

function textePopup(lieu: Lieu): string {
  const distance = props.distances?.[lieu.id]
  const avertissement = avertissementInondation(props.statutsInondation?.[lieu.id] ?? 'non-verifie')
  const resume = avertissement ? `${avertissement}. ${resumeLieu(lieu)}` : resumeLieu(lieu)
  return distance === undefined ? resume : `${resume} Distance à la commune choisie : ${formaterKm(distance)} (à vol d'oiseau).`
}

function afficherLieux(): void {
  if (!carte || !maplibre) return
  marqueurs.forEach((marqueur) => marqueur.remove())
  marqueurs = props.lieux.map((lieu) => {
    const marqueur = new maplibre!.Marker({ color: lieu.id === props.lieuChoisi ? '#e1000f' : '#000091' })
      .setLngLat(lieu.position)
      .setPopup(new maplibre!.Popup({ offset: 24 }).setText(textePopup(lieu)))
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
    style: styleCarte(),
    center: [-1.55, 47.22],
    zoom: 10,
    cooperativeGestures: true,
  })
  carte.addControl(new maplibre.NavigationControl({ showCompass: false }))
  carte.on('load', afficherLieux)
})

watch(() => [props.lieux, props.lieuChoisi, props.distances, props.statutsInondation] as const, afficherLieux)
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
