import fs from "node:fs/promises";
import path from "node:path";
import { about, publications, projects } from "../src/data/content.js";

const root = process.cwd();
const dist = path.join(root, "dist");
const publicAssets = ["images", "publications", "CV.pdf", "favicon.ico", "feed.xml", "sitemap.xml"];
const site = JSON.parse(await fs.readFile(path.join(root, "src/data/site.json"), "utf8"));

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const attr = escapeHtml;

async function copyIfExists(from, to) {
  try {
    const stat = await fs.stat(from);
    if (stat.isDirectory()) {
      await fs.cp(from, to, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.copyFile(from, to);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function page({ title, currentPath, body }) {
  const nav = site.nav
    .map((item) => {
      const active = item.url === currentPath;
      return `<a ${active ? 'aria-current="page"' : ""} href="${attr(item.url)}">${escapeHtml(item.label)}</a>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | ${escapeHtml(site.name)}</title>
  <meta name="description" content="${attr(site.description)}">
  <link rel="icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap">
  <link rel="stylesheet" href="/styles/main.css">
  <script type="module" src="/scripts/main.js"></script>
</head>
<body>
  <header class="site-header">
    <a class="site-title" href="/">${escapeHtml(site.name)}</a>
    <nav aria-label="Primary">${nav}</nav>
  </header>
  <main>
    ${body}
  </main>
</body>
</html>`;
}

const socialIcons = {
  github:
    '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  linkedin:
    '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>',
  flickr:
    '<path d="M0 12c0 3.074 2.494 5.565 5.567 5.565 3.075 0 5.569-2.491 5.569-5.565S8.642 6.436 5.567 6.436C2.494 6.436 0 8.926 0 12zm12.866 0c0 3.074 2.493 5.565 5.567 5.565C21.508 17.565 24 15.074 24 12s-2.492-5.564-5.567-5.564c-3.074 0-5.567 2.49-5.567 5.564z"/>'
};

function socialLinks() {
  const items = (site.social || [])
    .filter((item) => socialIcons[item.platform])
    .map(
      (item) =>
        `<a href="${attr(item.url)}" aria-label="${attr(item.label)}" title="${attr(item.label)}" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">${socialIcons[item.platform]}</svg>
    </a>`
    )
    .join("\n    ");

  return items ? `<div class="social">\n    ${items}\n  </div>` : "";
}

function intro() {
  return page({
    title: "About",
    currentPath: "/",
    body: `<section class="intro">
  <img src="/images/Manhattan.jpg" alt="Williamsburg Waterfront" width="256" height="256">
  <div>
    ${about.map((paragraph) => `<p>${paragraph}</p>`).join("\n")}
    <p>The best way to reach me is by <a href="mailto:${attr(site.email)}">email</a>.</p>
    ${socialLinks()}
  </div>
</section>`
  });
}

function listing({ title, currentPath, items, kind }) {
  const cards = items
    .map((item) => {
      const meta = kind === "projects" ? item.role : item.venue;
      const pdf = item.pdf ? `<a href="${attr(item.pdf)}">PDF</a>` : "";
      return `<article class="list-item">
  <a class="thumb" href="${attr(item.url)}" aria-label="${attr(item.title)}">
    <img src="${attr(item.image)}" alt="" loading="lazy">
  </a>
  <div>
    <p class="meta">${escapeHtml(meta)}</p>
    <h2><a href="${attr(item.url)}">${escapeHtml(item.title)}</a></h2>
    ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
    ${pdf ? `<p class="small-links">${pdf}</p>` : ""}
  </div>
</article>`;
    })
    .join("\n");

  return page({
    title,
    currentPath,
    body: `<section class="list${kind === "projects" ? " list--projects" : kind === "publications" ? " list--publications" : ""}">${cards}</section>`
  });
}

function notes() {
  return page({
    title: "Notes",
    currentPath: "/notes/",
    body: `<section class="page-heading notes-heading">
  <h1>Notes</h1>
  <p>A Forester garden for shorter mathematical, philosophical, and technical notes.</p>
</section>
<section class="note-status">
  <p>Forester notes are built from <code>notes/trees</code>. Once <code>forester</code> is installed, run <code>npm run build:notes</code> or the full <code>npm run build</code>.</p>
  <p>The starter tree is <code>notes/trees/index.tree</code>.</p>
</section>`
  });
}

async function write(file, html) {
  const target = path.join(dist, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, html);
}

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });

await Promise.all(
  publicAssets.map((asset) => copyIfExists(path.join(root, asset), path.join(dist, asset)))
);
await copyIfExists(path.join(root, "src/styles"), path.join(dist, "styles"));
await copyIfExists(path.join(root, "src/scripts"), path.join(dist, "scripts"));

await write("index.html", intro());
await write("projects/index.html", listing({ title: "Projects", currentPath: "/projects/", items: projects, kind: "projects" }));
await write("publications/index.html", listing({ title: "Publications", currentPath: "/publications/", items: publications, kind: "publications" }));
await write("notes/index.html", notes());

console.log("Built site into dist/");
