<template>
  <div ref="mapContainer" class="shadow-inner bg-slate-800 relative z-10 isolate" style="width: 100%; height: 100%; min-height: 400px;"></div>
</template>

<script setup>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  },
  segments: {
    type: Array,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:points', 'add-point'])

const mapContainer = ref(null)
let map = null
let markers = []
let polylines = []

// Fix Leaflet icon issue in Nuxt/Webpack env
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

onMounted(() => {
  console.log('RouteMap mounted')
  if (!mapContainer.value) return

  fixLeafletIcons()
  
  // Initialize Map
  map = L.map(mapContainer.value).setView([-6.200000, 106.816666], 5)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map)

  // Click handler
  map.on('click', (e) => {
    if (props.editable) {
      emit('add-point', { lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })

  // Force resize in case container size was not ready
  setTimeout(() => {
    map.invalidateSize()
  }, 200)

  // Initial render
  renderMarkers()
  renderSegments()
})

onUnmounted(() => {
    if (map) {
        map.remove()
        map = null
    }
})

// Watchers
watch(() => props.points, () => {
  renderMarkers()
}, { deep: true })

watch(() => props.segments, () => {
  renderSegments()
}, { deep: true })

watch(() => props.editable, () => {
  renderMarkers()
})

function renderMarkers() {
  if (!map) return

  // Clear existing markers
  markers.forEach(m => map.removeLayer(m))
  markers = []

  props.points.forEach((p, index) => {
    const marker = L.marker([p.lat, p.lng], {
      draggable: props.editable
    }).addTo(map)

    marker.on('dragend', (e) => {
      const newLatLng = e.target.getLatLng()
      const newPoints = [...props.points]
      newPoints[index] = { lat: newLatLng.lat, lng: newLatLng.lng }
      emit('update:points', newPoints)
    })
    
    // Right click to delete
    marker.on('contextmenu', () => {
        if (props.editable) {
            const newPoints = [...props.points]
            newPoints.splice(index, 1)
            emit('update:points', newPoints)
        }
    })

    markers.push(marker)
  })
}

function renderSegments() {
  if (!map) return

  // Clear existing polylines
  polylines.forEach(p => map.removeLayer(p))
  polylines = []

  props.segments.forEach(seg => {
    const polyline = L.polyline(seg.coords, {
      color: seg.color,
      weight: 4,
      opacity: 0.8
    }).addTo(map)
    polylines.push(polyline)
  })
}
</script>

<style scoped>
</style>
