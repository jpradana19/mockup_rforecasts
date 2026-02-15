<template>
  <div ref="mapContainer" class="shadow-inner bg-slate-800 relative z-10 isolate w-full h-full" style="width: 100%; height: 100%; min-height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  segments: {
    type: Array, // Array of arrays of {lat, lng}
    default: () => []
  },
  routeId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['split', 'shift-boundary'])

const mapContainer = ref(null)
let map = null
let polylines = []
let markers = []

// Colors for segments
const segmentColors = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
]

const getSegmentColor = (idx) => segmentColors[idx % segmentColors.length]
const getSegmentName = (idx) => String.fromCharCode(65 + idx) // A, B, C...

onMounted(() => {
  if (!mapContainer.value) return

  // Fix Leaflet Icons
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })

  // Initialize Map
  map = L.map(mapContainer.value).setView([-6.200000, 106.816666], 5)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map)

  // Force resize in case container size was not ready
  setTimeout(() => {
    map.invalidateSize()
  }, 200)

  renderMap()
  fitBoundsToSegments()
})

onUnmounted(() => {
    if (map) {
        map.remove()
        map = null
    }
})

watch(() => props.segments, () => {
  renderMap()
}, { deep: true })

// Only fit bounds when route ID changes (new route loaded)
watch(() => props.routeId, () => {
   // Wait for segments to update (usually sync in parent, but good to be safe)
   setTimeout(() => {
       fitBoundsToSegments()
   }, 100)
})

const fitBoundsToSegments = () => {
    if (!map || !props.segments || props.segments.length === 0) return
    const allPoints = props.segments.flat().map(p => [p.lat, p.lng])
    if (allPoints.length > 0) {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50] })
    }
}

const renderMap = () => {
    if (!map) return
    
    // Cleanup Layers
    polylines.forEach(p => map.removeLayer(p))
    polylines = []
    markers.forEach(m => map.removeLayer(m))
    markers = []

    if (!props.segments || props.segments.length === 0) return

    // Render Segments
    props.segments.forEach((segPoints, segIdx) => {
        const color = getSegmentColor(segIdx)
        
        // Polyline
        const polyline = L.polyline(segPoints.map(p => [p.lat, p.lng]), {
            color: color,
            weight: 6,
            opacity: 0.8
        }).addTo(map)

        // Add invisible markers on top of points to handle clicks for splitting
        segPoints.forEach((p, pIdx) => {
            // Visualize split points (start of segment)
            if (pIdx === 0) {
                 // First point of first segment is Route Start (not draggable)
                 if (segIdx === 0) {
                     const marker = L.marker([p.lat, p.lng], {
                         title: `Start`
                     }).addTo(map)
                     marker.bindTooltip(`Start`, { permanent: true, direction: 'right' })
                     markers.push(marker)
                 } else {
                     // Start of other segments -> Draggable Boundary
                     // Use a distinct icon or color? For now standard marker but draggable.
                     const marker = L.marker([p.lat, p.lng], {
                         title: `Segment ${getSegmentName(segIdx)} Start`,
                         draggable: true
                     }).addTo(map)
                     
                     marker.bindTooltip(`Segment ${getSegmentName(segIdx)}`, { permanent: true, direction: 'right' })
                     
                     marker.on('dragend', (e) => {
                         const newLatLng = e.target.getLatLng()
                         emit('shift-boundary', { segmentIndex: segIdx, newLatLng })
                         
                         // Revert visual position until parent updates props
                         // Actually better to let parent update induce re-render
                         // But for smooth UX, maybe finding nearest point visually here?
                         // For now, let's rely on parent update.
                     })

                     markers.push(marker)
                 }
            } else if (pIdx === segPoints.length - 1) {
                // End of segment / Start of next (visualized by next segment start usually)
                if (segIdx === props.segments.length - 1) {
                     const marker = L.marker([p.lat, p.lng]).addTo(map)
                     marker.bindTooltip('End', { direction: 'right' })
                     markers.push(marker)
                }
            }

            // Invisible interaction circles for splitting
            // Skip start point (0) because splitting there creates an empty segment
            // Skip end point (length-1)
            if (pIdx > 0 && pIdx < segPoints.length - 1) {
                const circle = L.circleMarker([p.lat, p.lng], {
                    radius: 4,
                    color: '#fff',
                    fillColor: '#fff',
                    fillOpacity: 1.0,
                    weight: 1
                }).addTo(map)
                
                circle.on('click', () => {
                    // Emit split event
                     if (confirm(`Split Segment ${getSegmentName(segIdx)} here?`)) {
                        emit('split', { segmentIndex: segIdx, pointIndex: pIdx })
                     }
                })
                
                // Hover effect
                circle.on('mouseover', () => {
                    circle.setRadius(6)
                    circle.setStyle({ color: '#38bdf8' }) // sky-400
                })
                 circle.on('mouseout', () => {
                    circle.setRadius(4)
                    circle.setStyle({ color: '#fff' })
                })
    
                polylines.push(circle) // treat as layer to clear
            }
        })

        polylines.push(polyline)
    })
    
    // Fit bounds moved to fitBoundsToSegments and separate watcher
}
</script>
