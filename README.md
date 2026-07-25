# Orgasmo — AI Image Studio

Generate any image, no rules. A full-stack AI image generation app built on the Higgsfield platform, using GPT Image 2 for unrestricted image creation.

**Live at:** https://orgasmo.higgsfield.app

---

## Features

### Core

- **Unrestricted image generation** — describe any image and generate it with GPT Image 2. No content filters, no limits.
- **Reference image upload** — attach a reference image to guide the generation style or composition.
- **Aspect ratio control** — choose from Square (1:1), Portrait (3:4), Landscape (4:3), Wide (16:9), or Story (9:16).
- **Style presets** — pick from Natural, Vivid, Cinematic, Anime, Illustration, Noir, or Fantasy.

### Bulk Generation

- **Variations** — generate 1-4 variations of the same prompt in one batch.
- **Pick the best** — after bulk generation, a modal shows all results side-by-side so you can choose the best one.

### Workspace

- **Generation feed** — browsable history of all your generated images.
- **Projects** — organize generations into named projects.
- **Sign-in with Higgsfield** — authenticated workspace with your credits and profile.

### Templates

Six built-in style templates to jumpstart your creativity:

| Template | Description |
|---|---|
| Cyberpunk City | Neon-lit futuristic streetscapes |
| Fantasy Portrait | Epic character in a magical world |
| Surreal Landscape | Dreamlike impossible environments |
| Noir Film Frame | High-contrast dramatic monochrome |
| Vaporwave | Retro 80s synthwave aesthetic |
| Product Hero | Clean studio-grade product shot |

### Analytics

Built-in analytics tracking page views, feature usage, and generation events. Data is stored in D1 and accessible via `getAnalyticsSummaryFn`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TanStack Start (SSR) |
| Runtime | Cloudflare Workers |
| Database | D1 (SQLite) |
| Image Generation | GPT Image 2 via Higgsfield fnf SDK |
| UI Components | @higgsfield/quanta |
| Auth | Higgsfield Platform Auth |
| Icons | Lucide React + Phosphor Icons |
| Build | Vite 8 + Rolldown |

---

## Project Structure

```
app/
├── migrations/           # D1 database migrations
│   ├── 0001_init.sql
│   ├── 0002_studio_projects.sql
│   └── 0003_analytics.sql
├── src/
│   ├── components/       # Shared UI components
│   │   ├── hero-composition/
│   │   ├── studio-prompt-box/
│   │   ├── template-picker.tsx
│   │   ├── user-generations/
│   │   └── ...
│   ├── layouts/          # Page layouts
│   │   ├── studio.tsx    # Main Studio workspace
│   │   └── AGENTS.md
│   ├── lib/              # Utilities and server functions
│   │   ├── analytics.functions.ts
│   │   ├── use-analytics.ts
│   │   ├── fnf.browser.ts
│   │   ├── fnf.server.ts
│   │   └── ...
│   ├── routes/           # TanStack Router routes
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   └── api/user.ts
│   └── app-meta.json     # Page metadata (title, description, OG)
├── tests/
│   └── e2e.test.ts       # End-to-end tests
├── app.manifest.json     # Cloudflare bindings config
└── package.json
```

---

## Development

### Prerequisites

- Node.js 20+
- Bun 1.3+

### Setup

```bash
cd app
bun install
```

### Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run typecheck    # Type checking
bun run test         # Run tests
bun run lint         # Lint
```

### Environment

The app runs on Cloudflare Workers with D1 for persistence. Local development falls back to in-memory storage for the Studio projects feature.

### Testing

```bash
bun run test
```

The E2E tests verify:
- Page loads (HTTP 200)
- All JS/CSS assets serve correctly
- API endpoints respond as expected
- HTML structure is correct (SSR, streaming, security headers)
- App metadata is present (title, OG tags)
- Key features are compiled into the JS bundles

---

## Deployment

The app is deployed via the Higgsfield platform's CI/CD pipeline:

```bash
# Push changes to trigger a deploy
git push origin main

# The platform CI builds and deploys automatically
# Or manually:
deploy_website(website_id="db5d4b46-285d-4de3-b10a-2b0eb7062f9f")
```

---

## Publishing

To publish to the Higgsfield community feed, the app cover and icon must be generated first:

1. Run `generate_app_branding` with the app's scene concept and icon style
2. Run `finalize_app_branding` with the winning scene and icon
3. Fill `og_image_url`, `favicon_url`, and `marketplace_cover_url` in `app-meta.json`
4. Call `deploy_website` then `publish_website`

---

## Credits

Built with the [Higgsfield](https://higgsfield.ai) platform.