# Personal Website

This repository hosts my [personal website](https://haiderriazkhan.com/). It is hosted on [Netlify](https://www.netlify.com/) but built and deployed by GitHub Actions.

## Deployment

Every push to `master` triggers a GitHub Actions workflow, which:

1. Installs Node and OCaml (via `opam`) and then installs [Forester](https://sr.ht/~jonsterling/forester/).
2. Runs `npm run build`, producing the full site **and** the notes in `dist/`.
3. Deploys `dist/` to Netlify with the Netlify CLI action.

OCaml/Forester only exists on the Actions runner, so the build happens there rather than in Netlify's Node-only build image. Netlify just serves the uploaded `dist/`.

## Development

The current site is a small dependency-free Node static build.

```sh
npm run build
npm run serve
```

For local development with rebuilds:

```sh
npm run dev
```

Once the local server is running, you can view the site at [ http://127.0.0.1:4173/]( http://127.0.0.1:4173/) in your web browser.

The generated site is written to `dist/`.

## Notes

The `/notes/` section is set up for [Forester](https://sr.ht/~jonsterling/forester/). Forester is an OCaml tool; install it with opam:

```sh
opam install forester
```

Notes live in `notes/trees`. Forester also needs a `notes/theme` directory (XSLT/CSS templates). The first `npm run build:notes` will fetch the base theme automatically if it is missing.

After Forester is installed:

```sh
npm run build:notes
```

`npm run build` builds the main site and then copies Forester output into `dist/notes/` when the `forester` binary is available.
