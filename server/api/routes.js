import { promises as fs } from 'fs'
import path from 'path'

const checkDir = async (dir) => {
    try {
        await fs.access(dir)
    } catch {
        await fs.mkdir(dir, { recursive: true })
    }
}

export default defineEventHandler(async (event) => {
    const dataDir = path.resolve(process.cwd(), 'server/data/routes')
    await checkDir(dataDir)

    if (event.node.req.method === 'GET') {
        // List routes
        const files = await fs.readdir(dataDir)
        const routes = []
        for (const file of files) {
            if (file.endsWith('.geojson')) {
                const content = await fs.readFile(path.join(dataDir, file), 'utf-8')
                try {
                    routes.push(JSON.parse(content))
                } catch (e) {
                    // ignore bad files
                }
            }
        }
        // Cloud sort by date created if I store metadata, but here just return all
        return routes.sort((a, b) => new Date(b.properties.createdAt) - new Date(a.properties.createdAt))
    }

    if (event.node.req.method === 'POST') {
        // Save route
        const body = await readBody(event)

        // Validate
        if (!body.type || (body.type !== 'FeatureCollection' && body.type !== 'Feature')) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid GeoJSON' })
        }

        const id = Date.now().toString()
        const filename = `${id}.geojson`

        // Add ID to properties if not present
        if (!body.properties) body.properties = {}
        body.properties.id = id
        body.properties.createdAt = new Date().toISOString()

        await fs.writeFile(path.join(dataDir, filename), JSON.stringify(body, null, 2))

        return { success: true, id }
    }
})
