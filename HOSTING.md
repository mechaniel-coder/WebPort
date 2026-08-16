# Hosting guide

Everything in this repository is **static HTML, CSS and JavaScript**. There is no server,
no database, no runtime dependency and no build step required to put it online.

The pre-built output lives in **`dist/`** and is committed to the repository. That directory
is the deliverable — clone the repo and serve it.

---

## The short version

```bash
git clone https://github.com/mechaniel-coder/WebPort.git
cd WebPort
# point any web server at dist/
```

You do **not** need Node.js, `npm install`, or a build step to host this.

---

## Option 1 — any static host (recommended)

Upload the **contents of `dist/`** to the web root.

| Host | What to do |
| --- | --- |
| Netlify | Drag `dist/` onto the deploy page, or connect the repo with publish directory `dist` |
| Cloudflare Pages | Connect the repo, build command *(leave empty)*, output directory `dist` |
| Vercel | Framework preset "Other", build command *(leave empty)*, output directory `dist` |
| **AWS (S3, CloudFront, Amplify)** | **See [deploy/aws/](deploy/aws/README.md) — read it first, there is one trap that breaks every interior page** |
| nginx / Apache / cPanel | Copy the contents of `dist/` into the document root |

Because the sites use clean URLs (`/aurelia/rooms/` rather than `/aurelia/rooms.html`),
every page is written as a real `index.html` inside a real directory. That works on every
static host without rewrite rules.

### nginx

```nginx
server {
    listen 80;
    server_name exostech.pro;
    root /var/www/webport/dist;
    index index.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    error_page 404 /404/index.html;
}
```

### Apache

Nothing is required — `DirectoryIndex index.html` is the default. Just point
`DocumentRoot` at `dist/`.

---

## Option 1b — free hosts, no GitHub billing, no CI

Nothing in this repository needs GitHub Actions or a paid plan. Three routes that need
neither:

**Netlify Drop — no account, no git, about thirty seconds.**
Open <https://app.netlify.com/drop> and drag the `dist` folder onto it. It is live at a
random subdomain immediately, and you can claim it later if you want a real name.

**Connect the repo to Netlify or Vercel.** Both read config committed here
(`netlify.toml`, `vercel.json`) — publish directory `dist`, no build command, no install
step. Free tier, no card.

**Cloudflare Pages.** Connect the repo and set, in the dashboard:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `dist` |

---

## Option 2 — GitHub Pages

A workflow at `.github/workflows/pages.yml` builds and publishes automatically — but it
**cannot run until Pages is switched on**, and that is a manual step nobody can do for you:

1. Repository **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to the default branch, or run the workflow manually from the **Actions** tab
   (it has a `workflow_dispatch` trigger for exactly this)

The workflow rebuilds with the correct sub-path for a project site
(`https://<user>.github.io/WebPort/`), which is why it does not simply publish the
committed `dist/` — see *Base paths* below. It also runs `verify.js` as a gate, so a build
with a broken link fails instead of publishing.

Only the **default branch** publishes. Pushes to any other branch start a run that skips
immediately, so a feature branch never deploys over production.

> **On cost:** GitHub Pages and Actions are free with no minute limits on **public**
> repositories. This repository is public, so neither should require a paid plan. If Actions
> are unavailable to you anyway, use the branch method below — it uses no CI at all.

### Pages without Actions

Pages can serve a branch directly, which needs no workflow, no minutes and no billing.
Push the built output to a `gh-pages` branch:

```bash
npm run build
git add dist && git commit -m "Build"
npm run publish:branch      # git subtree push --prefix dist origin gh-pages
```

Then **Settings → Pages → Source: Deploy from a branch**, branch `gh-pages`, folder `/`.

Because the branch root is the site root, this serves from
`https://<user>.github.io/WebPort/`, so build with the sub-path first:

```bash
BASE_PATH=/WebPort/ SITE_ORIGIN=https://<user>.github.io npm run build
```

---

## Option 3 — preview it locally

If you do have Node.js 20+:

```bash
npm run build     # regenerate dist/
npm run serve     # http://localhost:4173
npm run verify    # link, metadata and accessibility integrity checks
```

Or with no Node.js at all, from inside `dist/`:

```bash
python3 -m http.server 8000
```

> Opening the HTML files directly with `file://` will not work correctly — the sites use
> root-relative paths and ES modules, both of which require a real server. Any of the
> one-line servers above is fine.

---

## Base paths

Internal links are built from a single configured prefix, `basePath` in `site.config.js`.

| Where it is hosted | Required `basePath` |
| --- | --- |
| A domain root — `https://exostech.pro/` | `/` **(what the committed `dist/` uses)** |
| A subdirectory — `https://you.github.io/WebPort/` | `/WebPort/` |

The committed `dist/` is built for a **domain root**. If you are hosting from a
subdirectory, rebuild:

```bash
BASE_PATH=/WebPort/ npm run build
```

Also set the canonical origin so the `<link rel="canonical">` tags, Open Graph URLs and
`sitemap.xml` point at the real domain:

```bash
SITE_ORIGIN=https://exostech.pro BASE_PATH=/ npm run build
```

---

## What is at which URL

| Path | Site |
| --- | --- |
| `/` | The portfolio hub — case studies, about, contact |
| `/aurelia/` | Aurelia — boutique coastal hotel |
| `/northwind/` | Northwind — B2B observability platform |
| `/forma/` | Forma — design-object storefront |

---

## Forms

Every form validates on the client and then stops — there is no backend, by design.
Each form's submit handler has a single clearly marked hand-off point where a real endpoint
(Formspree, Basin, a Lambda, your own API) can be dropped in. Search the source for
`SUBMIT ENDPOINT` to find them.

Nothing is transmitted anywhere as shipped, so the sites can be hosted publicly without
collecting data or needing a privacy notice for form handling.
