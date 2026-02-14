import usersConfig from '../config/users.json'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Username and password are required'
        })
    }

    const user = usersConfig.users.find(u => u.username === username && u.password === password)

    if (user) {
        return {
            token: 'mock-jwt-token-for-demo',
            user: { username: user.username }
        }
    } else {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid credentials'
        })
    }
})
