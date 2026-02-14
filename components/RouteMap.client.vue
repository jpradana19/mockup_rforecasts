<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  points: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false },
  segments: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:points', 'add-point'])

const mapContainer = ref(null)
let map = null
let polylineLayer = null
let segmentLayers = L.layerGroup()
let markersLayer = L.layerGroup()

const fixLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
}

onMounted(async () => {
  await nextTick()
  if (!mapContainer.value) return
  
  fixLeafletIcons()
  
  // Create map
  map = L.map(mapContainer.value, {
      zoomControl: false,
      attributionControl: false
  }).setView([-2.5, 118], 5)

  // OpenStreetMap Standard (Terang)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
  }).addTo(map)
  
  L.control.zoom({ position: 'topright' }).addTo(map)

  segmentLayers.addTo(map)
  markersLayer.addTo(map)

  map.on('click', (e) => {
    if (props.editable) {
       emit('add-point', { lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })

  // Force resize trigger
  setTimeout(() => { map.invalidateSize() }, 100)
  setTimeout(() => { map.invalidateSize() }, 500)

  drawRoute()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(() => props.points, () => drawRoute(), { deep: true })
watch(() => props.segments, () => drawRoute(), { deep: true })

const drawRoute = () => {
    if (!map) return

    if (polylineLayer) map.removeLayer(polylineLayer)
    segmentLayers.clearLayers()
    markersLayer.clearLayers()

    if (props.points.length === 0) return

    const latlngs = props.points.map(p => [p.lat, p.lng])

    if (props.editable || props.segments.length === 0) {
        polylineLayer = L.polyline(latlngs, {
            color: '#2563eb', // Blue-600
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10'
        }).addTo(map)
    } else {
        props.segments.forEach(seg => {
            const color = seg.day === 1 ? '#2563eb' : (seg.day === 2 ? '#f59e0b' : '#64748b')
            L.polyline(seg.path, {
                color: color,
                weight: 5,
                opacity: 0.9
            }).addTo(segmentLayers)
        })
    }

    props.points.forEach((p, index) => {
        const isStart = index === 0
        const isEnd = index === props.points.length - 1
        const fillColor = isStart ? '#10b981' : (isEnd ? '#ef4444' : '#fff')
        
        const circle = L.circleMarker([p.lat, p.lng], {
            radius: 6,
            fillColor: fillColor,
            color: '#1e293b',
            weight: 2,
            opacity: 1,
            fillOpacity: 1
        })
        markersLayer.addLayer(circle)
    })
    
    if (latlngs.length > 0) {
       setTimeout(() => {
          const bounds = L.latLngBounds(latlngs)
          if(bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
       }, 100)
    }
}
</script>

<style scoped>
/* Force styling to ensure map is visible */
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-color: #e2e8f0; /* slate-200 fallback */
}
</style>

<style>
/* Global overrides for Leaflet */
.leaflet-container {
    z-index: 0 !important;
    background: #e2e8f0;
}
</style>