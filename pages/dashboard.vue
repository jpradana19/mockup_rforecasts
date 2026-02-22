<template>
  <div class="flex flex-col h-screen w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 overflow-hidden font-sans">

    <!-- Header Bar -->
    <header class="shrink-0 h-11 px-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 shadow-sm dark:shadow-none">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-400 dark:text-slate-400 mr-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <span class="text-sm font-semibold tracking-wide">Rute Pelayaran Analisis</span>
      </div>

      <!-- Theme Toggle -->
      <button
        @click="toggleTheme"
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-slate-400"
        :title="isDark ? 'Light Mode' : 'Dark Mode'"
      >
        <!-- Sun icon (shown in dark mode) -->
        <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
        <!-- Moon icon (shown in light mode) -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      </button>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex min-h-0">

      <!-- LEFT PANEL -->
      <aside class="w-[340px] shrink-0 flex flex-col bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700">

        <!-- Scrollable: Identification + Segments -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-0">

          <!-- Identification Card -->
          <div class="border border-gray-300 dark:border-slate-600 rounded-lg p-4 space-y-3 bg-white dark:bg-slate-900">

            <!-- Ship Name -->
            <div>
              <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Masukan Nama Kapal</label>
              <input
                v-model="shipName"
                type="text"
                placeholder="Nama Kapal..."
                class="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 outline-none"
              />
            </div>

            <!-- Departure -->
            <div>
              <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Tanggal Berangkat</label>
              <div class="flex gap-1.5">
                <input
                  v-model="departureTime"
                  type="datetime-local"
                  class="flex-1 h-9 px-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none min-w-0"
                />
                <select
                  v-model="departureZone"
                  class="w-[72px] h-9 px-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                >
                  <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
                </select>
              </div>
            </div>

            <!-- Arrival -->
            <div>
              <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Tanggal Tiba</label>
              <div class="flex gap-1.5">
                <input
                  v-model="arrivalTime"
                  type="datetime-local"
                  class="flex-1 h-9 px-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none min-w-0"
                />
                <select
                  v-model="arrivalZone"
                  class="w-[72px] h-9 px-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                >
                  <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
                </select>
              </div>
            </div>

            <!-- Stats: Speed, Duration, Distance -->
            <div class="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-end gap-6 text-xs">
              <div>
                <span class="text-gray-400 dark:text-slate-500 block">Kecepatan Kapal</span>
                <span class="font-semibold">{{ formattedSpeed }} Knot</span>
                <span class="text-gray-400 dark:text-slate-500 ml-2">{{ formattedDuration }}</span>
              </div>
              <div class="ml-auto text-right">
                <span class="text-gray-400 dark:text-slate-500 block">Jarak</span>
                <span class="font-semibold">{{ totalDistance.toFixed(0) }} km</span>
              </div>
            </div>
          </div>

          <!-- Segmen Section -->
          <div class="space-y-2">
            <span class="text-xs text-gray-500 dark:text-slate-400 font-semibold">Segmen</span>

            <div v-if="segments.length === 0" class="text-xs text-gray-400 dark:text-slate-500 text-center py-4 border border-gray-200 dark:border-slate-700 rounded-lg">
              Klik pada peta untuk menambahkan titik.
            </div>

            <!-- Segment Cards -->
            <div
              v-for="(stat, idx) in segmentStats"
              :key="idx"
              class="border border-gray-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-900 border-l-4"
              :style="{ borderLeftColor: getSegmentColor(idx) }"
            >
              <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-4 gap-y-1 text-xs items-baseline">
                <span class="text-gray-400 dark:text-slate-500 font-semibold">No</span>
                <span class="text-gray-400 dark:text-slate-500 font-semibold">Jarak</span>
                <span class="text-gray-400 dark:text-slate-500 font-semibold">Waktu Tempuh</span>
                <span class="text-gray-400 dark:text-slate-500 font-semibold">Interval</span>
                <span class="font-bold text-sm">{{ idx + 1 }}</span>
                <span>{{ stat.distance.toFixed(0) }} km</span>
                <span>{{ formatDuration(stat.duration) }}</span>
                <select
                  :value="segmentIntervals[idx] || '6H'"
                  @change="updateInterval(idx, $event.target.value)"
                  class="h-6 px-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-xs focus:border-blue-500 outline-none"
                >
                  <option value="1H">1H</option>
                  <option value="3H">3H</option>
                  <option value="6H">6H</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        <!-- Pinned Bottom: Route controls + Proses -->
        <div class="shrink-0 p-3 border-t border-gray-200 dark:border-slate-700 space-y-2 bg-white dark:bg-slate-800/50">
          <select
            v-model="selectedRouteId"
            @change="onRouteSelect"
            class="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-xs focus:border-blue-500 outline-none"
          >
            <option value="">Rute Baru</option>
            <option v-for="r in savedRoutes" :key="r.properties.id" :value="r.properties.id">
              {{ r.properties.name || 'Untitled' }}
            </option>
          </select>

          <div class="flex gap-2">
            <button
              @click="resetRoute"
              class="flex-1 h-8 text-xs font-semibold text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              Reset
            </button>
            <button
              @click="handleUndo"
              :disabled="!canUndo"
              class="flex-1 h-8 text-xs font-semibold text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
            >
              Undo
            </button>
            <button
              @click="handleRedo"
              :disabled="!canRedo"
              class="flex-1 h-8 text-xs font-semibold text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
            >
              Redo
            </button>
            <button
              v-if="segments.length > 1"
              @click="resetSegments"
              class="flex-1 h-8 text-xs font-semibold text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Seg
            </button>
          </div>

          <div class="flex gap-2">
            <button
              @click="saveRoute"
              :disabled="saving || allPoints.length < 2"
              class="flex-1 h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors disabled:opacity-40"
            >
              {{ saving ? '...' : 'Simpan' }}
            </button>
            <button
              v-if="currentRouteId"
              @click="deleteRoute"
              class="h-8 px-3 text-xs font-semibold text-red-500 dark:text-red-400 border border-red-300 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              Hapus
            </button>
          </div>

          <button
            @click="processRoute"
            :disabled="allPoints.length < 2"
            class="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded transition-colors disabled:opacity-30"
          >
            Proses
          </button>
        </div>
      </aside>

      <!-- RIGHT PANEL -->
      <div class="flex-1 flex flex-col min-w-0">

        <!-- Map Container -->
        <div class="flex-[3] relative min-h-0">
          <ClientOnly>
            <RouteMap
              :segments="segments"
              :editable="true"
              :route-id="currentRouteId || ''"
              :can-undo="canUndo"
              :can-redo="canRedo"
              @add-point="handleAddPoint"
              @insert-point="handleInsertPoint"
              @update-point="handleUpdatePoint"
              @delete-point="handleDeletePoint"
              @split="handleSplit"
              @shift-boundary="handleShiftBoundary"
              @undo="handleUndo"
              @redo="handleRedo"
              class="w-full h-full"
            />
          </ClientOnly>

          <div
            v-if="allPoints.length === 0"
            class="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur px-4 py-2 rounded-lg text-xs text-gray-500 dark:text-slate-400 shadow">
              Klik pada peta untuk memulai menggambar rute
            </div>
          </div>
        </div>

        <!-- List Points Container -->
        <div class="flex-[2] bg-gray-50 dark:bg-slate-900 flex flex-col min-h-0 p-3">
          <div class="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg flex flex-col min-h-0 overflow-hidden bg-white dark:bg-slate-900">
            <div class="px-4 pt-3 pb-2 shrink-0 border-b border-gray-200 dark:border-slate-700">
              <span class="text-sm font-bold">List Point</span>
            </div>

            <div class="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <div v-if="allPoints.length === 0" class="text-xs text-gray-400 dark:text-slate-500 text-center py-6">
                Belum ada titik.
              </div>

              <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-2">
                <div
                  v-for="(point, idx) in pointsWithSegmentInfo"
                  :key="idx"
                  class="p-2 rounded border border-l-4 text-center"
                  :style="{
                    borderLeftColor: getSegmentColor(point.segmentIndex),
                    backgroundColor: `${getSegmentColor(point.segmentIndex)}15`,
                    borderColor: `${getSegmentColor(point.segmentIndex)}40`
                  }"
                >
                  <div class="text-xs font-bold mb-0.5" :style="{ color: getSegmentColor(point.segmentIndex) }">{{ idx + 1 }}</div>
                  <div class="text-[10px] font-mono text-gray-700 dark:text-slate-300 leading-tight">{{ formatLng(point.lng) }}</div>
                  <div class="text-[10px] font-mono text-gray-500 dark:text-slate-400 leading-tight">{{ formatLat(point.lat) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { calculateDistance, formatSpeed, calculateSpeedVal } from '~/utils/routeMath'
import { fromZonedTime } from 'date-fns-tz'

const { logout } = useAuth()
const { isDark, toggle: toggleTheme } = useTheme()

const savedRoutes = ref([])
const currentRouteId = ref(null)
const selectedRouteId = ref('')
const saving = ref(false)

const shipName = ref('')
const departureTime = ref('')
const arrivalTime = ref('')
const departureZone = ref('UTC')
const arrivalZone = ref('UTC')

const segments = ref([])
const segmentIntervals = ref([])

const undoStack = ref([])
const redoStack = ref([])
const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

const snapshot = () => ({
  segments: JSON.parse(JSON.stringify(segments.value)),
  intervals: [...segmentIntervals.value]
})

const pushUndo = () => {
  undoStack.value.push(snapshot())
  if (undoStack.value.length > 50) undoStack.value.shift()
  redoStack.value = []
}

const handleUndo = () => {
  if (undoStack.value.length === 0) return
  redoStack.value.push(snapshot())
  const prev = undoStack.value.pop()
  segments.value = prev.segments
  segmentIntervals.value = prev.intervals
}

const handleRedo = () => {
  if (redoStack.value.length === 0) return
  undoStack.value.push(snapshot())
  const next = redoStack.value.pop()
  segments.value = next.segments
  segmentIntervals.value = next.intervals
}

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Jakarta', label: 'WIB' },
  { value: 'Asia/Makassar', label: 'WITA' },
  { value: 'Asia/Jayapura', label: 'WIT' },
  { value: 'Asia/Singapore', label: 'SGT' },
  { value: 'Asia/Tokyo', label: 'JST' },
  { value: 'Europe/London', label: 'GMT' },
  { value: 'America/New_York', label: 'EST' },
]

const segmentColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
const getSegmentColor = (idx) => segmentColors[idx % segmentColors.length]

const initDates = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  departureTime.value = now.toISOString().slice(0, 16)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  arrivalTime.value = tomorrow.toISOString().slice(0, 16)
}

const allPoints = computed(() => {
  const result = []
  segments.value.forEach((seg, idx) => {
    seg.forEach((p, pIdx) => {
      if (idx > 0 && pIdx === 0) return
      result.push(p)
    })
  })
  return result
})

const pointsWithSegmentInfo = computed(() => {
  const result = []
  segments.value.forEach((seg, segIdx) => {
    seg.forEach((p, pIdx) => {
      if (segIdx > 0 && pIdx === 0) return
      result.push({ ...p, segmentIndex: segIdx })
    })
  })
  return result
})

const totalDistance = computed(() => {
  const pts = allPoints.value
  if (pts.length < 2) return 0
  let d = 0
  for (let i = 0; i < pts.length - 1; i++) {
    d += calculateDistance(pts[i].lat, pts[i].lng, pts[i + 1].lat, pts[i + 1].lng)
  }
  return d
})

const totalDurationMs = computed(() => {
  if (!departureTime.value || !arrivalTime.value) return 0
  try {
    const start = fromZonedTime(departureTime.value, departureZone.value).getTime()
    const end = fromZonedTime(arrivalTime.value, arrivalZone.value).getTime()
    return Math.max(0, end - start)
  } catch { return 0 }
})

const formattedSpeed = computed(() => {
  const pts = allPoints.value.map(p => [p.lat, p.lng])
  const speed = calculateSpeedVal(pts, departureTime.value, arrivalTime.value, departureZone.value, arrivalZone.value)
  return formatSpeed(speed)
})

const formattedDuration = computed(() => formatDuration(totalDurationMs.value))

const segmentStats = computed(() => {
  return segments.value.map((seg, idx) => {
    let dist = 0
    for (let i = 0; i < seg.length - 1; i++) {
      dist += calculateDistance(seg[i].lat, seg[i].lng, seg[i + 1].lat, seg[i + 1].lng)
    }
    const td = totalDistance.value
    const duration = td > 0 ? (dist / td) * totalDurationMs.value : 0
    return { index: idx, distance: dist, duration, pointCount: seg.length }
  })
})

const formatDuration = (ms) => {
  if (!ms || ms <= 0) return '-'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const h = hours % 24
    return `${days} hari ${h} jam`
  }
  if (hours > 0) return `${hours} jam ${minutes} menit`
  return `${minutes} menit`
}

const formatLng = (lng) => `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`
const formatLat = (lat) => `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`

const updateInterval = (idx, value) => {
  segmentIntervals.value[idx] = value
}

const fetchRoutes = async () => {
  const { data } = await useFetch('/api/routes')
  if (data.value) savedRoutes.value = data.value
}

const handleAddPoint = (latlng) => {
  pushUndo()
  if (segments.value.length === 0) {
    segments.value.push([latlng])
    segmentIntervals.value.push('6H')
  } else {
    segments.value[segments.value.length - 1].push(latlng)
  }
}

const handleUpdatePoint = ({ segmentIndex, pointIndex, lat, lng }) => {
  const seg = segments.value[segmentIndex]
  if (!seg?.[pointIndex]) return
  pushUndo()
  seg[pointIndex] = { lat, lng }
  if (pointIndex === 0 && segmentIndex > 0) {
    const prev = segments.value[segmentIndex - 1]
    if (prev) prev[prev.length - 1] = { lat, lng }
  }
  if (pointIndex === seg.length - 1 && segmentIndex < segments.value.length - 1) {
    segments.value[segmentIndex + 1][0] = { lat, lng }
  }
}

const handleDeletePoint = ({ segmentIndex, pointIndex }) => {
  const seg = segments.value[segmentIndex]
  if (!seg) return
  pushUndo()
  seg.splice(pointIndex, 1)
  if (seg.length === 0) {
    segments.value.splice(segmentIndex, 1)
    segmentIntervals.value.splice(segmentIndex, 1)
  }
}

const handleSplit = ({ segmentIndex, pointIndex }) => {
  const seg = segments.value[segmentIndex]
  if (!seg || pointIndex <= 0 || pointIndex >= seg.length - 1) return
  if (!confirm('Split segmen di titik ini?')) return
  pushUndo()
  const seg1 = seg.slice(0, pointIndex + 1)
  const seg2 = seg.slice(pointIndex)
  const currentInterval = segmentIntervals.value[segmentIndex] || '6H'
  segments.value.splice(segmentIndex, 1, seg1, seg2)
  segmentIntervals.value.splice(segmentIndex, 1, currentInterval, '6H')
}

const handleShiftBoundary = ({ segmentIndex, newLatLng }) => {
  if (segmentIndex <= 0 || segmentIndex >= segments.value.length) return
  pushUndo()
  const prevSeg = segments.value[segmentIndex - 1]
  const currSeg = segments.value[segmentIndex]
  const combined = [...prevSeg, ...currSeg.slice(1)]
  let closestIdx = -1
  let minDist = Infinity
  combined.forEach((p, idx) => {
    const d = (p.lat - newLatLng.lat) ** 2 + (p.lng - newLatLng.lng) ** 2
    if (d < minDist) { minDist = d; closestIdx = idx }
  })
  if (closestIdx <= 0 || closestIdx >= combined.length - 1) return
  segments.value.splice(segmentIndex - 1, 2, combined.slice(0, closestIdx + 1), combined.slice(closestIdx))
}

const handleInsertPoint = ({ segmentIndex, afterPointIndex, lat, lng }) => {
  const seg = segments.value[segmentIndex]
  if (!seg) return
  pushUndo()
  seg.splice(afterPointIndex + 1, 0, { lat, lng })
}

const resetRoute = () => {
  segments.value = []
  segmentIntervals.value = []
  undoStack.value = []
  redoStack.value = []
  shipName.value = ''
  currentRouteId.value = null
  selectedRouteId.value = ''
  departureZone.value = 'UTC'
  arrivalZone.value = 'UTC'
  initDates()
}

const resetSegments = () => {
  pushUndo()
  const all = []
  segments.value.forEach((seg, idx) => {
    seg.forEach((p, pIdx) => {
      if (idx > 0 && pIdx === 0) return
      all.push({ ...p })
    })
  })
  if (all.length > 0) {
    segments.value = [all]
    segmentIntervals.value = ['6H']
  }
}


const onRouteSelect = () => {
  if (!selectedRouteId.value) {
    resetRoute()
    return
  }
  const route = savedRoutes.value.find(r => r.properties.id === selectedRouteId.value)
  if (route) loadRouteData(route)
}

const loadRouteData = (route) => {
  undoStack.value = []
  redoStack.value = []
  currentRouteId.value = route.properties.id
  selectedRouteId.value = route.properties.id
  shipName.value = route.properties.name || ''
  departureTime.value = route.properties.departureTime || ''
  arrivalTime.value = route.properties.arrivalTime || ''
  departureZone.value = route.properties.departureZone || route.properties.timezone || 'UTC'
  arrivalZone.value = route.properties.arrivalZone || route.properties.timezone || 'UTC'
  segments.value = []
  segmentIntervals.value = []
  if (route.type === 'FeatureCollection') {
    route.features.forEach((f) => {
      if (f.geometry?.coordinates) {
        segments.value.push(f.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })))
        segmentIntervals.value.push(f.properties?.interval || '6H')
      }
    })
  } else if (route.geometry?.coordinates) {
    segments.value.push(route.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })))
    segmentIntervals.value.push(route.properties?.interval || '6H')
  }
}

const saveRoute = async () => {
  if (allPoints.value.length < 2) return
  saving.value = true
  try {
    const baseProps = {
      name: shipName.value,
      departureTime: departureTime.value,
      arrivalTime: arrivalTime.value,
      departureZone: departureZone.value,
      arrivalZone: arrivalZone.value,
      speedKnots: formattedSpeed.value,
    }
    let geoJson
    if (segments.value.length <= 1) {
      geoJson = {
        type: 'Feature',
        properties: { ...baseProps, interval: segmentIntervals.value[0] || '6H' },
        geometry: { type: 'LineString', coordinates: (segments.value[0] || []).map(p => [p.lng, p.lat]) }
      }
    } else {
      geoJson = {
        type: 'FeatureCollection',
        properties: baseProps,
        features: segments.value.map((seg, idx) => ({
          type: 'Feature',
          properties: { segmentName: String.fromCharCode(65 + idx), segmentIndex: idx, interval: segmentIntervals.value[idx] || '6H' },
          geometry: { type: 'LineString', coordinates: seg.map(p => [p.lng, p.lat]) }
        }))
      }
    }
    let result
    if (currentRouteId.value) {
      result = await useFetch(`/api/routes/${currentRouteId.value}`, { method: 'PUT', body: geoJson })
    } else {
      result = await useFetch('/api/routes', { method: 'POST', body: geoJson })
    }
    if (!result.error.value) {
      await fetchRoutes()
      if (result.data.value?.id) {
        currentRouteId.value = result.data.value.id
        selectedRouteId.value = result.data.value.id
      }
      alert('Rute berhasil disimpan!')
    }
  } catch (e) {
    console.error(e)
    alert('Gagal menyimpan rute')
  } finally {
    saving.value = false
  }
}

const deleteRoute = async () => {
  if (!currentRouteId.value) return
  if (!confirm('Hapus rute ini?')) return
  try {
    const { error } = await useFetch(`/api/routes/${currentRouteId.value}`, { method: 'DELETE' })
    if (!error.value) {
      await fetchRoutes()
      resetRoute()
    }
  } catch (e) {
    console.error(e)
    alert('Gagal menghapus rute')
  }
}

const processRoute = () => {
  alert('Fitur proses dalam pengembangan.')
}

onMounted(() => {
  fetchRoutes()
  initDates()
})
</script>
