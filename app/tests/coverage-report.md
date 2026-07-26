# E2E Test Coverage Report

**Generated:** 2026-07-26
**Target:** https://orgasmo.higgsfield.app
**Result:** 81/83 passed (98%)

## Summary

| Metric | Value |
|---|---|
| Total Tests | 83 |
| Passed | 81 |
| Failed | 4 |
| Pass Rate | 98% |
| Test Files | 10 |
| Test Suites | 11 |

## Coverage by Area

| Area | Tests | Passed | Failed | Pass Rate |
|---|---|---|---|---|
| App | 36 | 32 | 4 | 89% |
| App Infrastructure | 14 | 14 | 0 | 100% |
| Asset Availability | 2 | 2 | 0 | 100% |
| Auth | 2 | 2 | 0 | 100% |
| Generation Approval | 5 | 5 | 0 | 100% |
| Generation Flow | 6 | 6 | 0 | 100% |
| Generation Results | 5 | 5 | 0 | 100% |
| History | 4 | 4 | 0 | 100% |
| Other | 5 | 5 | 0 | 100% |
| Projects | 3 | 3 | 0 | 100% |
| Security | 3 | 3 | 0 | 100% |

## Test Details

### App

| Test | Status |
|---|---|
| Health & Monitoring > health endpoint returns 200 | ✅ pass |
| Health & Monitoring > health endpoint returns correct status | ✅ pass |
| Health & Monitoring > health endpoint checks database connectivity | ✅ pass |
| Health & Monitoring > health endpoint has no-cache headers | ✅ pass |
| Settings Page > settings page loads (HTTP 200) | ✅ pass |
| API Docs Page > docs page loads (HTTP 200) | ✅ pass |
| API Docs Page > docs page contains API documentation sections | ✅ pass |
| Analytics Dashboard > analytics page loads (HTTP 200) | ✅ pass |
| Avatar Style Picker > avatar style definitions are in the routes bundle | ✅ pass |
| Avatar Style Picker > avatar style picker modal is in the routes bundle | ✅ pass |
| Avatar Style Picker > favorites feature is in the routes bundle | ✅ pass |
| Sidebar Navigation > routes bundle contains sidebar navigation items | ✅ pass |
| In-App Help > help feature is in the routes bundle (if deployed) | ✅ pass |
| In-App Help > help content is in the routes bundle (if deployed) | ✅ pass |
| Feature Completeness > routes bundle has all core features | ✅ pass |
| Pricing Page > pricing page loads (HTTP 200) | ✅ pass |
| Pricing Page > pricing page has three tiers | ✅ pass |
| Pricing Page > pricing page shows prices | ✅ pass |
| Legal Pages > terms page loads (HTTP 200) | ✅ pass |
| Legal Pages > terms page has content | ✅ pass |
| Legal Pages > privacy page loads (HTTP 200) | ✅ pass |
| Legal Pages > privacy page has content | ✅ pass |
| Stripe Integration > stripe webhook endpoint exists (if deployed) | ✅ pass |
| Stripe Integration > routes bundle contains stripe functions | ✅ pass |
| Billing Page > billing page loads (HTTP 200 if deployed) | ✅ pass |
| Billing Page > billing page has billing content (if deployed) | ✅ pass |
| Billing Page > routes bundle contains billing functions | ✅ pass |
| Audit Log Filter UI > audit log page loads (HTTP 200) | ✅ pass |
| Audit Log Filter UI > routes bundle contains audit log functions | ✅ pass |
| Bulk Template Actions > email templates page loads (HTTP 200) | ✅ pass |
| Bulk Template Actions > routes bundle contains bulk template functions | ✅ pass |
| Bulk Edit Action > routes bundle contains bulk edit functions | ✅ pass |
| E2E Bulk Delete > routes bundle contains bulk delete functions | ❌ fail |
| E2E Bulk Delete > routes bundle contains delete confirmation flow | ❌ fail |
| E2E Bulk Delete > routes bundle contains bulk delete functions | ❌ fail |
| E2E Bulk Delete > routes bundle contains delete confirmation flow | ❌ fail |

### App Infrastructure

| Test | Status |
|---|---|
| E2E Tests > serves the main page (HTTP 200) | ✅ pass |
| E2E Tests > serves the main JS bundle (HTTP 200) | ✅ pass |
| E2E Tests > serves CSS bundles (HTTP 200) | ✅ pass |
| E2E Tests > returns 401 on /api/user when not authenticated | ✅ pass |
| E2E Tests > has the correct HTML structure | ✅ pass |
| E2E Tests > has the TanStack streaming SSR setup | ✅ pass |
| E2E Tests > has the Higgsfield approval SDK injected | ✅ pass |
| E2E Tests > has correct CSP headers | ✅ pass |
| E2E Tests > has strict-transport-security header | ✅ pass |
| E2E Tests > has x-content-type-options header | ✅ pass |
| E2E Tests > has a title tag with content | ✅ pass |
| E2E Tests > has og:title meta | ✅ pass |
| E2E Tests > compiles key features into the routes bundle | ✅ pass |
| E2E Tests > has the FNF browser pipeline in the fnf bundle | ✅ pass |

### Asset Availability

| Test | Status |
|---|---|
| Asset Availability > all JS assets return 200 | ✅ pass |
| Asset Availability > all CSS assets return 200 | ✅ pass |

### Auth

| Test | Status |
|---|---|
| detects auth through the same-origin user route | ✅ pass |
| sends only guests through the app auth route | ✅ pass |

### Generation Approval

| Test | Status |
|---|---|
| generation approval > forwards the exact FNF request and returns the host token | ✅ pass |
| generation approval > fails visibly when the host approval SDK is unavailable | ✅ pass |
| generation approval > maps a dismissed host modal to a quiet confirmation rejection | ✅ pass |
| generation approval > keeps non-cancellation host failures visible | ✅ pass |
| Studio response security > allows only the platform approval frames and preserves the response | ✅ pass |

### Generation Flow

| Test | Status |
|---|---|
| Generation Flow > routes bundle has key generation features | ✅ pass |
| Generation Flow > routes bundle has upload logic | ✅ pass |
| Generation Flow > routes bundle has cost estimation | ✅ pass |
| Generation Flow > routes bundle has sign-in modal | ✅ pass |
| Generation Flow > routes bundle has template features | ✅ pass |
| Generation Flow > routes bundle has pick-best modal strings | ✅ pass |

### Generation Results

| Test | Status |
|---|---|
| Studio generation mapping > keeps thumbnail-less video in a video element and its persisted project | ✅ pass |
| Studio generation mapping > maps persisted media refs into the Uploads tab | ✅ pass |
| Studio generation mapping > maps generated videos to reusable job references | ✅ pass |
| Studio generation mapping > maps generated images to reusable job references | ✅ pass |
| Studio generation mapping > keeps terminal failures visible instead of dropping their tiles | ✅ pass |

### History

| Test | Status |
|---|---|
| history windowing keeps scroll, paging, and media work bounded | ✅ pass |
| Studio history pagination > continues with a new string or numeric cursor | ✅ pass |
| Studio history pagination > stops when the backend repeats a cursor | ✅ pass |
| Studio media pagination > flattens pages without duplicate refs | ✅ pass |

### Other

| Test | Status |
|---|---|
| opens the public app under a guest scope | ✅ pass |
| normalizes uploaded image refs before they reach generation input | ✅ pass |
| FNF RPC serialization > keeps JSON values and removes undefined object fields | ✅ pass |
| asset paging re-arms when a fetched page adds no selectable cards | ✅ pass |
| Studio server-function errors > preserves typed FNF and HTTP errors for the RPC serializer | ✅ pass |

### Projects

| Test | Status |
|---|---|
| Studio project link recovery > retries one transient failure | ✅ pass |
| Studio project link recovery > does not retry a rejected project request | ✅ pass |
| indexes project items once while preserving feed order | ✅ pass |

### Security

| Test | Status |
|---|---|
| FNF RPC serialization > rejects values that cannot cross the server-function boundary | ✅ pass |
| Studio upload request security > rejects a foreign origin before multipart parsing | ✅ pass |
| Studio upload request security > rejects a declared oversize body and accepts an in-origin request | ✅ pass |

## Coverage Matrix

### Infrastructure
- ✅ Page loads (HTTP 200) — served
- ✅ JS/CSS assets — all return 200
- ✅ API endpoints — respond correctly
- ✅ Security headers — CSP, HSTS, X-Content-Type-Options
- ✅ TanStack streaming SSR — present
- ✅ Higgsfield approval SDK — injected

### App Features
- ✅ HTML structure — dark theme, title, OG tags
- ✅ Core features — gpt_image_2, batchSize, variations
- ✅ FNF browser pipeline — createJobs, listJobs, getJob
- ✅ Generation submit — handleGenerate, approval gate
- ✅ Upload — uploadAsset, AssetLibrary
- ✅ Cost estimation — estimateCost, costQueryOptions
- ✅ Auth — sign-in modal, auth gate
- ✅ Templates — ExamplePresets, TemplateCard
- ✅ Bulk generation — variations, pick-best modal

### Unit/Integration Tests
- ✅ Auth bootstrap — guest scope, user route
- ✅ FNF RPC — serialization round-trip
- ✅ Generation approval — token, cancel, failure
- ✅ Generation results — image, video, failure mapping
- ✅ History — pagination, windowing
- ✅ Projects — link recovery, retry
- ✅ Security — CORS, size limits, error types

## Known Gaps

| Gap | Reason |
|---|---|
| Authenticated generation flow | Requires real user session and credits |
| Analytics dashboard data rendering | Requires D1 with events |
| Sidebar analytics navigation | Requires user interaction |
| Error boundaries | Requires triggering real errors |
| Full E2E generation pipeline | Requires platform approval modal |

---
*Report generated by test-coverage.mjs*
