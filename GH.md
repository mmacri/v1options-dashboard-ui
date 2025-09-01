GH.MD — Deploying the Interactive Options Trading Strategies Dashboard to GitHub Pages

This guide makes the dashboard run exactly as-is on GitHub Pages, including charts (Recharts), animations (motion/react), Tailwind v4 styles, shadcn/ui components, accessibility, and the optional Extended Scenarios module.

TL;DR
•Use Vite + React 18.
•Set vite.config.ts base correctly for your Pages URL.
•One-click GitHub Actions deployment to Pages (artifact → deploy-pages).
•Add SPA fallback (copy index.html → 404.html).
•(Optional) Custom domain via public/CNAME.
•Optional ?extended=1 flag for Extended Scenarios.

⸻

1) Prerequisites
•GitHub repository (public or private with Pages enabled).
•Node.js 20.x LTS (Pages Actions runner uses Node 20 by default).
•npm (or pnpm/yarn—commands below use npm).
•You’re using the project structure defined in Agent.md / PDI.md:

├── index.html
├── App.tsx
├── components/
│   ├── InteractiveOptionsChart.tsx
│   ├── StrategyVisualizer.tsx
│   ├── GreeksExplainer.tsx
│   ├── figma/
│   │   └── ImageWithFallback.tsx   # do not modify
│   └── ui/                         # shadcn/ui, do not modify
├── styles/
│   └── globals.css                 # Tailwind v4 tokens
├── guidelines/
│   └── Guidelines.md
├── Agent.md
└── PDI.md

⚠️ Do not modify components/ui/* or figma/ImageWithFallback.tsx.

⸻

2) Package Setup (pinned versions)

Create/update package.json:

{
  "name": "interactive-options-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --strictPort --port 4173",
    "check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "motion": "11.15.0",
    "recharts": "2.12.7",
    "lucide-react": "0.452.0",
    "@radix-ui/react-slot": "1.1.0"
  },
  "devDependencies": {
    "@types/react": "18.3.5",
    "@types/react-dom": "18.3.0",
    "@vitejs/plugin-react": "4.3.2",
    "autoprefixer": "10.4.20",
    "postcss": "8.4.47",
    "tailwindcss": "4.0.0",
    "typescript": "5.5.4",
    "vite": "5.4.2"
  }
}

Tailwind v4 is used (as required). Tokens live in styles/globals.css and are imported by your app; no extra Tailwind config is necessary unless you’re customizing.

Install:

npm install


⸻

3) Vite Configuration for GitHub Pages

Create vite.config.ts at the repo root:

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Change this to match your Pages type:
//
// 1) Project Pages: https://<user>.github.io/<REPO_NAME>/  -> base: '/<REPO_NAME>/'
// 2) User/Org Pages (root): https://<user>.github.io/       -> base: '/'
//
// TIP: We'll infer base from an env var to keep this file reusable.
//      For project pages:  VITE_GH_BASE=/REPO_NAME/
//      For root pages:     VITE_GH_BASE=/

const base = process.env.VITE_GH_BASE || '/<REPO_NAME>/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2019',
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 5173,
    open: true
  }
});

Choose your base:
•Project Pages (most common)
Repo: yourname/interactive-options-dashboard
Pages URL: https://yourname.github.io/interactive-options-dashboard/
→ set VITE_GH_BASE=/interactive-options-dashboard/ (or hardcode base to that string)
•User/Org Pages (repo named yourname.github.io)
Pages URL: https://yourname.github.io/
→ set VITE_GH_BASE=/

You can export the env var in CI (see workflow below). For local dev, Vite ignores base at runtime, so it’s safe either way.

⸻

4) SPA Fallback (Required)

GitHub Pages doesn’t handle single-page app client routing automatically. Even though this app doesn’t use React Router, SPA fallback still prevents refresh 404s on nested paths or anchors.

We’ll copy dist/index.html to dist/404.html during the build upload step in CI.

⸻

5) Optional: Custom Domain
•Add a file public/CNAME with your custom domain:

options.example.com


•Enable “Custom domain” in the repository Settings → Pages, paste the domain, and Enforce HTTPS once the certificate is ready.

With a CNAME, keep base exactly the same as your Pages type. For a custom domain pointing to Project Pages, you still need base: '/<REPO_NAME>/'.

⸻

6) GitHub Actions Workflow (Zero-click Deploy)

Create .github/workflows/deploy.yml:

name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install
        run: npm ci

      # Set GH base for Project Pages; for root pages, set to "/" instead
      - name: Set VITE_GH_BASE
        run: echo "VITE_GH_BASE=/${{ github.event.repository.name }}/" >> $GITHUB_ENV

      - name: Build
        run: npm run build

      - name: Add SPA fallback (404.html)
        run: cp dist/index.html dist/404.html

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4

For User/Org Pages at root, replace the Set VITE_GH_BASE step with:

- name: Set VITE_GH_BASE
  run: echo "VITE_GH_BASE=/" >> $GITHUB_ENV



Enable Pages:
Repo → Settings → Pages → Source: GitHub Actions (it auto-detects this workflow).

⸻

7) Local Development

npm run dev         # http://localhost:5173
npm run build       # builds to dist/
npm run preview     # local preview at http://localhost:4173

The app is client-only (no server). All data is computed from sliders & formulas; no environment variables required.

⸻

8) Production Behavior on Pages (What’s Included)
•Tailwind v4 tokens from styles/globals.css are bundled by Vite and applied globally.
•Recharts renders payoff charts with:
•P/L line, y=0, vertical current-price line
•Breakeven ReferenceDots
•Profit/Loss shaded zones
•Custom tooltip (price, P/L, zone note)
•motion/react handles expand/collapse animations (respects prefers-reduced-motion).
•shadcn/ui components (from ./components/ui/) are compiled as normal React code—no server needed.
•Accessibility: ARIA labels on sliders/buttons/tabs, keyboard navigation, visible focus ring.
•Walkthrough: first-run overlay using localStorage key otsd_tour_completed.
•Telemetry (optional): current spec logs to console or your own wrapper; no external network calls by default.

⸻

9) Extended Scenarios Module (Over 4 strategies)

Per Agent.md, the Core 4 are implemented in code. You can optionally surface 8 additional UI-only strategies (for education/compare-mode) behind a flag.

Enable Extended Scenarios at Build Time (Static)

In vite.config.ts, add a define flag and use it in your code:

export default defineConfig({
  base,
  plugins: [react()],
  define: {
    __EXTENDED_STRATEGIES__: JSON.stringify(true)  // set false to hide
  }
});

In your code (e.g., App.tsx):

declare const __EXTENDED_STRATEGIES__: boolean;

const enableExtendedStrategies =
  typeof __EXTENDED_STRATEGIES__ !== 'undefined'
    ? __EXTENDED_STRATEGIES__
    : false;

Enable at Runtime (Query Param / LocalStorage)
•Query param: ?extended=1 → set localStorage otsd_extended=true on load.
•Button in Header: “Show Extended Scenarios” toggles the flag and re-renders.

Either way works on GitHub Pages since it’s client-side only.

⸻

10) Index HTML Notes

Your index.html should be minimal (Vite default). Example:

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Options Trading Strategies</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

You do not need a <base> tag; Vite injects asset paths according to base in vite.config.ts.

⸻

11) Common Pitfalls & Fixes

SymptomLikely CauseFix
Site loads blank on PagesWrong base in vite.config.tsSet base to /<REPO_NAME>/ for Project Pages, or / for User/Org Pages.
Refreshing page shows 404SPA fallback missingEnsure workflow copies dist/index.html to dist/404.html.
CSS not loading on PagesWrong asset paths from baseSame as above—fix Vite base.
Mixed content (HTTP) with CNAMEHTTPS not enforcedIn Pages settings, Enforce HTTPS; wait for certificate.
Fonts or icons missingBlocked external CDNBundle local assets or allow the CDN; lucide-react is bundled, no CDN needed.
Animation motion sensitivityReduced motion not honoredConfirm you check prefers-reduced-motion and disable motion accordingly.
“Extended Scenarios” not visibleFlag offTurn on compile-time __EXTENDED_STRATEGIES__ or use ?extended=1 / localStorage.


⸻

12) Verification Checklist (GitHub Pages)
1.Actions tab shows successful build then deploy jobs.
2.Pages environment URL (Summary of the deploy job) opens with the dashboard.
3.Header, market sliders, Greeks, 4 core strategies, and disclaimer all visible.
4.Adjust sliders → charts & Greeks update within the performance budget.
5.Expand a strategy: animation ≤ 300ms; ARIA aria-expanded toggles.
6.Tooltip on chart shows price, P/L, and zone note.
7.Walkthrough appears only on first visit; “Replay Tour” works.
8.(If enabled) Extended Scenarios appear and Compare Mode works.
9.SPA fallback works (refresh stays on the app).
10.No console errors.

⸻

13) Local Scripts & Quality Gates
•npm run dev – dev server with HMR
•npm run build – production build
•npm run preview – preview build locally
•npm run check – TypeScript type check

Keep component line limits (IOC ≤ 400, Greeks ≤ 300, Viz ≤ 150). No imports from framer-motion.

⸻

14) Security & Privacy
•No external secrets required; this is a fully client-side educational app.
•If you add analytics later, ensure consent and avoid PII in telemetry.

⸻

15) License & Credits
•Include your preferred OSS license in LICENSE.
•Note the libraries used: React, Vite, Tailwind v4, shadcn/ui, lucide-react, motion/react, Recharts.
•Educational disclaimer: The dashboard is for educational purposes only and does not provide financial advice.

⸻

16) Support
•Issues & PRs → GitHub Issues in this repo.
•For Pages deployment help, check Actions logs and the Troubleshooting table above.

⸻

Done ✅
