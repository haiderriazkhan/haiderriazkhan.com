import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const notesDir = path.join(root, "notes");
const themeDir = path.join(notesDir, "theme");
const assetsDir = path.join(notesDir, "assets");
const outputDir = path.join(notesDir, "output");
const forestConfig = path.join(notesDir, "forest.toml");
const distNotesDir = path.join(root, "dist", "notes");
const themeRepo = "https://github.com/utensil/forester-base-theme.git";

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

// Forester derives a base path from the `url` in forest.toml and nests its
// output under that path (e.g. url ".../notes/" -> output/notes/...). Figure
// out that subfolder so we copy the real site, not a doubly-nested one.
async function foresterOutputDir() {
  try {
    const toml = await fs.readFile(forestConfig, "utf8");
    const match = toml.match(/^\s*url\s*=\s*"([^"]+)"/m);
    if (match) {
      const segments = new URL(match[1]).pathname.split("/").filter(Boolean);
      const nested = path.join(outputDir, ...segments);
      if (segments.length > 0 && (await pathExists(nested))) {
        return nested;
      }
    }
  } catch {
    // fall through to the default output directory
  }
  return outputDir;
}

async function ensureNotesSetup() {
  await fs.mkdir(assetsDir, { recursive: true });

  if (await pathExists(themeDir)) {
    return;
  }

  console.log("Setting up Forester theme in notes/theme...");
  const clone = spawnSync("git", ["clone", "--depth", "1", themeRepo, themeDir], {
    stdio: "inherit"
  });

  if (clone.status !== 0) {
    console.error("Failed to fetch Forester theme. Clone it manually into notes/theme:");
    console.error(`  git clone --depth 1 ${themeRepo} notes/theme`);
    process.exit(clone.status ?? 1);
  }

  await fs.rm(path.join(themeDir, ".git"), { recursive: true, force: true });
}

const hasForester = spawnSync("forester", ["--version"], { stdio: "ignore" }).status === 0;

if (!hasForester) {
  console.log("Skipping Forester notes: install with `opam install forester`, then run `npm run build:notes`.");
  process.exit(0);
}

await ensureNotesSetup();

// Forester does not clear its own output directory, so deleted/renamed trees
// would otherwise linger and get copied into dist. Start each build clean.
await fs.rm(outputDir, { recursive: true, force: true });

const result = spawnSync("forester", ["build"], {
  cwd: notesDir,
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const sourceDir = await foresterOutputDir();

// Replace the placeholder /notes/ page written by build-site.mjs.
await fs.rm(distNotesDir, { recursive: true, force: true });
await fs.mkdir(distNotesDir, { recursive: true });
await fs.cp(sourceDir, distNotesDir, { recursive: true, force: true });
console.log("Built Forester notes into dist/notes/");
