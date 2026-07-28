import { describe, it, expect, beforeAll } from "bun:test";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://orgasmo.higgsfield.app";
const RUNS = 3;

/**
 * Fetch a URL with timing, returning status and duration in ms.
 */
async function fetchWithTiming(url: string) {
  const start = performance.now();
  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 Perf-Test" },
  });
  const duration = performance.now() - start;
  const text = await resp.text();
  return { status: resp.status, duration, size: text.length, text };
}

/**
 * All public routes that should be tested.
 */
const PUBLIC_ROUTES = [
  { path: "/", name: "Home" },
  { path: "/pricing", name: "Pricing" },
  { path: "/docs", name: "API Docs" },
  { path: "/terms", name: "Terms" },
  { path: "/privacy", name: "Privacy" },
  { path: "/api/health", name: "Health" },
];

/**
 * Protected routes that require auth. These are tested for basic availability
 * (they should return 200 because the app renders SSR for guests on protected
 * routes, showing the sign-in state).
 */
const PROTECTED_ROUTES = [
  { path: "/billing", name: "Billing" },
  { path: "/team", name: "Team" },
  { path: "/settings", name: "Settings" },
  { path: "/analytics", name: "Analytics" },
  { path: "/admin/audit-log", name: "Audit Log" },
  { path: "/admin/email-templates", name: "Email Templates" },
  { path: "/admin/usage-limits", name: "Usage Limits" },
];

// ── Performance Budgets ──────────────────────────────────────────────────
// Maximum acceptable response time (ms) for each route group
const BUDGETS = {
  public: {
    p95: 500,     // 95th percentile should be under 500ms
    p50: 200,     // Median should be under 200ms
    maxSize: 100_000, // Max HTML size in bytes
  },
  protected: {
    p95: 800,
    p50: 300,
    maxSize: 100_000,
  },
  assets: {
    maxLoadTime: 3000, // Sequential fetch of all assets (browser loads in parallel)
    maxTotalSize: 2_000_000, // Max total JS+CSS+HTML in bytes
  },
};

describe("Route-Level Performance", () => {
  describe("Public routes", () => {
    for (const route of PUBLIC_ROUTES) {
      it(`${route.name} (${route.path}) responds within budget`, async () => {
        const times: number[] = [];
        let size = 0;

        for (let i = 0; i < RUNS; i++) {
          const result = await fetchWithTiming(`${BASE_URL}${route.path}`);
          expect(result.status).toBe(200);
          times.push(result.duration);
          size = result.size;
        }

        // Sort times for percentile calculation
        times.sort((a, b) => a - b);

        const p50 = times[Math.floor(times.length * 0.5)];
        const p95 = times[Math.floor(times.length * 0.95)];

        expect(p50).toBeLessThan(BUDGETS.public.p50);
        expect(p95).toBeLessThan(BUDGETS.public.p95);
        expect(size).toBeLessThan(BUDGETS.public.maxSize);
      });
    }
  });

  describe("Protected routes", () => {
    for (const route of PROTECTED_ROUTES) {
      it(`${route.name} (${route.path}) responds within budget`, async () => {
        const times: number[] = [];
        let size = 0;

        for (let i = 0; i < RUNS; i++) {
          const result = await fetchWithTiming(`${BASE_URL}${route.path}`);
          expect(result.status).toBe(200);
          times.push(result.duration);
          size = result.size;
        }

        times.sort((a, b) => a - b);
        const p50 = times[Math.floor(times.length * 0.5)];
        const p95 = times[Math.floor(times.length * 0.95)];

        expect(p50).toBeLessThan(BUDGETS.protected.p50);
        expect(p95).toBeLessThan(BUDGETS.protected.p95);
        expect(size).toBeLessThan(BUDGETS.protected.maxSize);
      });
    }
  });
});

describe("Asset Performance Budget", () => {
  it("all JS/CSS assets load within budget", async () => {
    const html = await (await fetch(`${BASE_URL}`, {
      headers: { "User-Agent": "Mozilla/5.0 Perf-Test" },
    })).text();

    const assets = [
      ...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g),
    ].map((m) => m[1]);

    let totalSize = 0;
    let totalTime = 0;

    for (const asset of assets) {
      const start = performance.now();
      const resp = await fetch(`${BASE_URL}${asset}`, {
        headers: { "User-Agent": "Mozilla/5.0 Perf-Test" },
      });
      const elapsed = performance.now() - start;
      const buffer = await resp.arrayBuffer();
      totalSize += buffer.byteLength;
      totalTime += elapsed;
    }

    expect(totalTime).toBeLessThan(BUDGETS.assets.maxLoadTime);
    expect(totalSize).toBeLessThan(BUDGETS.assets.maxTotalSize);
  });
});

describe("TTFB (Time to First Byte)", () => {
  it("main page TTFB is under 200ms", async () => {
    const times: number[] = [];
    for (let i = 0; i < RUNS; i++) {
      const start = performance.now();
      const resp = await fetch(BASE_URL, {
        headers: { "User-Agent": "Mozilla/5.0 Perf-Test" },
      });
      const ttfb = performance.now() - start;
      await resp.text(); // consume the response
      times.push(ttfb);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    expect(avg).toBeLessThan(200);
  });
});

describe("Cache Headers", () => {
  it("HTML response has no-cache headers", async () => {
    const resp = await fetch(BASE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 Perf-Test" },
    });
    const cacheControl = resp.headers.get("cache-control");
    expect(cacheControl).not.toBeNull();
    expect(cacheControl).toContain("no-cache");
  });

  it("JS bundles have long cache TTL", async () => {
    const html = await (await fetch(BASE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 Perf-Test" },
    })).text();

    const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    expect(jsMatch).not.toBeNull();

    const resp = await fetch(`${BASE_URL}${jsMatch![1]}`, {
      headers: { "User-Agent": "Mozilla/5.0 Perf-Test" },
    });
    // Content-hashed assets should be cacheable
    expect(resp.headers.get("cache-control")).not.toContain("no-cache");
  });
});

describe("Bundle Size Budget", () => {
  it("core JS bundles are within budget", async () => {
    const html = await (await fetch(BASE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 Perf-Test" },
    })).text();

    const jsFiles = [...html.matchAll(/src="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);

    // Track key bundles
    let totalJS = 0;
    const BUDGETS_JS = {
      "index-": 350_000,
      "routes-": 300_000,
      "fnf.browser-": 400_000,
      "sign-in-modal-": 120_000,
    };

    const results: Record<string, number> = {};

    for (const file of jsFiles) {
      const resp = await fetch(`${BASE_URL}${file}`, {
        headers: { "User-Agent": "Mozilla/5.0 Perf-Test" },
      });
      const buffer = await resp.arrayBuffer();
      const size = buffer.byteLength;
      totalJS += size;

      // Match by prefix
      for (const [prefix, budget] of Object.entries(BUDGETS_JS)) {
        if (file.includes(prefix)) {
          results[prefix] = size;
          expect(size).toBeLessThan(budget);
        }
      }
    }

    // Total JS should be under 2MB
    expect(totalJS).toBeLessThan(2_000_000);
  });
});