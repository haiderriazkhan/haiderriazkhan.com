import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), "dist");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);
    const cleanPath = pathname.replace(/^\/+/, "");
    let file = path.join(root, cleanPath);

    if (pathname.endsWith("/")) {
      file = path.join(file, "index.html");
    }

    try {
      const stat = await fs.stat(file);
      if (stat.isDirectory()) file = path.join(file, "index.html");
    } catch {
      file = path.join(root, "index.html");
    }

    const body = await fs.readFile(file);
    response.writeHead(200, {
      "content-type": types[path.extname(file)] || "application/octet-stream"
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error.stack || String(error));
  }
});

server.listen(port, host, () => {
  console.log(`Serving dist/ at http://${host}:${port}`);
});
