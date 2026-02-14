<template>
  <div class="flex h-screen w-full bg-slate-900 text-slate-100">
    
    <!-- Sidebar (Left Panel) -->
    <aside 
      class="flex flex-col w-80 border-r border-slate-700 bg-slate-800 transition-all duration-300 ease-in-out"
      :class="{ 'w-0 overflow-hidden': !sidebarOpen }"
    >
      <!-- Header -->
      <div class="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
        <h2 class="text-xl font-bold text-white tracking-tight">R-Forecasts</h2>
        
        <!-- Collapse Button -->
        <button 
          @click="sidebarOpen = false"
          class="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
          title="Collapse Sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      <div class="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        <!-- Editor Controls -->
        <div class="space-y-4">
          
          <div class="space-y-3">
            <div>
              <label class="label text-xs uppercase font-bold text-slate-400">Masukkan Nama Kapal</label>
              <input v-model="shipName" type="text" class="input bg-slate-900/50 border-slate-600 focus:border-primary" placeholder="Nama Kapal..."/>
            </div>

            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-1">
                <div class="flex justify-between items-center">
                  <label class="label text-xs uppercase font-bold text-slate-400">Tanggal dan Waktu Berangkat</label>
                </div>
                <div class="flex gap-2">
                  <input v-model="departureTime" type="datetime-local" class="input bg-slate-900/50 border-slate-600 w-full flex-1 min-w-0" />
                  <select v-model="departureZone" class="select bg-slate-900/50 border-slate-600 focus:border-primary w-24 text-xs px-1 text-white" title="Time Zone">
                      <option class="text-black" v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
                  </select>
                </div>
              </div>

               <div class="space-y-1">
                <div class="flex justify-between items-center">
                  <label class="label text-xs uppercase font-bold text-slate-400">Tanggal dan Waktu Tiba</label>
                </div>
                <div class="flex gap-2">
                    <input v-model="arrivalTime" type="datetime-local" class="input bg-slate-900/50 border-slate-600 w-full flex-1 min-w-0" />
                    <select v-model="arrivalZone" class="select bg-slate-900/50 border-slate-600 focus:border-primary w-24 text-xs px-1 text-white" title="Time Zone">
                        <option class="text-black bg-white" v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
                    </select>
                </div>
              </div>
            </div>
          </div>

          <div class="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 grid grid-cols-2 gap-4">
             <div>
               <span class="block text-xs text-slate-500 mb-1 uppercase">Avg Speed</span>
               <span class="block text-lg font-mono font-bold text-accent">{{ formattedSpeed }} <span class="text-xs font-normal text-slate-500">kts</span></span>
             </div>
             <div>
                <span class="block text-xs text-slate-500 mb-1 uppercase">Total Distance</span>
                <span class="block text-lg font-mono font-bold text-white">{{ totalDistance.toFixed(0) }} <span class="text-xs font-normal text-slate-500">km</span></span>
             </div>
           </div>

          <div class="pt-4 space-y-3">
             <button 
               @click="saveRoute" 
               class="btn w-full justify-center border border-slate-600 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-wider py-3"
               :disabled="saving || points.length < 2"
             >
               {{ saving ? 'Menyimpan...' : 'SIMPAN RUTE' }}
             </button>
             
             <button 
               @click="resetRoute" 
               class="btn w-full justify-center border border-slate-600 hover:bg-slate-800 text-slate-400 uppercase tracking-wider"
             >
               Reset
             </button>
          </div>
        </div>
        
        <div class="border-t border-slate-700/50 pt-4">
             <div class="flex justify-between items-center mb-3">
                <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Routes</h3>
             </div>
             
             <div class="space-y-2">
               <!-- Route Selector Dropdown -->
               <select 
                 v-model="selectedRouteId" 
                 @change="onRouteSelect"
                 class="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:border-primary focus:outline-none transition-colors"
               >
                 <option value="">Pilih Rute...</option>
                 <option 
                   v-for="r in savedRoutes" 
                   :key="r.properties.id" 
                   :value="r.properties.id"
                 >
                   {{ r.properties.name || 'Untitled Route' }}
                 </option>
               </select>
               
               <!-- Delete Button -->
               <button 
                 v-if="selectedRouteId"
                 @click="deleteRoute"
                 class="w-full px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm font-medium hover:bg-red-900/50 hover:border-red-600 transition-colors flex items-center justify-center gap-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                 </svg>
                 Hapus Rute
               </button>
             </div>
        </div>
      </div>
    </aside>

    <!-- Map Container (Right Side) -->
    <div class="flex-1 relative" style="flex: 1 1 0%; min-width: 0;">
      <!-- Expand Button (Visible only when sidebar is closed) -->
      <button 
        v-if="!sidebarOpen"
        @click="sidebarOpen = true"
        class="absolute top-4 left-4 z-10 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white shadow-md hover:bg-slate-700 transition-colors"
        title="Expand Sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <!-- Map -->
      <div class="absolute inset-0">
        <ClientOnly>
          <RouteMap 
            v-model:points="points" 
            :segments="segments" 
            :editable="editable"
            @add-point="addPoint"
          />
        </ClientOnly>
      </div>

      <!-- Map Info Overlay -->
      <div class="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        <!-- Legend -->
        <div class="bg-slate-800/90 backdrop-blur p-3 rounded-lg shadow-xl border border-slate-700 pointer-events-none">
          <div class="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">Visual Forecast</div>
          <div class="flex gap-4 text-xs font-medium">
              <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#0ea5e9] shadow-[0_0_8px_rgba(14,165,233,0.5)]"></span> Day 1</div>
              <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> Day 2</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { formatSpeed, calculateSpeedVal, splitRouteByMidnight, calculateDistance } from '~/utils/routeMath'

const { logout } = useAuth()

// State
const sidebarOpen = ref(true)
const savedRoutes = ref([])
const currentRouteId = ref(null)
const selectedRouteId = ref('')
const shipName = ref('')
const departureTime = ref('')
const arrivalTime = ref('')
const points = ref([])
const editable = ref(false)
const saving = ref(false)
const departureZone = ref('UTC')
const arrivalZone = ref('UTC')

// Timezone options
// Timezone options
const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Jakarta', label: 'WIB' },
  { value: 'Asia/Makassar', label: 'WITA' },
  { value: 'Asia/Jayapura', label: 'WIT' },
  { value: 'Asia/Singapore', label: 'SGT' },
  { value: 'Asia/Tokyo', label: 'JST' },
  { value: 'Europe/London', label: 'BST/GMT' },
  { value: 'America/New_York', label: 'EST/EDT' },
]

// Init defaults for dates
const initDates = () => {
    // Basic init; ideal world uses timezone aware "now"
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    departureTime.value = now.toISOString().slice(0, 16)
    
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    arrivalTime.value = tomorrow.toISOString().slice(0, 16)
}

// Computed
const segments = computed(() => {
    return splitRouteByMidnight(
        points.value.map(p => [p.lat, p.lng]), 
        departureTime.value, 
        arrivalTime.value, 
        departureZone.value,
        arrivalZone.value
    )
})

const formattedSpeed = computed(() => {
    const speed = calculateSpeedVal(
        points.value.map(p => [p.lat, p.lng]), 
        departureTime.value, 
        arrivalTime.value,
        departureZone.value,
        arrivalZone.value
    )
    return formatSpeed(speed)
})

const totalDistance = computed(() => {
    if (points.value.length < 2) return 0
    let d = 0
    for(let i=0; i<points.value.length-1; i++) {
        d += calculateDistance(points.value[i].lat, points.value[i].lng, points.value[i+1].lat, points.value[i+1].lng)
    }
    return d
})

// Methods
const fetchRoutes = async () => {
    const { data } = await useFetch('/api/routes')
    if (data.value) {
        savedRoutes.value = data.value
    }
}

const createNewRoute = () => {
    currentRouteId.value = null
    resetRoute()
}

const resetRoute = () => {
    points.value = []
    shipName.value = ''
    departureZone.value = 'UTC'
    arrivalZone.value = 'UTC'
    initDates()
    editable.value = true
}

const loadRoute = (route) => {
    currentRouteId.value = route.properties.id
    shipName.value = route.properties.name
    departureTime.value = route.properties.departureTime || ''
    arrivalTime.value = route.properties.arrivalTime || ''
    departureZone.value = route.properties.departureZone || 'UTC'
    arrivalZone.value = route.properties.arrivalZone || 'UTC'
    
    // Legacy support for single timezone field
    if (route.properties.timezone) {
        departureZone.value = route.properties.timezone
        arrivalZone.value = route.properties.timezone
    }
    
    if (route.geometry && route.geometry.coordinates) {
        points.value = route.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }))
    } else {
        points.value = []
    }
    editable.value = false
}

const saveRoute = async () => {
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
                 speedKnots: formattedSpeed.value
            },
            geometry: {
                type: 'LineString',
                coordinates: points.value.map(p => [p.lng, p.lat])
            }
        }

        const { data, error } = await useFetch('/api/routes', {
            method: 'POST',
            body: geoJson
        })
        
        if (!error.value) {
            await fetchRoutes()
            currentRouteId.value = data.value.id
        }
    } finally {
        saving.value = false
    }
}

const addPoint = (latlng) => {
    points.value.push(latlng)
}

const onRouteSelect = () => {
    if (!selectedRouteId.value) {
        resetRoute()
        currentRouteId.value = null
        return
    }
    
    const route = savedRoutes.value.find(r => r.properties.id === selectedRouteId.value)
    if (route) {
        loadRoute(route)
    }
}

const deleteRoute = async () => {
    if (!selectedRouteId.value) return
    
    if (!confirm('Apakah Anda yakin ingin menghapus rute ini?')) {
        return
    }
    
    try {
        const { error } = await useFetch(`/api/routes/${selectedRouteId.value}`, {
            method: 'DELETE'
        })
        
        if (!error.value) {
            await fetchRoutes()
            selectedRouteId.value = ''
            if (currentRouteId.value === selectedRouteId.value) {
                resetRoute()
                currentRouteId.value = null
            }
        }
    } catch (err) {
        console.error('Failed to delete route:', err)
        alert('Gagal menghapus rute')
    }
}

onMounted(() => {
    fetchRoutes()
    initDates()
    editable.value = true // Start in edit mode for empty state
})
</script>
