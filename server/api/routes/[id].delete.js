import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
    const id = event.context.params.id

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Route ID required' })
    }

    const dataDir = path.resolve(process.cwd(), 'server/data/routes')
    const filename = `${id}.geojson`
    const filepath = path.join(dataDir, filename)

    try {
        // Check if file exists
        await fs.access(filepath)
        // Delete the file
        await fs.unlink(filepath)
        return { success: true, message: 'Route deleted successfully' }
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw createError({ statusCode: 404, statusMessage: 'Route not found' })
        }
        throw createError({ statusCode: 500, statusMessage: 'Failed to delete route' })
    }
})
