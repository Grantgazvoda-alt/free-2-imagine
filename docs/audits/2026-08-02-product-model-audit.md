# Free 2 Imagine product and model audit

Date: 2026-08-02

## Executive finding

The application has a substantial UI and SDK scaffold, but it currently exposes only GPT Image 2 in the Studio and the recently added Civitai MCP document is discovery documentation rather than a working inference integration. The highest-priority work is to restore type safety, repair confirmed Studio defects, introduce a model-aware composer, make video uploads/history real, and align billing with model credit costs.

This audit distinguishes confirmed code findings from deployment-dependent risks. Runtime registration does not guarantee that every provider model is enabled for the deployed Higgsfield account.

## Critical issues

### P0 — Studio type checking is disabled

`app/src/layouts/studio.tsx` begins with `// @ts-nocheck`. This suppresses errors in the app's largest and most important screen and hides defects that strict TypeScript should catch.

**Remediation:** remove the directive after splitting the file into smaller hooks/components and fixing all resulting errors. Add a CI check that rejects `@ts-nocheck`, `@ts-ignore`, and `@ts-expect-error` in application code.

### P0 — Sidebar navigation references an out-of-scope variable

`StudioSidebar` calls `navigate({ to: ... })`, but `navigate` is created inside `StudioTemplate`, not inside `StudioSidebar` and not passed as a prop. This is a confirmed navigation defect currently masked by `@ts-nocheck`.

**Remediation:** call `useNavigate()` inside `StudioSidebar` or pass typed navigation callbacks from the parent.

### P0 — Avatar batch controls request unsupported batch sizes

The Studio offers 6, 18 and custom batches up to 36. The registered `gpt_image_2` job validates `batchSize` from 1 through 4. Any larger batch fails before submission.

**Remediation:** either cap a single request at four and orchestrate multiple approved jobs, or restrict the UI to 1–4. Multi-request orchestration must quote and approve the full cost and retain partial failures.

### P0 — Billing limits are not reliably connected to completed generation usage

`recordUsageFn` exists, but the Studio generation flow does not visibly call it. `checkUsageLimitFn` can therefore allow repeated generations without a corresponding ledger decrement. The usage dashboard also counts ledger rows while models have different credit costs.

**Remediation:** record usage from trusted server-side generation lifecycle events, use idempotency keyed by generation/job ID, and sum `credits_consumed` rather than counting rows. Never trust a browser callback to enforce billing.

### P0 — Administrative routes lack visible route-level authorization

The `/admin/*` route definitions inspected register components directly without a route-level role check. Hiding links is not access control.

**Remediation:** add server-side admin authorization before loading any admin data or executing mutations. Add tests for anonymous, member, administrator and owner access.

### P0 — Repository contains unresolved merge-conflict markers

`STRATEGY.md` contains `<<<<<<< HEAD`, `=======` and competing document versions.

**Remediation:** reconcile the strategy document and add a CI grep that fails on conflict markers.

## High-priority model and media issues

### P1 — No customer-facing model selector

The Studio always builds input with `model: "gpt_image_2"`. Registering additional FNF jobs is necessary but not sufficient. Each model has different required media roles, durations, resolutions, aspect ratios and costs.

**Remediation:** create model-aware product modes rather than a raw wall of model names:

- **Fast image:** Nano Banana Flash
- **Standard image/edit:** Nano Banana Pro or Seedream 4.5
- **Premium image:** GPT Image 2
- **Design / SVG:** Recraft V4.1
- **Fast video:** Seedance 2.0 Fast
- **Standard video:** HappyHorse or Wan 2.7
- **Premium video:** Seedance 2.0, Kling 3.0, Veo 3.1 Lite or Grok Imagine

The selector must render controls from a typed capability schema and must never send one model's settings to another model.

### P1 — Video is defined in the SDK but blocked by the app

The FNF package includes multiple video definitions and the gallery mapper supports video. However:

- Studio history is hard-coded to `{ type: "image" }`.
- Upload API rejects anything not beginning with `image/`.
- Asset-library video pagination is hard-coded to unavailable.
- The prompt box exposes only one generic `reference` image role.

**Remediation:** add separate image/video history queries, secure video/audio uploads, media metadata extraction, and role-aware inputs (`start_image`, `end_image`, `video`, `audio`, and general reference images).

### P1 — Civitai is not an inference backend

The MCP server searches Civitai, retrieves prompts and metadata, and produces download information. It does not load checkpoints or LoRAs and does not generate media.

**Remediation:** deploy a separate GPU inference service such as ComfyUI/RunPod or a compatible managed backend. Keep the Civitai API key and model-download credentials server-side. Add malware/hash/license verification before importing community assets.

### P1 — External model recommendations have no adapters

FLUX Schnell, FLUX Klein, FLUX Dev, Stable Diffusion, SDXL and DreamShaper from the supplied model guide are not defined in the current FNF registry.

**Remediation:** add provider-specific server adapters and typed job definitions only after confirming exact model identifiers, pricing, license terms and deployed availability. Until then they remain `external-inference-required` in `model-catalog.ts`.

### P1 — Runtime model availability is not discovered

The app assumes compile-time model definitions equal deployed model availability. The FNF SDK documentation says runtime catalogs should be discovered and unavailable IDs surfaced rather than silently replaced.

**Remediation:** expose an authenticated server endpoint that intersects registered definitions with the deployed provider catalog, cache briefly, and disable unavailable choices with a clear explanation.

## Product integrity issues

### P1 — Unsupported marketing claims

The README and UI use claims such as “no rules” and “unrestricted.” The current backend can return moderation failures such as `prompt_nsfw`, and hosted providers retain their own policies.

**Remediation:** replace absolute claims with accurate product language. Describe privacy, supported content and provider limitations precisely.

### P1 — Placeholder hero assets violate the app's own scaffold contract

Studio contains inline SVG placeholder imagery while `app/AGENTS.md` requires real user-supplied, generated or durable runtime media and prohibits placeholder mock art.

**Remediation:** generate or provide final brand assets at actual component dimensions, store them under stable asset paths, and remove placeholder constants.

### P1 — Pick-best does not actually select or organize a winner

The modal's “Keep this” button merely closes the dialog. All outputs stay in the same feed and no favorite/winner relationship is persisted.

**Remediation:** persist a selected result, allow deletion/archive of rejected variants, and show the chosen winner in project/history metadata.

### P1 — Template insertion is not a real prompt template

Using a template sets the prompt to `title — subtitle`; it does not preserve an authored generation prompt, model, settings or references.

**Remediation:** define versioned templates containing a prompt body and compatible model/settings schema.

### P1 — Usage tracking uses the wrong batch variable in avatar mode

`handleGenerate` reads `settingValues.variations` even when avatar mode derives its batch from `avatarBatch`. Analytics and pick-best behavior therefore do not represent the actual request.

**Remediation:** derive one normalized output count from the validated model input.

## Security and platform issues

### P1 — Secrets and environment configuration are not validated centrally

Bindings are optional and accessed ad hoc. Billing includes `(env as any).STRIPE_SECRET_KEY`, which bypasses type safety, and several functions use hard-coded production URLs.

**Remediation:** implement a typed server-only configuration parser, validate required secrets per feature, and derive origin from trusted configuration/request context.

### P1 — Team invitations conflate account scope and email address

The invitation function accepts `memberScope` and later passes it as `toEmail`. A user/workspace scope is not necessarily an email address.

**Remediation:** use separate validated fields for account ID and email, issue signed single-use invitation tokens, and do not activate membership before acceptance.

### P1 — Upload pipeline lacks malware/content integrity controls

Uploads validate MIME family and size, but there is no visible malware scan, file-signature verification, metadata stripping or quarantine workflow.

**Remediation:** verify magic bytes, transcode images/video, strip dangerous metadata, scan attachments, enforce decompression/pixel limits and quarantine failures.

### P1 — Community model supply-chain risk is unaddressed

Civitai assets can include unsafe pickle formats, unclear licenses, malicious workflow files or incompatible dependencies.

**Remediation:** allow only safetensors where applicable, verify published SHA-256, retain license/provenance records, isolate model loading and deny arbitrary workflow execution.

## Architecture and maintainability issues

### P2 — Studio is a monolith

`studio.tsx` is roughly 1,300 lines and combines routing, billing checks, prompt construction, uploads, history, projects, analytics and modal state.

**Remediation:** split into model input builders, history hooks, project hooks, sidebar, composer, generation lifecycle and result-selection components.

### P2 — Generic RPC accepts arbitrary job types and params

`createJobsFn` validates only that `jobSetType` is a string and `params` is a record. Client-side typed jobs validate ordinary UI use, but a direct caller can submit arbitrary shapes to the server adapter.

**Remediation:** server-side allowlist registered job types and validate against the same job definitions before forwarding.

### P2 — Health check reports auth as available without testing it

The health route sets `auth: "available"` as a constant.

**Remediation:** report only configured/dependency health without leaking sensitive detail; separate liveness and readiness endpoints.

### P2 — App metadata and branding are inconsistent

The repository name is Free 2 Imagine, the live app and route titles use Orgasmo, and defaults still reference Higgsfield.

**Remediation:** establish one product name and environment-aware canonical URLs, titles, social metadata and email branding.

### P2 — Pricing is generation-count based despite variable model costs

Plans advertise fixed generation counts while registered models range substantially in credit cost by duration, resolution, quality and audio.

**Remediation:** display credits and live estimates, reserve credits before submission, reconcile after completion, and distinguish image/video allowances.

### P2 — Error handling can hide initialization failures

`StudioTemplate` catches every setup error and returns an indefinite “Initializing...” screen.

**Remediation:** catch only expected provider setup states and render a retryable diagnostic error for actual failures.

## Recommended implementation order

1. Restore strict type checking and fix sidebar navigation.
2. Repair avatar batching and server-side idempotent credit accounting.
3. Add server authorization to all admin functions and routes.
4. Build runtime model-availability endpoint and model-aware composer.
5. Enable image models first: GPT Image 2, Nano Banana Flash/Pro, Seedream 4.5 and Recraft V4.1.
6. Add secure video/audio upload and mixed media history.
7. Launch Seedance Fast as the first metered video route; add premium video models after billing reconciliation is proven.
8. Deploy a separate GPU inference service before enabling Civitai checkpoints, LoRAs, FLUX or Stable Diffusion assets.
9. Correct marketing, pricing, branding and documentation.
10. Add CI gates for type suppression, conflict markers, admin authorization tests and model schema parity.

## Changes in this branch

- Expanded `STUDIO_JOBS` to register the image and video definitions already present in the FNF package.
- Added `app/src/lib/model-catalog.ts` to distinguish registered models from external-inference and Civitai discovery entries.
- Added this audit so remaining work is explicit and prioritized.

Registration alone does not add a safe model picker. The next implementation must generate model-specific inputs and expose only capabilities that the deployed runtime confirms are available.
