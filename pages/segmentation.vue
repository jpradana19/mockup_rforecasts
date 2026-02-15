<template>
  <!-- Main Container: Force 100vh dan sembunyikan overflow global -->
  <div class="flex flex-col h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-sans">
    
    <!-- MAP AREA: Mengisi sisa ruang (flex-1) -->
    <div class="flex-1 relative w-full min-h-0 z-0">
       <ClientOnly>
           <SegmentationMap 
              :segments="segments"
              :route-id="selectedRouteId"
              @split="handleSplit"
              @shift-boundary="handleShiftBoundary"
              class="w-full h-full"
           />
       </ClientOnly>
    </div>

    <!-- BOTTOM CONTROL BAR -->
    <!-- Menggunakan tag <footer> dengan tinggi fix (h-16 / 64px) dan overflow-hidden -->
    <footer 
      class="shrink-0 bg-slate-800 border-t border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-20 w-full flex items-center relative"
      style="height: 64px; min-height: 64px; max-height: 64px;"
    >
      
      <div class="w-full px-4 flex items-center justify-between gap-4 h-full">
            
            <!-- LEFT: Title & Route Selector -->
            <div class="flex items-center gap-4 shrink-0 h-full">
                <!-- Back Button -->
                <!-- Back Button (Redesigned) -->
                <button 
                  @click="navigateTo('/dashboard')" 
                  class="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white transition-colors group mr-2 border border-slate-600"
                  title="Kembali ke Dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    <span class="text-xs font-bold uppercase tracking-wide">Dashboard</span>
                </button>

                <!-- Title Block: MENGGUNAKAN DIV/SPAN BUKAN H1/H2 untuk menghindari konflik main.css -->
                <div class="flex flex-col justify-center leading-none">
                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Segmentasi</span>
                    <span class="!text-sm text-white font-bold uppercase whitespace-nowrap">Rute Kapal</span>
                </div>

                <!-- Divider Vertical -->
                <div class="h-8 w-px bg-slate-600 hidden sm:block"></div>

                <!-- Input Group -->
                <div class="flex items-center bg-slate-900 border border-slate-600 rounded overflow-hidden h-9 max-w-[200px] sm:max-w-xs relative">
                    <select 
                        v-model="selectedRouteId" 
                        @change="loadRoute"
                        class="appearance-none bg-transparent text-white !text-xs sm:!text-sm px-3 py-1 pr-8 outline-none border-none h-full w-full cursor-pointer hover:bg-slate-800 transition-colors truncate"
                    >
                        <option value="" class="bg-slate-800">-- Pilih Rute --</option>
                        <option v-for="r in routes" :key="r.properties.id" :value="r.properties.id" class="bg-slate-800">
                           {{ r.properties.name || 'Untitled' }}
                        </option>
                    </select>
                    <!-- Custom Arrow Icon (Absolute positioned to stay inside input box) -->
                    <div class="absolute right-2 pointer-events-none text-slate-400 flex items-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                        </svg>
                    </div>
                </div>

                <!-- Count Badge -->
                <div class="hidden md:flex flex-col px-3 border-l border-slate-600 h-8 justify-center">
                    <span class="text-[9px] text-slate-500 uppercase font-bold leading-none">Total Segments: </span>
                    <span class="!text-sm font-mono text-blue-400 font-bold leading-none mt-0.5">{{ segments.length || 0 }}</span>
                </div>
            </div>

            <!-- CENTER: Legend (Simplified Text Only to avoid icon issues) -->
            <div class="hidden xl:flex items-center gap-6 !text-xs text-slate-400 select-none">
                 <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-white inline-block ring-2 ring-slate-600"></span>
                    <span>Klik garis: <strong class="text-slate-200">Split</strong></span>
                 </div>
                 <div class="flex items-center gap-2">
                    <!-- SVG dengan explicit width/height -->
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-blue-500 block" style="min-width: 14px;">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    </svg>
                    <span>Geser marker: <strong class="text-slate-200">Ubah Batas</strong></span>
                 </div>
            </div>

            <!-- RIGHT: Actions -->
            <div class="flex items-center gap-2 shrink-0">
                 
                 <button 
                    @click="resetSegments" 
                    :disabled="!selectedRouteId"
                    class="h-9 px-3 !text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors uppercase disabled:opacity-30"
                 >
                    Reset
                 </button>

                 <div class="h-6 w-px bg-slate-600 mx-1"></div>

                 <button 
                    @click="saveSegmentation" 
                    :disabled="!selectedRouteId || saving"
                    class="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white !text-xs font-bold uppercase tracking-wide rounded shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                 >
                    <!-- SVG Loading Spinner -->
                    <svg v-if="saving" width="14" height="14" viewBox="0 0 24 24" fill="none" class="animate-spin text-white block">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ saving ? '...' : 'Simpan' }}
                 </button>

                 <NuxtLink 
                    to="/dashboard" 
                    class="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white !text-xs font-bold uppercase tracking-wide rounded shadow transition-all flex items-center gap-2 ml-1"
                 >
                    Next
                    <!-- SVG Arrow -->
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="block">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                 </NuxtLink>
            </div>

      </div>
    </footer>

  </div>
</template>

<script setup>
// Map logic moved to SegmentationMap.client.vue to avoid SSR issues

const routes = ref([])
const selectedRouteId = ref('')
const currentRoute = ref(null)
const saving = ref(false)

// We store segments as arrays of points {lat, lng}
const segments = ref([])

const getSegmentName = (idx) => String.fromCharCode(65 + idx) // A, B, C...

// Fetch routes list
const fetchRoutes = async () => {
    const { data } = await useFetch('/api/routes')
    if (data.value) {
        routes.value = data.value
    }
}

// Load selected route
const loadRoute = () => {
    if (!selectedRouteId.value) {
        segments.value = []
        return
    }

    const route = routes.value.find(r => r.properties.id === selectedRouteId.value)
    if (!route) return

    currentRoute.value = route

    // Parse route into segments
    segments.value = []
    
    if (route.type === 'FeatureCollection') {
        // Already segmented?
        route.features.forEach(f => {
            if (f.geometry && f.geometry.coordinates) {
                 segments.value.push(f.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })))
            }
        })
    } else if (route.geometry && route.geometry.coordinates) {
        // Single Feature
        segments.value.push(route.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })))
    } else {
        segments.value = []
    }
}

const resetSegments = () => {
    if (!currentRoute.value) return
    // Flatten everything back to one segment
    const allPoints = segments.value.flat()
    segments.value = [allPoints]
}

// Split logic
const handleSplit = ({ segmentIndex, pointIndex }) => {
    const originalSegment = segments.value[segmentIndex]
    if (!originalSegment || pointIndex <= 0 || pointIndex >= originalSegment.length - 1) return
    
    const newSeg1 = originalSegment.slice(0, pointIndex + 1)
    const newSeg2 = originalSegment.slice(pointIndex)

    segments.value.splice(segmentIndex, 1, newSeg1, newSeg2)
}

const handleShiftBoundary = ({ segmentIndex, newLatLng }) => {
    if (segmentIndex <= 0 || segmentIndex >= segments.value.length) return

    const prevSeg = segments.value[segmentIndex - 1]
    const currSeg = segments.value[segmentIndex]

    const combined = [...prevSeg]
    if (currSeg.length > 0) {
        combined.push(...currSeg.slice(1))
    }

    let closestIdx = -1
    let minDistSq = Infinity
    
    combined.forEach((p, idx) => {
        const dSq = (p.lat - newLatLng.lat) ** 2 + (p.lng - newLatLng.lng) ** 2
        if (dSq < minDistSq) {
            minDistSq = dSq
            closestIdx = idx
        }
    })

    if (closestIdx <= 0 || closestIdx >= combined.length - 1) return

    const newPrevSeg = combined.slice(0, closestIdx + 1)
    const newCurrSeg = combined.slice(closestIdx)

    segments.value.splice(segmentIndex - 1, 2, newPrevSeg, newCurrSeg)
}

onMounted(() => {
    fetchRoutes()
})

// Save
const saveSegmentation = async () => {
    if (!currentRoute.value || !selectedRouteId.value) return

    saving.value = true
    try {
        const features = segments.value.map((segPoints, idx) => {
             return {
                 type: 'Feature',
                 properties: {
                     segmentName: getSegmentName(idx),
                     segmentIndex: idx,
                     ...currentRoute.value.properties 
                 },
                 geometry: {
                     type: 'LineString',
                     coordinates: segPoints.map(p => [p.lng, p.lat])
                 }
             }
        })

        const geoJson = {
            type: 'FeatureCollection',
            properties: {
                ...currentRoute.value.properties,
                updatedAt: new Date().toISOString()
            },
            features: features
        }

        const { error } = await useFetch(`/api/routes/${selectedRouteId.value}`, {
            method: 'PUT',
            body: geoJson
        })

        if (!error.value) {
            alert('Route segments saved successfully!')
            await fetchRoutes() 
        } else {
             alert('Failed to save route.')
        }

    } catch (e) {
        console.error(e)
        alert('Error saving route')
    } finally {
        saving.value = false
    }
}
</script>