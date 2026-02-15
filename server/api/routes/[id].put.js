import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
    const id = event.context.params.id
    const dataDir = path.resolve(process.cwd(), 'server/data/routes')
    const filePath = path.join(dataDir, `${id}.geojson`)

    // Check if file exists
    try {
        await fs.access(filePath)
    } catch {
        throw createError({ statusCode: 404, statusMessage: 'Route not found' })
    }

    const body = await readBody(event)

    // Basic Validation
    if (!body.type || (body.type !== 'FeatureCollection' && body.type !== 'Feature')) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid GeoJSON' })
    }

    // Ensure ID is preserved/consistent in properties
    // If it's a FeatureCollection, we might want to ensure properties in the first feature or a separate metadata object? 
    // Standard GeoJSON FeatureCollection has a "properties" field too, but often tools look at features.
    // For now, let's trust the body structure but ensure the ID matches the filename/param.

    // We update the createdAt if we want to track modification, or keep original. 
    // Let's keep original 'createdAt' if it exists in the file, or maybe just add 'updatedAt'.
    // For simplicity, we just overwrite for now, but preserving ID is key.

    if (body.properties) {
        body.properties.id = id
        body.properties.updatedAt = new Date().toISOString()
    } else if (body.type === 'FeatureCollection') {
        // If FeatureCollection, we can put top-level properties if we want, or rely on features.
        // But our app logic likely checks route.properties.id.
        if (!body.properties) body.properties = {}
        body.properties.id = id
        body.properties.updatedAt = new Date().toISOString()
    }

    await fs.writeFile(filePath, JSON.stringify(body, null, 2))

    return { success: true, id }
})
