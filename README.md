# Options Dashboard — GitHub Pages SPA (Vite + React + TS)

This is a production-ready **Vite + React + TypeScript** single-page app using **HashRouter**. It auto-deploys to **GitHub Pages** on pushes to `main` using GitHub Actions. No placeholders. The base path is derived from the repository name in CI.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and explore the dashboard. Hash routing ensures refreshes do not 404.

## Build

```bash
npm run build
npm run preview
```

Build output goes to `dist/`.

## Deploy (GitHub Pages)

This repo includes a prewired GitHub Actions workflow:
- On push to `main` → build → upload artifact → deploy to Pages.
- The workflow sets `VITE_GH_BASE` to `/${{ github.event.repository.name }}/` so the final site works at `https://<your-username>.github.io/<this-repo>/` without editing anything.
- Pages source should be **GitHub Actions** (Repo → Settings → Pages → Source: GitHub Actions).

## How the base path & routing work
- **Base path**: Vite uses `process.env.VITE_GH_BASE` set by CI to `/<repo>/`. Dev server ignores base.
- **Routing**: React Router **HashRouter** keeps client routing refresh-safe on Pages.
- A `public/404.html` is included as a safe fallback that redirects to the hash root.

## Final URL
- After the first successful deploy, the Actions summary shows the live **Pages URL**. It will be:

```
https://<your-username>.github.io/<this-repo>/
```

(No placeholders are used in code; the URL naturally follows the repository name.)

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Blank page on Pages | Wrong base path | The CI writes `VITE_GH_BASE=/<repo>/` automatically; ensure workflow ran and deployed. |
| 404 on refresh | Router or fallback misconfig | HashRouter avoids this; `public/404.html` also redirects to `#/`. |
| CSS not applied | Cache or stale artifact | Invalidate cache by bumping a file or re-run the workflow; ensure `dist/` uploaded. |
| Workflow failed | Install/build error | Open Actions logs; verify Node 20, `npm ci`, `npm run build` work locally. |

## What’s inside
- Vite + React + TypeScript
- React Router v6 (**HashRouter**)
- Tailwind CSS (v4)

## Local commands
```bash
npm run dev      # start dev server
npm run build    # build to dist/
npm run preview  # preview prod build on http://localhost:4173
npm run check    # TypeScript type-check
```

---

**You’re done.** Push to `main` and the site auto-deploys to GitHub Pages as a refresh-safe SPA without any manual edits.
