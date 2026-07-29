# Free 2 Imagine (Orgasmo) — AI Image Studio

**Live at:** https://orgasmo.higgsfield.app
**GitHub:** https://github.com/Grantgazvoda-alt/free-2-imagine
**Full repo map:** [ABOUT.md](./ABOUT.md) — includes every function, feature, tool, test, and improvement roadmap

Generate any image, no rules. A full-stack AI image generation app built on the Higgsfield platform, using GPT Image 2 for unrestricted image creation.

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

## User Guide

### Getting Started

1. **Visit** https://orgasmo.higgsfield.app
2. **Sign in** with your Higgsfield account (click Sign In in the sidebar or go to /settings)
3. **Choose a mode** — Freeform (general image generation) or Avatar (portrait from a reference photo)
4. **Enter a prompt** describing what you want to generate
5. **Adjust settings** — aspect ratio, style, number of variations
6. **Click Generate** — the cost is shown in the button; confirm in the approval modal

### Freeform Mode

The default mode for generating any image. Supports:
- Text prompts describing the image
- Reference image uploads for style guidance
- Style presets: Natural, Vivid, Cinematic, Anime, Illustration, Noir, Fantasy
- Aspect ratios: Square, Portrait, Landscape, Wide, Story
- Bulk variations: 1-4 images per generation

### Avatar Mode

Creates personalized avatars from a reference photo. Switch to Avatar mode in the prompt box.

**How to use:**
1. Upload a reference photo (click the Reference upload button)
2. Choose a style from 18 presets
3. Adjust the batch count (1, 4, 6, all 18, or custom)
4. Click Generate

**Style presets:**
Professional, Fantasy, Cartoon, Cyberpunk, Anime, Realistic, Pixel Art, Noir, Watercolor, Oil Painting, Sketch, 3D Render, Steampunk, Gothic, Pop Art, Renaissance, Vaporwave, Minimalist

**Batch modes:**
- Single style: generates one avatar in the selected style
- 4/6 styles: randomly picks that many styles
- All 18 styles: generates every style
- Custom: enter a specific number (1-36)

### Managing Your Work

- **Generation Feed** — browse all your generated images from the sidebar
- **Projects** — organize generations into named projects
- **Favorites** — mark avatar styles as favorites (persisted in your browser)
- **Export/Import Favorites** — download your favorites as JSON and share them

### Keyboard Shortcuts

- `Enter` — Generate (when prompt is focused)
- `Escape` — Close modals (pick-best, style picker)
- Sidebar navigation — click icons to switch between Home, All Generations, Analytics, Settings

## Monitoring & Health

### Health Check Endpoint

```
GET /api/health
```

Returns the app's status, database connectivity, and version information:

```json
{
  "status": "ok",
  "app": "orgasmo",
  "version": "1.0.0",
  "timestamp": "2026-07-25T...",
  "checks": {
    "database": "connected",
    "auth": "available"
  }
}
```

### Analytics Dashboard

Visit `/analytics` to view:
- Total page views and generation counts
- Page views over the last 14 days (bar chart)
- Top pages ranked by visits
- Feature usage breakdown
- Recent events feed

Analytics data is stored in D1 and tracked automatically via the `usePageViewTracking` hook.

### Error Tracking

Errors are reported through the Higgsfield platform's error tracking system (`window.__higgsfieldEvents`). The app includes:
- TanStack Router error boundary with "This page didn't load" recovery
- Server-side error middleware that catches SSR failures
- Structured error reporting with context

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TanStack Start |
| SSR | Cloudflare Workers (streaming) |
| Database | D1 (SQLite) |
| Image Generation | GPT Image 2 via Higgsfield fnf SDK |
| UI Components | @higgsfield/quanta |
| Auth | Higgsfield Platform Auth |
| Routing | TanStack Router v1 |
| Build | Vite 8 + Rolldown |
| Icons | Lucide React + Phosphor Icons |
| Tests | Bun test |

### Project Structure

```
orgasmo/
├── app/
│   ├── migrations/           # D1 database migrations
│   │   ├── 0001_init.sql
│   │   ├── 0002_studio_projects.sql
│   │   └── 0003_analytics.sql
│   ├── src/
│   │   ├── components/       # Shared UI components
│   │   │   ├── avatar-style-picker.tsx
│   │   │   ├── hero-composition/
│   │   │   ├── studio-prompt-box/
│   │   │   └── ...
│   │   ├── layouts/          # Page layouts
│   │   │   ├── studio.tsx     # Main workspace layout
│   │   │   └── AGENTS.md
│   │   ├── lib/              # Utilities and server functions
│   │   │   ├── analytics.functions.ts
│   │   │   ├── use-analytics.ts
│   │   │   ├── fnf.browser.ts
│   │   │   └── ...
│   │   ├── routes/           # App routes
│   │   │   ├── __root.tsx     # Root layout + auth
│   │   │   ├── index.tsx      # Studio workspace (home)
│   │   │   ├── analytics.tsx  # Analytics dashboard
│   │   │   ├── docs.tsx       # API documentation
│   │   │   ├── settings.tsx   # User settings/profile
│   │   │   ├── api/           # API endpoints
│   │   │   │   ├── user.ts
│   │   │   │   ├── health.ts
│   │   │   │   └── media/upload.ts
│   │   │   └── ...
│   │   └── app-meta.json     # Page metadata
│   ├── tests/                # Test files
│   │   ├── e2e.test.ts       # E2E tests
│   │   └── coverage-report.md
│   ├── scripts/              # Utility scripts
│   │   ├── test-coverage.mjs
│   │   └── coverage-badge.mjs
│   └── package.json
├── .github/workflows/        # CI/CD
│   └── e2e-coverage.yml
└── README.md
```

### Data Flow

1. User enters a prompt → `StudioPromptBox` component
2. Prompt is validated and passed to `useGenerationRun` hook
3. Hook calls `createJobsFn` server function → FNF SDK → GPT Image 2
4. User confirms the cost in the approval modal
5. Job is submitted, polled until completion
6. Result URL is returned and rendered in the feed
7. Analytics event is tracked (`trackGeneration`)

### Routes

| Route | Description |
|---|---|
| `/` | Studio workspace (home) |
| `/analytics` | Analytics dashboard |
| `/docs` | API documentation |
| `/settings` | User settings |
| `/api/user` | User profile (GET) |
| `/api/health` | Health check (GET) |
| `/api/media/upload` | Media upload (POST) |

### Database Schema

Three D1 tables:

- **`analytics_events`** — Page views, feature usage, generation events
- **`studio_projects`** — User-created projects
- **`studio_generation_projects`** — Links between generations and projects

## Development

### Prerequisites

- Node.js 20+
- Bun 1.3+

### Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server
bun run build        # Production build
bun run test         # Run all tests
node scripts/test-coverage.mjs  # Generate coverage report
node scripts/coverage-badge.mjs # Generate coverage badge
```

### Testing

49 E2E tests covering:
- Page loads and asset availability
- API endpoints and security headers
- HTML structure and SSR
- Generation flow features (prompt box, upload, cost, auth)
- Template picker and bulk generation
- Analytics dashboard

### CI/CD

The GitHub Actions workflow at `.github/workflows/e2e-coverage.yml`:
- Runs on every PR and push to main
- Executes all 49 E2E tests
- Generates a coverage report
- Posts a summary as a PR comment
- Uploads coverage badge, report, and test output as artifacts
- Fails if coverage drops below 100%

## Deployment

The app is deployed via the Higgsfield platform. After pushing changes:

```bash
git push origin main
# Platform CI builds and deploys automatically
```

Manual deploy via the website builder tools.

## Publishing

To publish to the Higgsfield community feed, the app cover and icon must be generated first:

1. Run `generate_app_branding` with the scene concept and icon style
2. Run `finalize_app_branding` with the winning scene and icon
3. Fill `og_image_url`, `favicon_url`, and `marketplace_cover_url` in `app-meta.json`
4. Deploy and publish

## Admin Features

### Email Templates
The `/admin/email-templates` page provides a full template management system:

**Bulk Actions:**
- **Select All / Deselect All** — toggle selection for all templates
- **Download All** — downloads each selected template as a separate `.html` file
- **Copy All** — copies all selected templates' HTML to clipboard, separated by `---`
- **Delete** — removes selected templates (with confirmation prompt)
- **Clear** — clears the current selection

**Template Preview:**
- Live HTML preview in an `<iframe>` with `sandbox="allow-same-origin"`
- Customizable template variables
- Copy HTML and Download buttons
- Plain text version displayed below
- Character count and text-to-HTML ratio stats

**Templates Available:**
| Template | Variables |
|---|---|
| Team Invite | inviterName, teamName, memberName, role, inviteLink, expiresIn |
| Usage Export | filename, generatedDate, recordCount, format |
| Usage Limit Warning | planName, limit, used, percent, memberName |
| Welcome | userName, getStartedLink |
| Password Reset | userName, resetLink, expiresIn |

### Audit Log
The `/admin/audit-log` page tracks all admin actions:

**Filters:**
- **Search** — filter by action, details, or target
- **Action Type** — 10 types with icons and colors
- **Date Range** — start and end date pickers
- **Clear All Filters** — reset all filters at once

**Export:**
- **CSV Export** — downloads filtered audit log entries as CSV
- Respects all active filters (action, search, date range)
- Includes: id, action, target_type, target_id, details, created_at

**Pagination:**
- 25 entries per page with Previous/Next buttons
- Smart page number windowing for large page counts
- Total entry count with active filter summary

### Usage Limits
The `/admin/usage-limits` page allows overriding role-based limits:

- View current plan and default limits
- Set custom limits for Owner, Admin, and Member roles
- Saves to KV storage
- Changes logged to audit trail

### Email Preview
The `/admin/email-preview` page provides a standalone template previewer:

- Customizable member name and role
- Live HTML iframe preview
- Copy HTML/Text buttons
- Plain text fallback view
- Character count stats
