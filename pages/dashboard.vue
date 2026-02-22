<template>
  <div class="flex flex-col h-screen w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 overflow-hidden font-sans">

    <!-- Header Bar -->
    <header class="shrink-0 h-11 px-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] z-10">
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
      <aside class="w-[340px] shrink-0 flex flex-col bg-gray-100 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 panel-raised">

        <!-- Scrollable: Identification + Segments -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-0">

          <!-- Identification Card -->
          <div class="border border-gray-200 dark:border-slate-600 rounded-xl p-4 space-y-3 bg-white dark:bg-slate-800/90 card-elevated-md">

            <!-- Ship Name -->
            <div>
              <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Masukan Nama Kapal</label>
              <input
                v-model="shipName"
                type="text"
                placeholder="Nama Kapal..."
                class="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 outline-none input-inset"
              />
            </div>

            <!-- Departure -->
            <div>
              <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">Tanggal Berangkat</label>
              <div class="flex gap-1.5">
                <input
                  v-model="departureTime"
                  type="datetime-local"
                  class="flex-1 h-9 px-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none min-w-0 input-inset"
                />
                <select
                  v-model="departureZone"
                  class="w-[72px] h-9 px-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none input-inset"
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
                  class="flex-1 h-9 px-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none min-w-0 input-inset"
                />
                <select
                  v-model="arrivalZone"
                  class="w-[72px] h-9 px-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none input-inset"
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

            <div v-if="segments.length === 0" class="text-xs text-gray-400 dark:text-slate-500 text-center py-4 border border-gray-200 dark:border-slate-600 rounded-xl card-inset">
              Klik pada peta untuk menambahkan titik.
            </div>

            <!-- Segment Cards -->
            <div
              v-for="(stat, idx) in segmentStats"
              :key="idx"
              class="border border-gray-200 dark:border-slate-600 rounded-xl p-3 bg-white dark:bg-slate-800/90 border-l-4 card-elevated"
              :style="{ borderLeftColor: getSegmentColor(idx) }"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-4 gap-y-1 text-xs items-baseline flex-1 min-w-0">
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
                  class="h-6 px-1 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-xs focus:border-blue-500 outline-none input-inset"
                >
                    <option value="1H">1H</option>
                    <option value="3H">3H</option>
                    <option value="6H">6H</option>
                  </select>
                </div>
                <button
                  @click="deleteSegment(idx)"
                  :disabled="segments.length <= 1"
                  class="shrink-0 p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Hapus segmen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
              <div class="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span class="text-gray-400 dark:text-slate-500 font-semibold">Tanggal Mulai</span>
                <span class="text-gray-400 dark:text-slate-500 font-semibold">Tanggal Selesai</span>
                <span class="font-mono text-[11px] text-gray-700 dark:text-slate-300">{{ formatSegmentDateTime(stat.startDate, departureZone) }}</span>
                <span class="font-mono text-[11px] text-gray-700 dark:text-slate-300">{{ formatSegmentDateTime(stat.endDate, departureZone) }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Pinned Bottom: Route controls + Proses -->
        <div class="shrink-0 p-3 border-t border-gray-200 dark:border-slate-700 space-y-2 bg-white dark:bg-slate-800/80 card-elevated-md shadow-[0_-2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.25)]">
          <select
            v-model="selectedRouteId"
            @change="onRouteSelect"
            class="w-full h-9 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-xs focus:border-blue-500 outline-none input-inset"
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

          <button
            @click="showGeoJsonModal = true"
            :disabled="allPoints.length < 2"
            class="w-full h-8 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-30"
          >
            Preview GeoJSON
          </button>
        </div>
      </aside>

      <!-- RIGHT PANEL -->
      <div class="flex-1 flex flex-col min-w-0 p-3 gap-3 bg-gray-100 dark:bg-slate-900">
        <!-- Map Container -->
        <div class="flex-[3] relative min-h-[180px] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 shadow-lg dark:shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
          <ClientOnly>
            <RouteMap
              :segments="segments"
              :editable="true"
              :route-id="currentRouteId || ''"
              :can-undo="canUndo"
              :can-redo="canRedo"
              :selected-point="selectedPoint"
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
            <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur px-4 py-3 rounded-xl text-xs text-gray-500 dark:text-slate-400 shadow-lg border border-gray-200/50 dark:border-slate-600/50">
              Klik pada peta untuk memulai menggambar rute
            </div>
          </div>
        </div>

        <!-- List Points Container -->
        <div class="flex-[2] flex flex-col min-h-[100px]">
          <div class="flex-1 border border-gray-200 dark:border-slate-600 rounded-xl flex flex-col min-h-0 overflow-hidden bg-white dark:bg-slate-800/90 card-elevated-md h-full">
            <div class="px-4 pt-3 pb-2 shrink-0 border-b border-gray-200 dark:border-slate-700">
              <span class="text-sm font-bold">List Point</span>
            </div>

            <div class="flex-1 overflow-y-auto p-3 custom-scrollbar min-h-0">
              <div v-if="allPoints.length === 0" class="text-xs text-gray-400 dark:text-slate-500 text-center py-6">
                Belum ada titik.
              </div>

              <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-2">
                <div
                  v-for="(point, idx) in pointsWithSegmentInfo"
                  :key="idx"
                  class="p-2 rounded-lg border border-l-4 text-center card-elevated relative cursor-pointer transition-all"
                  :class="{ 'ring-2 ring-blue-500 ring-offset-1': selectedPoint && selectedPoint.segmentIndex === point.mapSegmentIndex && selectedPoint.pointIndex === point.mapPointIndex }"
                  :style="{
                    borderLeftColor: getSegmentColor(point.segmentIndex),
                    backgroundColor: `${getSegmentColor(point.segmentIndex)}15`,
                    borderColor: `${getSegmentColor(point.segmentIndex)}40`
                  }"
                  @click="toggleSelectedPoint(point)"
                >
                  <button
                    @click.stop="handleDeletePoint({ segmentIndex: point.segmentIndex, pointIndex: point.pointIndex })"
                    class="absolute top-1 right-1 p-0.5 rounded text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="Hapus titik"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
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

    <!-- Preview GeoJSON Modal -->
    <Teleport to="body">
      <div
        v-if="showGeoJsonModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
        @click.self="showGeoJsonModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl card-elevated-lg shadow-2xl border border-gray-200 dark:border-slate-600 flex flex-col w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div class="px-4 py-3 shrink-0 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <span class="text-sm font-bold">Preview GeoJSON</span>
            <button
              @click="showGeoJsonModal = false"
              class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
              title="Tutup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
            <pre v-if="previewGeoJson" class="text-xs font-mono text-gray-700 dark:text-slate-300 whitespace-pre-wrap break-all">{{ previewGeoJson }}</pre>
            <div v-else class="text-xs text-gray-400 dark:text-slate-500 text-center py-8">
              Belum ada data.
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { calculateDistance, formatSpeed, calculateSpeedVal } from '~/utils/routeMath'
import { format } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

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
const showGeoJsonModal = ref(false)
const selectedPoint = ref(null)

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
      const isBoundary = pIdx === seg.length - 1 && segIdx < segments.value.length - 1
      const mapSegmentIndex = isBoundary ? segIdx + 1 : segIdx
      const mapPointIndex = isBoundary ? 0 : pIdx
      result.push({ ...p, segmentIndex: segIdx, pointIndex: pIdx, mapSegmentIndex, mapPointIndex })
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
  let cumulativeMs = null
  try {
    if (departureTime.value && departureZone.value) {
      cumulativeMs = fromZonedTime(departureTime.value, departureZone.value).getTime()
    }
  } catch { cumulativeMs = null }

  return segments.value.map((seg, idx) => {
    let dist = 0
    for (let i = 0; i < seg.length - 1; i++) {
      dist += calculateDistance(seg[i].lat, seg[i].lng, seg[i + 1].lat, seg[i + 1].lng)
    }
    const td = totalDistance.value
    const duration = td > 0 ? (dist / td) * totalDurationMs.value : 0
    const startMs = cumulativeMs
    const endMs = cumulativeMs != null ? cumulativeMs + duration : null
    if (cumulativeMs != null) cumulativeMs = endMs
    return {
      index: idx,
      distance: dist,
      duration,
      pointCount: seg.length,
      startDate: startMs != null ? new Date(startMs) : null,
      endDate: endMs != null ? new Date(endMs) : null
    }
  })
})

const formatSegmentDateTime = (date, tz) => {
  if (!date || !tz) return '-'
  try {
    const zoned = toZonedTime(date, tz)
    return format(zoned, 'dd/MM/yyyy HH:mm')
  } catch { return '-' }
}

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

const previewGeoJson = computed(() => {
  if (allPoints.value.length < 2) return null
  const baseProps = {
    name: shipName.value || '(Unnamed)',
    departureTime: departureTime.value,
    arrivalTime: arrivalTime.value,
    departureZone: departureZone.value,
    arrivalZone: arrivalZone.value,
    speedKnots: formattedSpeed.value,
  }
  let geo
  if (segments.value.length <= 1) {
    geo = {
      type: 'Feature',
      properties: { ...baseProps, interval: segmentIntervals.value[0] || '6H' },
      geometry: { type: 'LineString', coordinates: (segments.value[0] || []).map(p => [p.lng, p.lat]) }
    }
  } else {
    geo = {
      type: 'FeatureCollection',
      properties: baseProps,
      features: segments.value.map((seg, idx) => ({
        type: 'Feature',
        properties: {
          segmentName: String.fromCharCode(65 + idx),
          segmentIndex: idx,
          interval: segmentIntervals.value[idx] || '6H'
        },
        geometry: { type: 'LineString', coordinates: seg.map(p => [p.lng, p.lat]) }
      }))
    }
  }
  return JSON.stringify(geo, null, 2)
})

const toggleSelectedPoint = (point) => {
  const key = `${point.mapSegmentIndex}-${point.mapPointIndex}`
  const current = selectedPoint.value
  const currentKey = current ? `${current.segmentIndex}-${current.pointIndex}` : null
  selectedPoint.value = key === currentKey ? null : { segmentIndex: point.mapSegmentIndex, pointIndex: point.mapPointIndex }
}

const updateInterval = (idx, value) => {
  segmentIntervals.value[idx] = value
}

const deleteSegment = (idx) => {
  if (segments.value.length <= 1) return
  pushUndo()
  if (idx === 0) {
    segments.value.shift()
    segmentIntervals.value.shift()
  } else if (idx === segments.value.length - 1) {
    segments.value.pop()
    segmentIntervals.value.pop()
  } else {
    const prev = segments.value[idx - 1]
    const next = segments.value[idx + 1]
    const merged = [...prev, ...next]
    const interval = segmentIntervals.value[idx - 1]
    segments.value.splice(idx - 1, 3, merged)
    segmentIntervals.value.splice(idx - 1, 3, interval)
  }
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
  if (selectedPoint.value?.segmentIndex === segmentIndex && selectedPoint.value?.pointIndex === pointIndex) {
    selectedPoint.value = null
  }
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
  selectedPoint.value = null
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
  selectedPoint.value = null
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
