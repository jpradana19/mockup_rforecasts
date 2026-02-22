// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false,
    modules: ['@nuxtjs/tailwindcss'],
    css: [
        '~/assets/css/main.css',
        'leaflet/dist/leaflet.css'
    ],
    app: {
        head: {
            title: 'R-Forecasts - Ship Route Management',
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Ship route forecasting and management' }
            ],
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap' }
            ]
        }
    },
    experimental: {
        appManifest: false
    },
    devtools: { enabled: false },
    compatibilityDate: '2026-02-14'
})
