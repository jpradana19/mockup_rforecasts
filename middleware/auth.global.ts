export default defineNuxtRouteMiddleware((to, from) => {
    const { user } = useAuth()

    // If user is not logged in and trying to access anything other than login page
    if (!user.value && to.path !== '/') {
        return navigateTo('/')
    }

    // If user is logged in and trying to access login page
    if (user.value && to.path === '/') {
        return navigateTo('/dashboard')
    }
})
