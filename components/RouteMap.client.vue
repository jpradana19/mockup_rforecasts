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
let midpointMarkers = []
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
  // renderMidpoints is called inside renderMarkers
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

    // Click to show delete popup
    if (props.editable) {
        const popupContent = document.createElement('div')
        popupContent.className = 'p-1'
        
        const btn = document.createElement('button')
        btn.innerText = 'Hapus Titik'
        btn.className = 'text-xs text-red-500 font-bold hover:underline'
        btn.onclick = () => {
            const newPoints = [...props.points]
            newPoints.splice(index, 1)
            emit('update:points', newPoints)
            map.closePopup()
        }
        
        popupContent.appendChild(btn)
        marker.bindPopup(popupContent)
    }

    markers.push(marker)
  })
  
  renderMidpoints()
}

function renderMidpoints() {
  if (!map || !props.editable) return

  // Clear existing midpoint markers
  midpointMarkers.forEach(m => map.removeLayer(m))
  midpointMarkers = []

  if (props.points.length < 2) return

  for (let i = 0; i < props.points.length - 1; i++) {
      const p1 = props.points[i]
      const p2 = props.points[i+1]
      
      const midLat = (p1.lat + p2.lat) / 2
      const midLng = (p1.lng + p2.lng) / 2
      
      const marker = L.circleMarker([midLat, midLng], {
          radius: 5,
          color: '#3b82f6', // blue-500
          fillColor: '#3b82f6',
          fillOpacity: 0.5,
          opacity: 0.5,
          weight: 1
      }).addTo(map)
      
      marker.on('mouseover', () => {
          marker.setStyle({ radius: 8, fillOpacity: 0.8, opacity: 0.8 })
      })
      
      marker.on('mouseout', () => {
          marker.setStyle({ radius: 5, fillOpacity: 0.5, opacity: 0.5 })
      })
      
      marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          const newPoints = [...props.points]
          newPoints.splice(i + 1, 0, { lat: midLat, lng: midLng })
          emit('update:points', newPoints)
      })
      
      midpointMarkers.push(marker)
  }
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
