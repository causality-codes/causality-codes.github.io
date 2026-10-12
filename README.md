# causality-codes.github.io

Software and processing codes for Kramers Kronig analysis and related phenomena.

## Pages

| File | Section |
|---|---|
| `index.html` | home — overview and list of codes |
| `datan.html` | original DATAN binaries, manual and references |

## Assets

- `style.css` — shared stylesheet, light/dark via CSS custom properties
- `site.js` — theme toggle (persisted to `localStorage`) and MathJax config
- `.nojekyll` — serve files as-is, bypassing Jekyll

Equations use MathJax 3 from jsDelivr. Everything else is dependency-free.

## Deploy

Push to a repository, then enable Pages:

    Settings → Pages → Source: deploy from branch → main → / (root)

For a user site, name the repo `<username>.github.io` and it serves at the root.

## Adding a page

Copy any algorithm page, then:

1. Update `<title>`.
2. Move `aria-current="page"` to the matching nav link.
3. Add the link to the nav block in all other pages.

The nav is duplicated per page by design — no build step, no templating.
