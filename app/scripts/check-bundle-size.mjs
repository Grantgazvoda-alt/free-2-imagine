/**
 * Bundle size CI guard — fails if any critical bundle exceeds its threshold.
 * Run after `vite build`:
 *   node scripts/check-bundle-size.mjs
 *
 * Thresholds are in bytes. Adjust when intentionally adding weight.
 * Lazy-loaded page chunks have a separate per-chunk limit.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "..", "dist", "client", "assets");

// ── Thresholds (bytes) ──────────────────────────────────────────────────
// Core bundles — loaded on every page visit
const THRESHOLDS = {
  // Vite entry chunk: React, TanStack, app bootstrap
  "index-": 350_000,    // 350 KB — contains React, Router, Query client
  // Route tree + core route definitions (no lazy page components)
  "routes-": 300_000,   // 300 KB — route definitions + shared generation code
  // FNF SDK — platform dependency, minimal control
  "fnf.browser-": 400_000, // 400 KB — Higgsfield FNF client
  // Sign-in modal (loaded on navigation, not on initial render)
  "sign-in-modal-": 120_000, // 120 KB — auth UI
  // Server function bridge
  "createServerFn-": 50_000, // 50 KB
  // Suspense utilities
  "suspense-": 30_000,  // 30 KB
};

// Per-chunk limit for lazy-loaded page components
const PAGE_CHUNK_LIMIT = 30_000; // 30 KB each

// ── Run ─────────────────────────────────────────────────────────────────
let failures = 0;
let totalCoreSize = 0;

if (!existsSync(ASSETS_DIR)) {
  console.error("❌ Assets directory not found. Run `vite build` first.");
  process.exit(1);
}

const files = readdirSync(ASSETS_DIR).filter((f) => f.endsWith(".js"));

console.log("🔍 Bundle size check\n");

// Check core bundles
for (const [prefix, limit] of Object.entries(THRESHOLDS)) {
  const match = files.find((f) => f.startsWith(prefix));
  if (!match) {
    console.warn(`  ⚠  No bundle found matching "${prefix}*"`);
    continue;
  }
  const size = existsSync(join(ASSETS_DIR, match))
    ? readFileSync(join(ASSETS_DIR, match)).length
    : 0;
  totalCoreSize += size;
  const ok = size <= limit;
  const pct = ((size / limit) * 100).toFixed(1);
  const status = ok ? "✓" : "✗";
  console.log(
    `  ${status} ${match.padEnd(50)} ${(size / 1024).toFixed(0)}KB / ${(limit / 1024).toFixed(0)}KB (${pct}%)`
  );
  if (!ok) failures++;
}

// Check lazy page chunks
console.log("\n  ── Lazy page chunks ──\n");
const pageChunks = files.filter((f) => f.includes("-page-"));
for (const chunk of pageChunks) {
  const size = readFileSync(join(ASSETS_DIR, chunk)).length;
  const ok = size <= PAGE_CHUNK_LIMIT;
  const pct = ((size / PAGE_CHUNK_LIMIT) * 100).toFixed(1);
  const status = ok ? "✓" : "✗";
  console.log(
    `  ${status} ${chunk.padEnd(50)} ${(size / 1024).toFixed(0)}KB / ${(PAGE_CHUNK_LIMIT / 1024).toFixed(0)}KB (${pct}%)`
  );
  if (!ok) failures++;
}

// Summary
console.log(`\n  ── Summary ──`);
console.log(`  Core JS total: ${(totalCoreSize / 1024).toFixed(0)}KB`);
console.log(`  Page chunks:  ${pageChunks.length} files`);
console.log(`  Failures:     ${failures}`);

if (failures > 0) {
  console.error("\n❌ Bundle size check FAILED — some bundles exceed thresholds.");
  process.exit(1);
} else {
  console.log("\n✅ Bundle size check PASSED.");
}