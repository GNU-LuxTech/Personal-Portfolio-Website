# LuxTech — Personal Portfolio

Minimal, green-on-black personal portfolio site. Single scrolling page — interactive shell,
about, skills, certifications, projects, live GitHub activity, reviews, and contact — built with
plain HTML, CSS and JS, no framework, no build step.

**Live site:** <https://gnu-luxtech.github.io/Personal-Portfolio-Website/>

## Stack

- HTML5 — single `index.html`
- CSS3 — single `style.css`, no preprocessor
- Vanilla JavaScript — single `script.js`, no framework
- [PDF.js](https://mozilla.github.io/pdf.js/) (via CDN) — renders certificate PDF thumbnails
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) + [Inter](https://rsms.me/inter/) via Google Fonts

No build tools, no dependencies to install — it's static files served as-is.

## Structure

```
.
├── index.html          # all page content/sections
├── style.css            # all styling
├── script.js             # nav, boot sequence, interactive shell, reviews, certs viewer, GitHub activity feed
├── 404.html              # custom not-found page (served automatically by GitHub Pages)
└── assets/
    ├── favicon.svg
    ├── og-image.png       # social share preview image
    └── certs/              # certificate files shown in the Skills section
```

## Running locally

No build step — just open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, select the branch (usually `main`) and root folder (`/`).
4. Save — the site publishes at `https://<username>.github.io/<repo-name>/`
   (or `https://<username>.github.io/` if the repo is named `<username>.github.io`).
5. Update the `og:url` meta tag in `index.html` and the live link above once you have the real URL.

## Adding certificates

Drop image or PDF files into `assets/certs/`, then add an entry to the `certs` array near
the top of `script.js`:

```js
{ title: 'Cert name', issuer: 'Issuer', date: '2026', file: 'assets/certs/your-file.pdf' }
```

## Adding reviews

Edit the `reviews` array in `script.js` — each entry is a `text` / `meta` pair.

---

Built by hand, hosted on GitHub Pages.
