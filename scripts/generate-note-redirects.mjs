import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const distNotes = path.join(dist, "notes");

async function findNoteFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const matches = await Promise.all(
    entries
      .filter((entry) => entry.name !== "node_modules")
      .map(async (entry) => {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) return findNoteFiles(target);
        return entry.isFile() && entry.name === "index.xml" ? [target] : [];
      })
  );

  return matches.flat();
}

function publicRoute(route) {
  return route === "/notes/index/" ? "/notes/" : route;
}

function withoutTrailingSlash(route) {
  return route.length > 1 && route.endsWith("/") ? route.slice(0, -1) : route;
}

export async function generateNoteRedirects() {
  const noteFiles = await findNoteFiles(distNotes);
  const rewrites = [];

  for (const file of noteFiles) {
    const xml = await fs.readFile(file, "utf8");
    const foresterRoute = xml.match(/<fr:route>([^<]+)<\/fr:route>/)?.[1];
    if (!foresterRoute) continue;

    const route = publicRoute(foresterRoute);
    if (!route.startsWith("/notes/") || /\s/.test(route)) {
      throw new Error(`Cannot generate a Netlify rewrite for invalid note route: ${route}`);
    }

    const target = `/${path.relative(dist, file).split(path.sep).join("/")}`;
    for (const source of new Set([withoutTrailingSlash(route), route])) {
      rewrites.push(`${source} ${target} 200!`);
    }
  }

  rewrites.sort((a, b) => a.localeCompare(b));
  await fs.writeFile(path.join(dist, "_redirects"), `${rewrites.join("\n")}\n`);
}
