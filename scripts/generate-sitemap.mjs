import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function findFiles(directory, filename) {
  if (!(await pathExists(directory))) return [];

  const entries = await fs.readdir(directory, { withFileTypes: true });
  const matches = await Promise.all(
    entries
      .filter((entry) => entry.name !== "node_modules")
      .map(async (entry) => {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) return findFiles(target, filename);
        return entry.isFile() && entry.name === filename ? [target] : [];
      })
  );

  return matches.flat();
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function routeFromHtml(file) {
  const relative = path.relative(dist, file);
  const directory = path.dirname(relative);
  return directory === "." ? "/" : `/${directory.split(path.sep).join("/")}/`;
}

export async function generateSitemap() {
  const site = JSON.parse(await fs.readFile(path.join(root, "src/data/site.json"), "utf8"));
  const baseUrl = site.url.replace(/\/$/, "");
  const routes = new Set();

  const htmlFiles = await findFiles(dist, "index.html");
  for (const file of htmlFiles) {
    const relative = path.relative(dist, file);
    if (!relative.startsWith(`notes${path.sep}`)) routes.add(routeFromHtml(file));
  }

  const noteFiles = await findFiles(path.join(dist, "notes"), "index.xml");
  for (const file of noteFiles) {
    const xml = await fs.readFile(file, "utf8");
    const route = xml.match(/<fr:route>([^<]+)<\/fr:route>/)?.[1];
    if (!route) continue;
    routes.add(route === "/notes/index/" ? "/notes/" : route);
  }

  if (noteFiles.length === 0 && (await pathExists(path.join(dist, "notes", "index.html")))) {
    routes.add("/notes/");
  }

  const urls = [...routes]
    .sort((a, b) => a.localeCompare(b))
    .map((route) => `  <url>\n    <loc>${escapeXml(`${baseUrl}${route}`)}</loc>\n  </url>`)
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await fs.mkdir(dist, { recursive: true });
  await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap);
}
