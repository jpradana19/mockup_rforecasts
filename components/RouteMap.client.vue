<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full bg-gray-200 dark:bg-slate-800" style="min-height: 300px;"></div>

    <!-- Toolbox -->
    <div class="absolute top-3 left-3 z-[1000] flex flex-col gap-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl p-1.5 border border-gray-200 dark:border-slate-600">
      <!-- Line Mode -->
      <button
        @click="setMode('line')"
        :class="modeBtnCls('line')"
        class="tool-btn"
        title="Line Mode (L)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
      </button>

      <!-- Selection Mode -->
      <button
        @click="setMode('select')"
        :class="modeBtnCls('select')"
        class="tool-btn"
        title="Select Mode (V)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
        </svg>
      </button>

      <!-- Measure Mode -->
      <button
        @click="setMode('measure')"
        :class="modeBtnCls('measure')"
        class="tool-btn"
        title="Measure (M)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
          <rect x="2" y="8" width="20" height="8" rx="1" />
          <line x1="6" y1="8" x2="6" y2="12" />
          <line x1="10" y1="8" x2="10" y2="13" />
          <line x1="14" y1="8" x2="14" y2="12" />
          <line x1="18" y1="8" x2="18" y2="13" />
        </svg>
      </button>

      <div class="h-px bg-gray-200 dark:bg-slate-600 my-0.5"></div>

      <!-- Undo -->
      <button
        @click="emit('undo')"
        :disabled="!canUndo"
        :class="actionBtnCls(canUndo)"
        class="tool-btn"
        title="Undo (Ctrl+Z)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
      </button>

      <!-- Redo -->
      <button
        @click="emit('redo')"
        :disabled="!canRedo"
        :class="actionBtnCls(canRedo)"
        class="tool-btn"
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
        </svg>
      </button>
    </div>

    <!-- Measure Info Panel -->
    <div
      v-if="activeMode === 'measure' && measurePoints.length >= 2"
      class="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl px-3 py-2 border border-gray-200 dark:border-slate-600"
    >
      <div class="flex items-center gap-2 text-xs">
        <span class="text-gray-500 dark:text-slate-400">Jarak:</span>
        <span class="font-bold text-amber-600 dark:text-amber-400">{{ measureTotalKm }} km</span>
        <span class="text-gray-400 dark:text-slate-500">({{ measureTotalNm }} nm)</span>
        <button
          @click="clearMeasure"
          class="ml-1 p-0.5 text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
          title="Clear"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { calculateDistance } from '~/utils/routeMath'

const props = defineProps({
  segments: { type: Array, default: () => [] },
  editable: { type: Boolean, default: true },
  routeId: { type: String, default: '' },
  canUndo: { type: Boolean, default: false },
  canRedo: { type: Boolean, default: false },
  selectedPoint: { type: Object, default: null }
})

const emit = defineEmits([
  'add-point', 'insert-point', 'update-point',
  'delete-point', 'split', 'shift-boundary',
  'undo', 'redo'
])

const mapContainer = ref(null)
let map = null
let layers = []
let pointLayers = new Map()

const activeMode = ref('line')
const measurePoints = ref([])
let measureLayers = []

const segmentColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4'
]
const getColor = (idx) => segmentColors[idx % segmentColors.length]
const getSegName = (idx) => String.fromCharCode(65 + idx)

const createDotIcon = (color, size = 12, borderWidth = 2) => L.divIcon({
  className: '',
  html: `<div style="width:${size}px;height:${size}px;background:${color};border:${borderWidth}px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2]
})

const modeBtnCls = (mode) =>
  activeMode.value === mode
    ? 'bg-blue-600 text-white shadow-sm'
    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'

const actionBtnCls = (enabled) =>
  enabled
    ? 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
    : 'text-gray-300 dark:text-slate-600'

const setMode = (mode) => {
  if (mode === activeMode.value) return
  activeMode.value = mode
}

// --- Measure tool ---

const measureTotalKm = computed(() => {
  if (measurePoints.value.length < 2) return '0.0'
  let total = 0
  for (let i = 0; i < measurePoints.value.length - 1; i++) {
    const a = measurePoints.value[i]
    const b = measurePoints.value[i + 1]
    total += calculateDistance(a.lat, a.lng, b.lat, b.lng)
  }
  return total.toFixed(1)
})

const measureTotalNm = computed(() => (parseFloat(measureTotalKm.value) / 1.852).toFixed(1))

const addMeasurePoint = (latlng) => {
  measurePoints.value.push(latlng)
  renderMeasure()
}

const clearMeasure = () => {
  measurePoints.value = []
  clearMeasureLayers()
}

const clearMeasureLayers = () => {
  measureLayers.forEach(l => { try { map.removeLayer(l) } catch {} })
  measureLayers = []
}

const renderMeasure = () => {
  if (!map) return
  clearMeasureLayers()
  if (measurePoints.value.length === 0) return

  measurePoints.value.forEach((p) => {
    const m = L.circleMarker([p.lat, p.lng], {
      radius: 5, color: '#fff', fillColor: '#f59e0b', fillOpacity: 1, weight: 2
    }).addTo(map)
    measureLayers.push(m)
  })

  if (measurePoints.value.length >= 2) {
    const latlngs = measurePoints.value.map(p => [p.lat, p.lng])
    const polyline = L.polyline(latlngs, {
      color: '#f59e0b', weight: 3, dashArray: '8, 6', opacity: 0.9
    }).addTo(map)
    measureLayers.push(polyline)

    for (let i = 0; i < measurePoints.value.length - 1; i++) {
      const a = measurePoints.value[i]
      const b = measurePoints.value[i + 1]
      const dist = calculateDistance(a.lat, a.lng, b.lat, b.lng)
      const midLat = (a.lat + b.lat) / 2
      const midLng = (a.lng + b.lng) / 2
      const label = L.tooltip({ permanent: true, direction: 'center', className: 'measure-label' })
        .setLatLng([midLat, midLng])
        .setContent(`${dist.toFixed(1)} km`)
        .addTo(map)
      measureLayers.push(label)
    }
  }
}

// --- Selection mode: find insert index on polyline click ---

const pointToSegmentDist = (p, a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const proj = { x: a.x + t * dx, y: a.y + t * dy }
  return Math.sqrt((p.x - proj.x) ** 2 + (p.y - proj.y) ** 2)
}

const findInsertIndex = (segPoints, clickLatLng) => {
  if (!map || segPoints.length < 2) return 0
  let bestIdx = 0, minDist = Infinity
  for (let i = 0; i < segPoints.length - 1; i++) {
    const a = map.latLngToLayerPoint(L.latLng(segPoints[i].lat, segPoints[i].lng))
    const b = map.latLngToLayerPoint(L.latLng(segPoints[i + 1].lat, segPoints[i + 1].lng))
    const p = map.latLngToLayerPoint(clickLatLng)
    const dist = pointToSegmentDist(p, a, b)
    if (dist < minDist) { minDist = dist; bestIdx = i }
  }
  return bestIdx
}

// --- Cursor management ---

const updateCursor = () => {
  if (!map) return
  const container = map.getContainer()
  container.classList.remove('mode-line', 'mode-select', 'mode-measure')
  container.classList.add(`mode-${activeMode.value}`)
}

// --- Keyboard shortcuts ---

const handleKeyDown = (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return
  if (e.key === 'l' || e.key === 'L') setMode('line')
  else if (e.key === 'v' || e.key === 'V') setMode('select')
  else if (e.key === 'm' || e.key === 'M') setMode('measure')
  else if (e.key === 'Escape') {
    if (activeMode.value === 'measure') clearMeasure()
    setMode('line')
  }
  else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); emit('undo') }
  else if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && e.key.toLowerCase() === 'z') || e.key.toLowerCase() === 'y')) { e.preventDefault(); emit('redo') }
}

// --- Lifecycle ---

onMounted(() => {
  if (!mapContainer.value) return

  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })

  map = L.map(mapContainer.value, { zoomControl: false }).setView([-2.5, 118], 5)
  L.control.zoom({ position: 'topright' }).addTo(map)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map)

  map.on('click', (e) => {
    const latlng = { lat: e.latlng.lat, lng: e.latlng.lng }
    if (activeMode.value === 'line' && props.editable) {
      emit('add-point', latlng)
    } else if (activeMode.value === 'measure') {
      addMeasurePoint(latlng)
    }
  })

  map.on('contextmenu', (e) => {
    if (activeMode.value === 'measure' && measurePoints.value.length > 0) {
      measurePoints.value.pop()
      renderMeasure()
    }
  })

  updateCursor()
  setTimeout(() => map.invalidateSize(), 200)
  renderMap()
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (map) { map.remove(); map = null }
})

// --- Watchers ---

watch(() => activeMode.value, (newMode, oldMode) => {
  if (oldMode === 'measure') clearMeasure()
  updateCursor()
  renderMap()
})

watch(() => props.segments, () => renderMap(), { deep: true })
watch(() => props.routeId, () => { setTimeout(() => fitBounds(), 150) })

const applySelectedPointVisibility = () => {
  if (!map) return
  const sp = props.selectedPoint
  pointLayers.forEach((entry, key) => {
    const matches = !sp || `${sp.segmentIndex}-${sp.pointIndex}` === key
    try {
      if (matches) {
        if (!map.hasLayer(entry.layer)) map.addLayer(entry.layer)
      } else {
        if (map.hasLayer(entry.layer)) map.removeLayer(entry.layer)
      }
    } catch {}
  })
}

watch(() => props.selectedPoint, applySelectedPointVisibility, { deep: true })

// --- Map rendering ---

const fitBounds = () => {
  if (!map || !props.segments?.length) return
  const pts = props.segments.flat().map(p => [p.lat, p.lng])
  if (pts.length > 0) map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] })
}

const clearLayers = () => {
  pointLayers.clear()
  layers.forEach(l => { try { map.removeLayer(l) } catch {} })
  layers = []
}

const renderMap = () => {
  if (!map) return
  clearLayers()
  if (!props.segments?.length) return

  const mode = activeMode.value
  const totalSegs = props.segments.length
  const isSelect = mode === 'select'
  const isLine = mode === 'line'

  props.segments.forEach((segPoints, segIdx) => {
    if (!segPoints?.length) return
    const color = getColor(segIdx)

    // Polyline
    if (segPoints.length >= 2) {
      const polyline = L.polyline(segPoints.map(p => [p.lat, p.lng]), {
        color, weight: 5, opacity: 0.85, interactive: false
      }).addTo(map)
      layers.push(polyline)

      // In selection mode: wider invisible click target for inserting points
      if (isSelect) {
        const clickLine = L.polyline(segPoints.map(p => [p.lat, p.lng]), {
          color: 'transparent', weight: 20, opacity: 0, interactive: true
        }).addTo(map)
        clickLine.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          const idx = findInsertIndex(segPoints, e.latlng)
          emit('insert-point', {
            segmentIndex: segIdx, afterPointIndex: idx,
            lat: e.latlng.lat, lng: e.latlng.lng
          })
        })
        layers.push(clickLine)
      }
    }

    // Points
    segPoints.forEach((p, pIdx) => {
      const isStart = segIdx === 0 && pIdx === 0
      const isEnd = segIdx === totalSegs - 1 && pIdx === segPoints.length - 1
      const isBoundary = pIdx === 0 && segIdx > 0
      const isLastBeforeNext = pIdx === segPoints.length - 1 && segIdx < totalSegs - 1

      if (isLastBeforeNext) return

      if (isBoundary) {
        const m = L.marker([p.lat, p.lng], {
          draggable: isSelect,
          icon: createDotIcon(color, 16, 3)
        }).addTo(map)
        pointLayers.set(`${segIdx}-${pIdx}`, { layer: m })
        m.bindTooltip(`Seg ${getSegName(segIdx)}`, { permanent: true, direction: 'right', className: 'seg-tooltip' })
        if (isSelect) {
          m.on('dragend', (e) => emit('shift-boundary', { segmentIndex: segIdx, newLatLng: e.target.getLatLng() }))
        }
        if (mode !== 'measure') {
          m.on('contextmenu', (e) => { L.DomEvent.stopPropagation(e); emit('delete-point', { segmentIndex: segIdx, pointIndex: pIdx }) })
        }
        layers.push(m)
      } else if (isStart || isEnd) {
        const m = L.marker([p.lat, p.lng], {
          draggable: isSelect,
          icon: createDotIcon(isStart ? '#22c55e' : '#ef4444', 14, 2)
        }).addTo(map)
        pointLayers.set(`${segIdx}-${pIdx}`, { layer: m })
        m.bindTooltip(isStart ? 'Start' : 'End', { permanent: true, direction: 'right', className: 'seg-tooltip' })
        if (isSelect) {
          m.on('dragend', (e) => {
            const ll = e.target.getLatLng()
            emit('update-point', { segmentIndex: segIdx, pointIndex: pIdx, lat: ll.lat, lng: ll.lng })
          })
        }
        if (mode !== 'measure') {
          m.on('contextmenu', (e) => { L.DomEvent.stopPropagation(e); emit('delete-point', { segmentIndex: segIdx, pointIndex: pIdx }) })
        }
        layers.push(m)
      } else {
        // Interior points - always use marker so they can be dragged in both modes
        const m = L.marker([p.lat, p.lng], {
          draggable: props.editable,
          icon: createDotIcon(color, isLine ? 8 : 10, 2)
        }).addTo(map)
        pointLayers.set(`${segIdx}-${pIdx}`, { layer: m })
        m.on('dragend', (e) => {
          const ll = e.target.getLatLng()
          emit('update-point', { segmentIndex: segIdx, pointIndex: pIdx, lat: ll.lat, lng: ll.lng })
        })
        if (isSelect) {
          m.on('click', (e) => { L.DomEvent.stopPropagation(e); emit('split', { segmentIndex: segIdx, pointIndex: pIdx }) })
        }
        if (mode !== 'measure') {
          m.on('contextmenu', (e) => { L.DomEvent.stopPropagation(e); emit('delete-point', { segmentIndex: segIdx, pointIndex: pIdx }) })
        }
        layers.push(m)
      }
    })
  })
  nextTick(() => applySelectedPointVisibility())
}
</script>

<style>
.seg-tooltip {
  font-size: 10px !important;
  font-weight: 700 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
}
.measure-label {
  background: rgba(245, 158, 11, 0.9) !important;
  border: none !important;
  color: white !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 2px 8px !important;
  border-radius: 4px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
}
.measure-label::before {
  display: none !important;
}
.tool-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s;
}
.leaflet-container.mode-line,
.leaflet-container.mode-measure {
  cursor: crosshair !important;
}
</style>
