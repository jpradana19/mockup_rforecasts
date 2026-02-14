export const useAuth = () => {
    const user = useState('user', () => null)
    const token = useState('token', () => null)

    const login = async (username, password) => {
        try {
            const { data, error } = await useFetch('/api/auth', {
                method: 'POST',
                body: { username, password }
            })

            if (error.value) {
                throw new Error(error.value.statusMessage || 'Login failed')
            }

            token.value = data.value.token
            user.value = data.value.user

            return true
        } catch (e) {
            console.error(e)
            return false
        }
    }

    const logout = () => {
        user.value = null
        token.value = null
        navigateTo('/')
    }

    return {
        user,
        token,
        login,
        logout
    }
}
