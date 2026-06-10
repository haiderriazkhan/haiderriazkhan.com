# Personal Website

This repository hosts my [personal website](https://haiderriazkhan.com/). It is built and deployed through [Netlify](https://www.netlify.com/).

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
