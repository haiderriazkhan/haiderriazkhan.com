import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const watched = ["src", "scripts", "notes"];
// Generated/vendored paths the build itself writes into. Watching these would
// cause the build to retrigger itself in an endless loop.
const ignored = [
  path.join("notes", "output"),
  path.join("notes", "theme"),
  path.join("notes", "assets")
];
let building = false;
let queued = false;

function runBuild() {
  if (building) {
    queued = true;
    return;
  }

  building = true;
  const result = spawnSync("node", ["scripts/build.mjs"], { stdio: "inherit" });
  building = false;

  if (result.status !== 0) {
    console.error("Build failed.");
  }

  if (queued) {
    queued = false;
    runBuild();
  }
}

let debounce;
function scheduleBuild(dir, filename) {
  if (filename) {
    const relative = path.join(dir, filename);
    if (ignored.some((prefix) => relative === prefix || relative.startsWith(prefix + path.sep))) {
      return;
    }
  }
  clearTimeout(debounce);
  debounce = setTimeout(runBuild, 150);
}

runBuild();

const server = spawn("node", ["scripts/serve.mjs"], { stdio: "inherit" });

for (const dir of watched) {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) continue;
  fs.watch(fullPath, { recursive: true }, (_event, filename) => scheduleBuild(dir, filename));
}

process.on("SIGINT", () => {
  server.kill("SIGINT");
  process.exit(0);
});
