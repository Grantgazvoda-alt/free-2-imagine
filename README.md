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
---

## API Reference

### Server Functions

The app uses TanStack Start server functions (`createServerFn`) for all backend operations. These run server-side on Cloudflare Workers.

#### Authentication

| Function | Method | Description |
|---|---|---|
| `/api/user` | GET | Returns the current user profile. Proxies `https://fnf.internal/user`. Returns `401` with `{"error":"unauthenticated"}` when not signed in. |
| `/__auth/login?return=<path>` | GET | Redirects to Higgsfield sign-in. After login, redirects back to `return` path. |
| `/__auth/logout?return=<path>` | GET | Signs out the current user and redirects to `return` path. |

#### Generation

| Function | Method | Input | Description |
|---|---|---|---|
| `createJobsFn` | POST | `{ jobSetType, params, confirmationToken? }` | Submit a generation job to the FNF pipeline. |
| `getJobFn` | POST | `{ id }` | Get a single generation job by ID. |
| `getJobSetFn` | POST | `{ id }` | Get all generations in a job set. |
| `listJobsFn` | POST | `{ type?, cursor?, size?, parentId?, status?, model? }` | List generations with optional filters. |
| `estimateCostFn` | POST | `{ jobSetType, params }` | Get the credit cost estimate for a generation input. |
| `cancelJobFn` | POST | `{ id }` | Cancel a running generation job. |

#### Media

| Function | Method | Input | Description |
|---|---|---|---|
| `getMediaFn` | POST | `{ id, type }` | Get a media reference by ID. |
| `listMediaFn` | POST | `{ type, cursor?, size? }` | List uploaded media with pagination. |
| `/api/media/upload` | POST | multipart/form-data with `file` field | Upload an image file. Returns a `MediaRef` with ID and URL. |

#### Profile & Workspace

| Function | Method | Input | Description |
|---|---|---|---|
| `getUserFn` | POST | — | Get the current authenticated user. |
| `listWorkspacesFn` | POST | — | List available workspaces. |
| `getCurrentWorkspaceFn` | POST | — | Get the active workspace. |
| `getWorkspaceWalletFn` | POST | — | Get wallet/credits balance. |
| `switchWorkspaceFn` | POST | `{ workspaceId }` | Switch to a different workspace. |

#### Studio Projects

| Function | Method | Input | Description |
|---|---|---|---|
| `listStudioProjectsFn` | POST | — | List all projects for the current user/workspace. |
| `createStudioProjectFn` | POST | `{ name }` | Create a new project. |
| `renameStudioProjectFn` | POST | `{ projectId, name }` | Rename an existing project. |
| `deleteStudioProjectFn` | POST | `{ projectId }` | Delete a project (generations are kept). |
| `linkStudioGenerationsFn` | POST | `{ projectId, generationIds }` | Link generations to a project. |

#### Analytics

| Function | Method | Input | Description |
|---|---|---|---|
| `trackEventFn` | POST | `{ eventType, eventName, pagePath?, sessionId?, userScope?, metadata? }` | Record an analytics event (page_view, feature_use, or generation). |
| `getAnalyticsSummaryFn` | POST | — | Get analytics summary (page views, top pages, recent events, feature usage, daily views). |

### Generation Input Schema

The generation input passed to `run.start()` follows the `gpt_image_2` job schema:

```typescript
{
  model: "gpt_image_2",
  prompt: { instruction: string },
  media?: { image: MediaRef[] },
  settings: {
    aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16",
    quality: "low" | "medium" | "high",
    resolution: "1k" | "2k" | "4k",
    batchSize: 1 | 2 | 3 | 4,
  }
}
```

### Error Codes

Common errors returned by server functions:

| Code | Description |
|---|---|
| `out_of_credits` | The user's account has insufficient credits. |
| `rate_limit` | Too many requests. |
| `prompt_nsfw` | The prompt was flagged by moderation. |
| `job_failed` | The generation job failed. |
| `timeout` | The generation timed out. |
| `validation` | Invalid input parameters. |
| `confirmation_rejected` | The user declined the cost confirmation. |
| `db_unavailable` | The database is not configured. |
| `internal_error` | An unexpected server error occurred. |

### Database Schema (D1)

The app uses Cloudflare D1 with these tables:

- **`analytics_events`** — Page views, feature usage, and generation events.
- **`studio_projects`** — User-created projects for organizing generations.
- **`studio_generation_projects`** — Links between generations and projects.
