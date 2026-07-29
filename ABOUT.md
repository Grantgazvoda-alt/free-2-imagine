# Free 2 Imagine — Full Repo Map

**Live app:** https://orgasmo.higgsfield.app
**GitHub:** https://github.com/Grantgazvoda-alt/free-2-imagine
**Stack:** TanStack Start (React 19) + Cloudflare Workers + D1 (SQLite) + FNF SDK
**Original design date:** July 2026
**Test count:** 118 tests, 0 failures

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Route Map (25 routes)](#route-map)
3. [Component Library (25 components)](#component-library)
4. [Library Modules (30 lib files)](#library-modules)
5. [Database Migrations (6 migrations)](#database-migrations)
6. [Scripts & CI (7 scripts, 4 workflows)](#scripts--ci)
7. [Tests (118 tests across 12 files)](#tests)
8. [Features & Functions](#features--functions)
9. [What's Missing & How to Improve](#whats-missing--how-to-improve)

---

## Architecture Overview

```
Free 2 Imagine (Orgasmo)
├── app/                          # TanStack Start application
│   ├── src/
│   │   ├── routes/               # 25 route files (13 page + 12 lazy chunks)
│   │   ├── components/           # 25 reusable UI components
│   │   ├── layouts/              # Studio layout (main app shell)
│   │   ├── lib/                  # 30 utility/library modules
│   │   ├── module/               # Design inspector (dev tool)
│   │   └── assets/               # Static assets (SVGs)
│   ├── migrations/               # 6 D1 database migrations
│   ├── tests/                    # 118 tests across 12 files
│   ├── scripts/                  # 7 build/CI scripts
│   └── dist/                     # Build output (content-hashed)
├── .github/workflows/            # 4 CI workflows
├── extracted_assets/             # Generated app branding
├── STRATEGY.md                   # Product strategy document
├── TERMS.md                      # Terms of service
├── PRIVACY.md                    # Privacy policy
└── ABOUT.md                      # This file
```

---

## Route Map

### Public Routes (no auth required)

| Route | File | Purpose | Original Design | Gaps / Improvements |
|-------|------|---------|-----------------|---------------------|
| `/` | `index.tsx` | Home — StudioTemplate (generation UI) | July 2026 | No onboarding tour; first-time user has no guidance |
| `/pricing` | `pricing.tsx` + `pricing-page.tsx` | 3-tier pricing (Free $0 / Pro $9.99 / Enterprise $29.99) | July 2026 | No annual discount toggle; no feature comparison table |
| `/docs` | `docs.tsx` + `docs-page.tsx` | API documentation with endpoint reference | July 2026 | No interactive API playground; no code samples in multiple languages |
| `/terms` | `terms.tsx` + `terms-page.tsx` | Terms of Service | July 2026 | Static text — no version history |
| `/privacy` | `privacy.tsx` + `privacy-page.tsx` | Privacy Policy | July 2026 | Static text — no cookie consent integration |
| `/api/health` | `api/health.ts` | Health check endpoint | July 2026 | No uptime metrics dashboard |
| `/robots.txt` | `robots[.]txt.ts` | SEO robots.txt | July 2026 | — |
| `/sitemap.xml` | `sitemap[.]xml.ts` | SEO sitemap | July 2026 | — |

### Protected Routes (auth required, SSR renders guest state)

| Route | File | Purpose | Original Design | Gaps / Improvements |
|-------|------|---------|-----------------|---------------------|
| `/billing` | `billing.tsx` + `billing-page.tsx` | Usage stats, Stripe portal, export CSV/JSON/email | July 2026 | No real Stripe integration; placeholder price IDs |
| `/team` | `team.tsx` + `team-page.tsx` | Team invite/management, role-based limits | July 2026 | No real email sending; invite emails log to console |
| `/settings` | `settings.tsx` + `settings-page.tsx` | User profile, sign out, appearance | July 2026 | No theme options; no API key management |
| `/analytics` | `analytics.tsx` + `analytics-page.tsx` | Page views, generation stats, feature usage | July 2026 | No real-time analytics; no user cohort analysis |
| `/admin/audit-log` | `admin/audit-log.tsx` + `audit-log-page.tsx` | Audit log with filters, search, CSV export | July 2026 | No real-time streaming; no webhook event log |
| `/admin/email-templates` | `admin/email-templates.tsx` + `email-templates-page.tsx` | Email template editor, preview, bulk actions | July 2026 | No real email sending; templates are static examples |
| `/admin/email-preview` | `admin/email-preview.tsx` + `email-preview-page.tsx` | Preview email templates with variables | July 2026 | No send test email button |
| `/admin/usage-limits` | `admin/usage-limits.tsx` + `usage-limits-page.tsx` | Manage per-plan usage limits | July 2026 | No per-user override; no usage alert thresholds |

### API Routes (server functions)

| Route | File | Purpose | Original Design | Gaps / Improvements |
|-------|------|---------|-----------------|---------------------|
| `/api/user` | `api/user.ts` | Fetch current user via FNF upstream | July 2026 | No caching; no user preferences endpoint |
| `/api/media/upload` | `api/media/upload.ts` | Upload media assets | July 2026 | No chunked upload; no progress tracking |
| `/api/stripe/webhook` | `api/stripe/webhook.ts` | Stripe webhook receiver | July 2026 | No real Stripe keys; webhook signature verification untested |

---

## Component Library

### Core UI Components

| Component | File(s) | Purpose | Original Design | Gaps / Improvements |
|-----------|---------|---------|-----------------|---------------------|
| `StudioTemplate` | `layouts/studio.tsx` | Main app shell — sidebar, prompt box, generation feed, modals | July 2026 | 1299 lines — should be split into smaller components |
| `StudioPromptBox` | `components/studio-prompt-box/` | Generation prompt input with modes | July 2026 | No voice input; no prompt history |
| `SignInModal` | `components/sign-in-modal/` | Higgsfield auth sign-in modal | July 2026 | No guest mode indication |
| `TemplatePicker` | `components/template-picker.tsx` | Example preset templates | July 2026 | Only 6 presets; no user-created templates |
| `AvatarStylePicker` | `components/avatar-style-picker.tsx` | 18 avatar style presets | July 2026 | No custom style creation |
| `AssetLibrary` | `components/asset-library.tsx` | Media asset library with pagination | July 2026 | No search; no folder organization |
| `Gallery` | `components/gallery/` | Justified image gallery with density control | July 2026 | No video thumbnails; no lazy loading indicator |
| `GenerationCard` | `components/generation-card/` | Generation result card with actions | July 2026 | No download progress; no batch re-generate |
| `GenerationDetail` | `components/generation-detail.tsx` | Full-size generation detail view | July 2026 | No zoom/pan; no metadata display |
| `HistoryGrid` | `components/history-grid.tsx` | Generation history grid | July 2026 | No bulk delete; no search/filter |
| `MyProjects` | `components/my-projects.tsx` | User project management | July 2026 | No project sharing; no export |
| `ProjectCreateModal` | `components/project-create-modal/` | Create new project modal | July 2026 | No template from existing |
| `ProjectActions` | `components/project-actions/` | Project action buttons | July 2026 | No batch operations |
| `HelpButton` / `HelpModal` | `components/in-app-help.tsx` | 7-tab in-app help system | July 2026 | No search; no contextual help |
| `HeroComposition` | `components/hero-composition/` | Animated hero section | July 2026 | No video background; no CTA variants |
| `ExamplePresets` | `components/example-presets/` | Preset generation examples | July 2026 | Static presets; no user presets |
| `BeforeAfterCompare` | `components/before-after-compare/` | Before/after image slider | July 2026 | No multi-image compare |
| `Composer` | `components/composer/` | Image composition tools | July 2026 | No layer support; no undo |
| `Dropzone` | `components/dropzone/` | Drag-and-drop file upload area | July 2026 | No progress bar; no multi-file upload |
| `IconTile` | `components/icon-tile/` | Sidebar icon tile component | July 2026 | Known TS error (className prop) |
| `MediaCard` | `components/media-card/` | Media display card | July 2026 | No video playback controls |
| `PromptBox` | `components/prompt-box/` | Individual prompt input | July 2026 | No autocomplete; no prompt templates |
| `SettingTrigger` | `components/setting-trigger/` | Generation setting controls | July 2026 | No custom presets |
| `StepRail` | `components/step-rail/` | Multi-step workflow rail | July 2026 | No progress persistence |
| `UploadField` | `components/upload-field/` | Image upload with preview | July 2026 | No camera capture; no URL paste |
| `UserGenerations` | `components/user-generations/` | User's generation history | July 2026 | No sharing; no export |

---

## Library Modules

### Client-Side Libraries

| Module | File | Purpose | Original Design | Gaps / Improvements |
|--------|------|---------|-----------------|---------------------|
| FNF Browser | `lib/fnf.browser.ts` | Higgsfield FNF client adapter, guest scope, upload | July 2026 | No offline queue; no retry with backoff |
| Generation Approval | `lib/generation-approval.ts` | Host approval SDK for generation | July 2026 | No timeout handling; no batch approval |
| Generation Results | `lib/higgsfield-generation-results.ts` | Map generation results to media refs | July 2026 | No error recovery; no retry logic |
| Error Reporting | `lib/higgsfield-error-reporting.ts` | Error capture and reporting | July 2026 | No stack trace minification; no user context |
| Error Capture | `lib/error-capture.ts` | Client-side error boundary | July 2026 | No error grouping |
| Error Page | `lib/error-page.ts` | Error page renderer | July 2026 | No recovery suggestions |
| Use Analytics | `lib/use-analytics.ts` | Page view + feature tracking hook | July 2026 | No event batching; no offline queue |
| Web Vitals | `lib/web-vitals.ts` | Real User Monitoring — LCP, FID, CLS, TTFB, FCP | July 2026 | No INP (Interaction to Next Paint); no long-task monitoring |
| Download Media | `lib/download-media.ts` | Download generated media | July 2026 | No batch download; no format selection |
| App Meta | `lib/app-meta.ts` | App metadata (title, OG, favicon) | July 2026 | No dynamic meta updates |
| Quanta Icons | `lib/quanta-icons.ts` | Icon shim for Higgsfield icons | July 2026 | — |
| Utils | `lib/utils.ts` | Shared utility functions | July 2026 | No tests; no type guards |

### Server-Side Libraries

| Module | File | Purpose | Original Design | Gaps / Improvements |
|--------|------|---------|-----------------|---------------------|
| FNF Server | `lib/fnf.server.ts` | FNF server function wrappers | July 2026 | No error normalization |
| FNF Functions | `lib/fnf.functions.ts` | Server function definitions | July 2026 | No type-safe return types |
| Auth Server | `lib/auth.server.ts` | Auth middleware for protected routes | July 2026 | No role-based access control |
| Bindings Server | `lib/bindings.server.ts` | Cloudflare binding accessor | July 2026 | No environment validation |
| Config Server | `lib/config.server.ts` | App configuration | July 2026 | No env var validation |
| Security Headers | `lib/security-headers.server.ts` | CSP, HSTS, cache-control headers | July 2026 | No nonce-based CSP |
| Request Errors | `lib/request-errors.server.ts` | Standardized error responses | July 2026 | No error codes enum |
| Upload Security | `lib/upload-request-security.ts` | Upload validation and security | July 2026 | No virus scanning |
| Project Link Retry | `lib/project-link-retry.ts` | Retry logic for project linking | July 2026 | No exponential backoff |
| Studio History | `lib/studio-history.ts` | Generation history pagination | July 2026 | No search; no date filter |
| Studio Projects Server | `lib/studio-projects.server.ts` | Project CRUD functions | July 2026 | No sharing; no export |
| Studio Projects Functions | `lib/studio-projects.functions.ts` | Project server function wrappers | July 2026 | No validation |
| Billing Functions | `lib/billing.functions.ts` | Billing, usage, team, audit log functions | July 2026 | Placeholder Stripe; no real payment |
| Stripe Functions | `lib/stripe.functions.ts` | Stripe checkout session functions | July 2026 | No real keys; webhook not live |
| Analytics Functions | `lib/analytics.functions.ts` | Event tracking functions | July 2026 | No aggregation; no retention |
| Email Server | `lib/email.server.ts` | Email sending (SendGrid → Mailgun → console) | July 2026 | No real API keys; console fallback only |
| Invite Email | `lib/invite-email.ts` | Team invite email rendering | July 2026 | No real sending |
| Design Inspector | `module/design-inspector/` | Dev tool for inspecting component props | July 2026 | Dev-only; no production value |

---

## Database Migrations

| Migration | File | Purpose | Original Design | Gaps / Improvements |
|-----------|------|---------|-----------------|---------------------|
| 0001_init | `migrations/0001_init.sql` | Core tables: users, generations, usage tracking | July 2026 | No indexes on foreign keys |
| 0002_studio_projects | `migrations/0002_studio_projects.sql` | Project management tables | July 2026 | No project sharing tables |
| 0003_analytics | `migrations/0003_analytics.sql` | Analytics event storage | July 2026 | No retention policy; no aggregation tables |
| 0004_subscriptions | `migrations/0004_subscriptions.sql` | Stripe subscription tracking | July 2026 | No invoice history; no payment method storage |
| 0005_teams | `migrations/0005_teams.sql` | Team members, invites, roles | July 2026 | No team permissions table |
| 0006_audit_log | `migrations/0006_audit_log.sql` | Audit log for admin actions | July 2026 | No retention policy; no index on timestamp |

---

## Scripts & CI

| Script | File | Purpose | Original Design | Gaps / Improvements |
|--------|------|---------|-----------------|---------------------|
| Bundle Size Check | `scripts/check-bundle-size.mjs` | Enforce bundle size thresholds | July 2026 | Thresholds may need tuning as features grow |
| Bundle Diff | `scripts/bundle-diff.mjs` | Compare bundle sizes vs baseline | July 2026 | Baseline must be manually updated |
| Performance Measure | `scripts/measure-perf.mjs` | TTFB, bundle load, route timing | July 2026 | No browser-level LCP; no Lighthouse integration |
| Test Coverage | `scripts/test-coverage.mjs` | Generate test coverage report | July 2026 | Only counts test files, not line coverage |
| Coverage Badge | `scripts/coverage-badge.mjs` | Generate SVG coverage badge | July 2026 | No real Istanbul integration |
| Verify Install | `scripts/verify-install.mjs` | Verify workspace dependencies | July 2026 | — |
| Check Adaptation | `scripts/check-adaptation.mjs` | Check app adaptation status | July 2026 | — |

### CI Workflows

| Workflow | File | Purpose | Original Design | Gaps / Improvements |
|----------|------|---------|-----------------|---------------------|
| PR Checks | `.github/workflows/pr-checks.yml` | Tests + bundle size + diff comment on PRs | July 2026 | Token needs `workflow` scope to push |
| Save Baseline | `.github/workflows/save-baseline.yml` | Save bundle baseline on main | July 2026 | Token needs `workflow` scope |
| CI | `.github/workflows/ci.yml` | Build + test on push | July 2026 | — |
| E2E Coverage | `.github/workflows/e2e-coverage.yml` | E2E tests with coverage threshold | July 2026 | No real coverage tooling |

---

## Tests

| Test File | Tests | Purpose | Original Design | Gaps / Improvements |
|-----------|-------|---------|-----------------|---------------------|
| `auth-bootstrap.test.ts` | 4 | FNF bridge, guest scope, upload normalization | July 2026 | No authenticated-user tests |
| `auth-flow-end-to-end.test.ts` | 19 | Full auth flow: guest, protected routes, SSR, headers | July 2026 | No login/logout flow test |
| `e2e.test.ts` | 22 | E2E: route availability, asset loading, generation features | July 2026 | No browser-based tests |
| `features.test.ts` | 30 | Feature completeness: health, pricing, billing, admin, legal | July 2026 | No interactive UI tests |
| `fnf-bridge.test.ts` | 2 | FNF RPC serialization | July 2026 | No error case tests |
| `generation-approval.test.ts` | 4 | Generation approval SDK | July 2026 | No timeout test |
| `generation-results.test.ts` | 5 | Generation result mapping | July 2026 | No error recovery test |
| `history-performance.test.ts` | 2 | Generation history windowing | July 2026 | No large dataset test |
| `performance.test.ts` | 18 | Route timing, TTFB, bundle size, cache headers | July 2026 | No browser-based LCP |
| `project-link-retry.test.ts` | 2 | Project link retry logic | July 2026 | No max retry test |
| `security-boundaries.test.ts` | 4 | Upload security, origin validation | July 2026 | No XSS test |
| `studio-history.test.ts` | 4 | History pagination, cursor handling | July 2026 | No concurrent access test |

---

## Features & Functions

### Generation Features

| Feature | Status | Implementation | Notes |
|---------|--------|---------------|-------|
| Text-to-Image (GPT Image 2) | Done | `studio-prompt-box` + FNF `generateImageJobsFn` | Core feature |
| Avatar Mode (18 styles) | Done | `avatar-style-picker.tsx` + style presets | Reference photo + style |
| Bulk Generation (1-4) | Done | Batch config in `studio-prompt-box` | "Pick the best" modal |
| Reference Image Upload | Done | `UploadField` + `AssetLibrary` | Drag-and-drop |
| Cost Estimation | Done | `costQueryOptions` in `studio.tsx` | Shows credit cost before generation |
| Generation History | Done | `HistoryGrid` + `GenerationCard` | Infinite scroll pagination |
| Project Management | Done | `MyProjects` + `ProjectCreateModal` | Organize generations |
| Style Picker Modal | Done | `AvatarStylePickerModal` | Search, favorites, export/import |
| Template Presets | Done | `ExamplePresets` + `TemplatePicker` | 6 preset examples |

### Billing & Teams

| Feature | Status | Implementation | Notes |
|---------|--------|---------------|-------|
| 3-Tier Pricing | Done | `pricing-page.tsx` | Free $0 / Pro $9.99 / Enterprise $29.99 |
| Stripe Checkout | Placeholder | `stripe.functions.ts` | Needs real keys |
| Usage Tracking | Done | `billing.functions.ts` | Per-user, per-plan |
| Role-Based Limits | Done | Owner 100%, Admin 60%, Member 40% | Applied in generation flow |
| Team Invite | Done | `team-page.tsx` | Invite by scope, accept/decline |
| Billing Portal | Placeholder | Redirects to Higgsfield | Needs Stripe customer portal |
| Usage Export | Done | CSV / JSON / email | Export team usage data |

### Admin

| Feature | Status | Implementation | Notes |
|---------|--------|---------------|-------|
| Audit Log | Done | `audit-log-page.tsx` | Pagination, search, date filter, CSV export |
| Email Templates | Done | `email-templates-page.tsx` | Preview, edit, bulk actions |
| Email Preview | Done | `email-preview-page.tsx` | Variable substitution |
| Usage Limits | Done | `usage-limits-page.tsx` | Per-plan limit management |
| Health Check | Done | `api/health.ts` | D1 connectivity check |

### Monitoring & Analytics

| Feature | Status | Implementation | Notes |
|---------|--------|---------------|-------|
| Page View Tracking | Done | `use-analytics.ts` | Route change tracking |
| Feature Usage Tracking | Done | `trackFeatureUse()` | Event-based |
| Generation Tracking | Done | `trackGeneration()` | Model + variation count |
| Web Vitals (RUM) | Done | `web-vitals.ts` | LCP, FID, CLS, TTFB, FCP |
| Performance Measurement | Done | `measure-perf.mjs` | CLI script |
| Analytics Dashboard | Done | `analytics-page.tsx` | Stats, charts, recent events |

### Infrastructure

| Feature | Status | Implementation | Notes |
|---------|--------|---------------|-------|
| TanStack Start SSR | Done | `vite.config.ts` + `server.ts` | Streaming SSR |
| Cloudflare Workers | Done | `wrangler.jsonc` | Edge deployment |
| D1 Database | Done | 6 migrations | SQLite on Cloudflare |
| FNF SDK Integration | Done | `fnf.*.ts` | Job client, media client, auth |
| Route-Level Code Splitting | Done | `lazyRouteComponent` | 12 lazy page chunks |
| Route Preloading | Done | `defaultPreload: "intent"` | Hover/focus preload |
| Cache Busting | Done | `Cache-Control: no-cache` | Prevents stale HTML |
| Bundle Size CI Guard | Done | `check-bundle-size.mjs` | 6 core bundle thresholds |
| Bundle Size Diff | Done | `bundle-diff.mjs` | PR comparison |
| Security Headers | Done | CSP, HSTS, X-Content-Type-Options | Applied to all responses |
| Error Boundary | Done | `ErrorComponent` in `__root.tsx` | Catches render errors |

---

## What's Missing & How to Improve

### Critical Gaps

| Gap | Impact | Effort | Suggested Fix |
|-----|--------|--------|---------------|
| **No real Stripe integration** | Billing/payments don't work | Medium | Add `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` secrets, verify webhook |
| **No real email sending** | Team invites, usage alerts never arrive | Medium | Add `SENDGRID_API_KEY` or `MAILGUN_API_KEY` secret |
| **No authenticated user test** | Auth flow is untested past guest mode | Small | Add test with mock auth token |
| **No browser-based E2E tests** | Can't verify interactive UI works | Large | Add Playwright/Cypress tests |
| **`StudioTemplate` is 1299 lines** | Maintainability risk | Medium | Split into: sidebar, prompt-box, generation-feed, modals, usage-banner |

### Performance Improvements

| Improvement | Current State | Expected Gain | Effort |
|-------------|---------------|---------------|--------|
| **Add INP monitoring** | Only FID tracked | Better Core Web Vitals | Small |
| **Add resource hints** | No `preconnect`/`dns-prefetch` | Faster CDN connections | Small |
| **Add critical CSS inlining** | Full CSS loaded as a bundle | ~100ms faster FCP | Medium |
| **Add skeleton loading** | No loading states for lazy chunks | Perceived 2x faster | Medium |
| **Add image optimization** | No responsive images | ~50% smaller image payload | Medium |

### Feature Additions

| Feature | Priority | Description | Effort |
|---------|----------|-------------|--------|
| **Prompt history & favorites** | High | Save frequently used prompts | Medium |
| **Batch download** | High | Download all generations at once | Small |
| **Image editor (crop, filter)** | Medium | Edit generated images | Large |
| **Community gallery** | Medium | Share and browse public generations | Large |
| **API key management** | Medium | Generate API keys for headless access | Medium |
| **Webhook integrations** | Low | Trigger webhooks on generation complete | Medium |
| **Mobile PWA support** | Low | Service worker, offline support | Large |

### Code Quality

| Issue | Location | Fix |
|-------|----------|-----|
| `// @ts-nocheck` in studio.tsx | `layouts/studio.tsx` | Add proper type annotations |
| `as any` casts | Multiple files | Replace with proper types |
| `IconTile` TS error | `components/icon-tile/icon-tile.tsx:82` | Fix className prop type |
| 1299-line component | `layouts/studio.tsx` | Split into sub-components |
| Static pricing data | `routes/pricing-page.tsx` | Move to database/API |
| No error boundaries on child routes | All route files | Add per-route error boundaries |

---

*Generated: July 28, 2026*
*Last updated with the latest codebase state*