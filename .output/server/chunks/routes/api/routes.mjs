import { d as defineEventHandler, r as readBody, c as createError } from '../../nitro/nitro.mjs';
import { promises } from 'fs';
import path from 'path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const checkDir = async (dir) => {
  try {
    await promises.access(dir);
  } catch {
    await promises.mkdir(dir, { recursive: true });
  }
};
const routes = defineEventHandler(async (event) => {
  const dataDir = path.resolve(process.cwd(), "server/data/routes");
  await checkDir(dataDir);
  if (event.node.req.method === "GET") {
    const files = await promises.readdir(dataDir);
    const routes = [];
    for (const file of files) {
      if (file.endsWith(".geojson")) {
        const content = await promises.readFile(path.join(dataDir, file), "utf-8");
        try {
          routes.push(JSON.parse(content));
        } catch (e) {
        }
      }
    }
    return routes.sort((a, b) => new Date(b.properties.createdAt) - new Date(a.properties.createdAt));
  }
  if (event.node.req.method === "POST") {
    const body = await readBody(event);
    if (!body.type || body.type !== "FeatureCollection") {
      throw createError({ statusCode: 400, statusMessage: "Invalid GeoJSON" });
    }
    const id = Date.now().toString();
    const filename = `${id}.geojson`;
    if (!body.properties) body.properties = {};
    body.properties.id = id;
    body.properties.createdAt = (/* @__PURE__ */ new Date()).toISOString();
    await promises.writeFile(path.join(dataDir, filename), JSON.stringify(body, null, 2));
    return { success: true, id };
  }
});

export { routes as default };
//# sourceMappingURL=routes.mjs.map
