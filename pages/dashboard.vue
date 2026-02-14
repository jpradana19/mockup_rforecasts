<template>
  <div class="relative w-full h-screen bg-slate-900 overflow-hidden font-sans text-slate-800">
    
    <!-- 1. MAP LAYER (Background Full) -->
    <div class="absolute inset-0 z-0">
      <RouteMap 
        v-model:points="points" 
        :segments="segments" 
        :editable="editable"
        @add-point="addPoint"
      />
    </div>

    <!-- 2. FLOATING SIDEBAR PANEL -->
    <!-- Menggunakan transform translate alih-alih v-if untuk performa dan stabilitas visual lebih baik -->
    <aside 
      class="absolute top-4 left-4 bottom-4 w-80 md:w-[24rem] z-[1000] flex flex-col bg-white border-2 border-slate-900 rounded-2xl shadow-[8px_8px_0px_rgba(15,23,42,0.3)] overflow-hidden transition-transform duration-300 ease-in-out"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-[150%]'"
    >
      <!-- Header Panel -->
      <div class="p-4 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div>
          <h1 class="text-xl font-black text-slate-900 tracking-tighter">R-Forecasts</h1>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route Planner</p>
        </div>
        <!-- Tombol Collapse -->
        <button 
          @click="sidebarOpen = false"
          class="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-white border-2 border-slate-200 rounded-lg hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:translate-y-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Collapse
        </button>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-white">
        
        <!-- Box Input: Nama Kapal -->
        <div class="space-y-1">
           <div class="border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-100 transition-all">
              <div class="bg-slate-50 text-[9px] font-bold text-center text-slate-500 uppercase py-1 border-b border-slate-200">
                Masukkan Nama Kapal
              </div>
              <input 
                v-model="shipName" 
                type="text" 
                class="w-full px-3 py-2.5 text-sm font-bold text-center text-slate-800 focus:outline-none placeholder:text-slate-300 placeholder:font-medium"
                placeholder="Contoh: MV. Baruna Jaya"
                :disabled="!editable"
              />
           </div>
        </div>

        <!-- Box Input: Berangkat -->
        <div class="flex gap-2">
           <div class="flex-1 border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-900 transition-all relative">
              <label class="absolute top-1 left-2 text-[8px] font-bold text-slate-400 uppercase tracking-wider">Waktu Berangkat</label>
              <input 
                v-model="departureTime" 
                type="datetime-local" 
                class="w-full px-2 py-2 pt-5 text-xs font-bold text-slate-800 text-center focus:outline-none bg-transparent"
                :disabled="!editable"
              />
           </div>
           <div class="w-20 border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-center shrink-0">
              <span class="text-[8px] font-black text-slate-400 text-center uppercase pt-1">Zone</span>
              <select v-model="departureZone" class="w-full bg-transparent text-center text-xs font-bold text-slate-700 focus:outline-none appearance-none pb-1 cursor-pointer" :disabled="!editable">
                  <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
              </select>
           </div>
        </div>

        <!-- Box Input: Tiba -->
        <div class="flex gap-2">
           <div class="flex-1 border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-900 transition-all relative">
              <label class="absolute top-1 left-2 text-[8px] font-bold text-slate-400 uppercase tracking-wider">Waktu Tiba</label>
              <input 
                v-model="arrivalTime" 
                type="datetime-local" 
                class="w-full px-2 py-2 pt-5 text-xs font-bold text-slate-800 text-center focus:outline-none bg-transparent"
                :disabled="!editable"
              />
           </div>
           <div class="w-20 border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-center shrink-0">
              <span class="text-[8px] font-black text-slate-400 text-center uppercase pt-1">Zone</span>
              <select v-model="arrivalZone" class="w-full bg-transparent text-center text-xs font-bold text-slate-700 focus:outline-none appearance-none pb-1 cursor-pointer" :disabled="!editable">
                  <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
              </select>
           </div>
        </div>

        <!-- Info Box -->
        <div class="grid grid-cols-2 gap-3">
           <div class="bg-white border-2 border-slate-100 rounded-xl p-3 text-center shadow-sm">
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jarak Total</div>
              <div class="text-base font-black text-slate-800 mt-1">{{ totalDistance.toFixed(0) }} <span class="text-[10px] font-bold text-slate-400">km</span></div>
           </div>
           <div class="bg-white border-2 border-slate-100 rounded-xl p-3 text-center shadow-sm">
              <div class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Est. Kecepatan</div>
              <div class="text-base font-black text-blue-600 mt-1">{{ formattedSpeed }} <span class="text-[10px] font-bold text-blue-300">kn</span></div>
           </div>
        </div>
        
        <!-- Waypoints List (Mini) -->
        <div class="bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden">
           <div class="px-3 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-100/50">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waypoints</span>
              <span class="text-[10px] font-black bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">{{ points.length }}</span>
           </div>
           <div class="max-h-24 overflow-y-auto custom-scrollbar p-1">
              <div v-if="points.length === 0" class="text-center py-3 text-xs text-slate-400 italic font-medium">
                 Klik di peta untuk menambahkan titik
              </div>
              <div v-else class="space-y-1">
                 <div v-for="(p, i) in points" :key="i" class="flex justify-between items-center text-[10px] font-mono px-2 py-1.5 bg-white border border-slate-100 rounded hover:border-slate-300 transition-colors group">
                    <span class="text-slate-600 font-bold"><span class="text-slate-400 mr-1">{{ i+1 }}.</span> {{ p.lat.toFixed(3) }}, {{ p.lng.toFixed(3) }}</span>
                    <button v-if="editable" @click="removePoint(i)" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <!-- Saved Route Loader -->
        <div class="pt-2">
           <label class="text-[9px] font-bold text-slate-400 uppercase mb-1.5 block tracking-wider">Saved Routes</label>
           <div class="flex gap-2">
              <div class="relative flex-1">
                 <select v-model="selectedRouteId" @change="onRouteSelect" class="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:border-slate-900 outline-none appearance-none cursor-pointer">
                    <option value="new" class="text-blue-600">+ Buat Rute Baru</option>
                    <option disabled>──────────</option>
                    <option v-for="r in savedRoutes" :key="r.id" :value="r.id">{{ r.properties.name }}</option>
                 </select>
                 <div class="absolute right-2 top-2.5 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                 </div>
              </div>
              <button v-if="selectedRouteId && selectedRouteId !== 'new'" @click="deleteRoute" class="px-3 bg-red-50 border-2 border-red-100 rounded-xl text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
           </div>
        </div>

      </div>

      <!-- Footer Buttons -->
      <div class="p-5 bg-slate-50 border-t-2 border-slate-100 space-y-3 shrink-0">
        <button 
          @click="saveRoute" 
          :disabled="!editable || saving || points.length < 2"
          class="w-full py-3.5 bg-slate-900 text-white font-black rounded-xl shadow-[4px_4px_0px_rgba(148,163,184,1)] active:shadow-none active:translate-y-[4px] hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs border-2 border-slate-900"
        >
          {{ saving ? 'Menyimpan...' : 'SIMPAN RUTE' }}
        </button>
        
        <button 
          @click="resetRoute" 
          class="w-full py-2.5 bg-white border-2 border-slate-200 text-slate-400 font-bold rounded-xl hover:border-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-[10px]"
        >
          Reset
        </button>
      </div>
    </aside>

    <!-- 3. TOMBOL BUKA (Floating Icon) -->
    <!-- Z-Index 1001 agar pasti di atas segalanya -->
    <button 
      @click="sidebarOpen = true"
      class="absolute top-6 left-6 z-[1001] p-3 bg-white border-2 border-slate-900 text-slate-900 rounded-xl shadow-[4px_4px_0px_rgba(15,23,42,0.2)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all group active:scale-95"
      :class="sidebarOpen ? '-translate-x-[200%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'"
      title="Buka Panel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-90 transition-transform"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
    </button>
    
    <!-- 4. PETA LABEL (Optional) -->
    <div v-if="!sidebarOpen" class="absolute top-6 left-20 z-20 pointer-events-none">
       <h1 class="text-xl font-black text-slate-900/50 uppercase tracking-widest drop-shadow-sm select-none bg-white/50 backdrop-blur px-4 py-2 rounded-xl border border-white/20">Mode Peta Penuh</h1>
    </div>

  </div>
</template>

<script setup>
import { formatSpeed, calculateSpeedVal, splitRouteByMidnight, calculateDistance } from '~/utils/routeMath'

// --- State ---
const sidebarOpen = ref(true)
const loading = ref(false)
const saving = ref(false)
const editable = ref(true)

// Data
const savedRoutes = ref([])
const selectedRouteId = ref('new')
const currentRouteId = ref(null)

// Form
const shipName = ref('')
const departureTime = ref('')
const arrivalTime = ref('')
const departureZone = ref('UTC')
const arrivalZone = ref('UTC')
const points = ref([])

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Jakarta', label: 'WIB' },
  { value: 'Asia/Makassar', label: 'WITA' },
  { value: 'Asia/Jayapura', label: 'WIT' },
  { value: 'Asia/Singapore', label: 'SGT' },
  { value: 'Asia/Tokyo', label: 'JST' },
]

// --- Computed ---
const formattedSpeed = computed(() => {
    const val = calculateSpeedVal(
        points.value.map(p => [p.lat, p.lng]), 
        departureTime.value, 
        arrivalTime.value, 
        departureZone.value, 
        arrivalZone.value
    )
    return formatSpeed(val)
})

const totalDistance = computed(() => {
    if (points.value.length < 2) return 0
    let d = 0
    for(let i=0; i<points.value.length-1; i++) {
        d += calculateDistance(points.value[i].lat, points.value[i].lng, points.value[i+1].lat, points.value[i+1].lng)
    }
    return d
})

const segments = computed(() => {
    return splitRouteByMidnight(
        points.value.map(p => [p.lat, p.lng]), 
        departureTime.value, 
        arrivalTime.value, 
        departureZone.value, 
        arrivalZone.value
    )
})

// --- Methods ---
const initDates = () => {
    const now = new Date()
    const toLocalISO = (d) => {
        const offset = d.getTimezoneOffset() * 60000
        return new Date(d.getTime() - offset).toISOString().slice(0, 16)
    }
    departureTime.value = toLocalISO(now)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    arrivalTime.value = toLocalISO(tomorrow)
}

const fetchRoutes = async () => {
    const { data } = await useFetch('/api/routes')
    if (data.value) {
        savedRoutes.value = data.value
    }
}

const resetRoute = () => {
    shipName.value = ''
    points.value = []
    currentRouteId.value = null
    selectedRouteId.value = 'new'
    initDates()
    editable.value = true
}

const addPoint = (latlng) => {
    if(editable.value) points.value.push(latlng)
}

const removePoint = (index) => {
    points.value.splice(index, 1)
}

const onRouteSelect = () => {
    if (selectedRouteId.value === 'new') {
        resetRoute()
        return
    }
    const route = savedRoutes.value.find(r => r.id === selectedRouteId.value)
    if (route) {
        loadRoute(route)
    }
}

const loadRoute = (route) => {
    currentRouteId.value = route.id
    shipName.value = route.properties.name
    departureTime.value = route.properties.departureTime || ''
    arrivalTime.value = route.properties.arrivalTime || ''
    departureZone.value = route.properties.departureZone || 'UTC'
    arrivalZone.value = route.properties.arrivalZone || 'UTC'
    
    if (route.geometry && route.geometry.coordinates) {
        points.value = route.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }))
    } else {
        points.value = []
    }
    editable.value = false
}

const deleteRoute = async () => {
    if (!selectedRouteId.value || selectedRouteId.value === 'new') return
    if (!confirm('Hapus rute ini secara permanen?')) return
    try {
        await useFetch(`/api/routes/${selectedRouteId.value}`, {
            method: 'DELETE'
        })
        await fetchRoutes()
        selectedRouteId.value = 'new'
        resetRoute()
    } catch(e) {
        alert('Gagal menghapus rute')
    }
}

const saveRoute = async () => {
    if (!shipName.value) {
        alert('Mohon isi nama kapal.')
        return
    }
    saving.value = true
    try {
        const geoJson = {
            type: 'Feature',
            properties: {
                 name: shipName.value,
                 departureTime: departureTime.value,
                 arrivalTime: arrivalTime.value,
                 departureZone: departureZone.value,
                 arrivalZone: arrivalZone.value,
                 speedKnots: formattedSpeed.value,
                 totalDistanceKm: totalDistance.value
            },
            geometry: {
                type: 'LineString',
                coordinates: points.value.map(p => [p.lng, p.lat])
            }
        }
        const { error } = await useFetch('/api/routes', {
            method: 'POST',
            body: geoJson
        })
        if (error.value) throw error.value
        await fetchRoutes()
        alert('Rute berhasil disimpan!')
    } catch(e) {
        alert('Gagal menyimpan rute.')
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    fetchRoutes()
    initDates()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>