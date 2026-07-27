/**
 * User-centric performance measurement script.
 * Measures: TTFB (time-to-first-byte), LCP proxy (full HTML load time),
 * bundle parse cost, and total page weight.
 *
 * Usage:
 *   node scripts/measure-perf.mjs [url]
 *
 * Default URL: https://orgasmo.higgsfield.app
 */
const BASE_URL = process.argv[2] || "https://orgasmo.higgsfield.app";
const RUNS = 5;

const results = {
  routes: {},
  bundles: { sizes: {}, total: 0, count: 0 },
  summary: {},
};

async function fetchWithTiming(url) {
  const start = performance.now();
  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 Perf-Measure" },
  });
  const end = performance.now();
  const text = await resp.text();
  return { status: resp.status, time: end - start, size: text.length, text };
}

function formatBytes(bytes) {
  return bytes < 1024
    ? `${bytes}B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)}KB`
      : `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

async function measureRoute(route) {
  const times = [];
  let size = 0;
  for (let i = 0; i < RUNS; i++) {
    const { status, time, size: s } = await fetchWithTiming(`${BASE_URL}${route}`);
    if (status === 200) {
      times.push(time);
      size = s;
    }
  }
  if (times.length === 0) return null;
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  return { avg: Math.round(avg), min: Math.round(min), max: Math.round(max), size };
}

console.log("═".repeat(60));
console.log("  PERFORMANCE MEASUREMENT");
console.log(`  Target: ${BASE_URL}`);
console.log(`  Runs per route: ${RUNS}`);
console.log("═".repeat(60));
console.log();

// 1. Route response times
console.log("── Route Response Times (ms) ──");
console.log(`  ${"Route".padEnd(30)} ${"Avg".padEnd(8)} ${"Min".padEnd(8)} ${"Max".padEnd(8)} ${"Size"}`);
console.log("  " + "─".repeat(56));

const routes = [
  "/", "/pricing", "/billing", "/team", "/settings",
  "/analytics", "/docs", "/terms", "/privacy", "/api/health",
  "/admin/audit-log", "/admin/email-templates",
];

let totalTime = 0;
for (const route of routes) {
  const m = await measureRoute(route);
  if (m) {
    totalTime += m.avg;
    const avgStr = String(m.avg).padStart(4);
    const minStr = String(m.min).padStart(4);
    const maxStr = String(m.max).padStart(4);
    console.log(`  ${route.padEnd(30)} ${avgStr}ms  ${minStr}ms  ${maxStr}ms  ${formatBytes(m.size)}`);
  }
}

console.log();
console.log(`  Total avg response time: ${Math.round(totalTime)}ms across ${routes.length} routes`);
console.log(`  Average per route: ${Math.round(totalTime / routes.length)}ms`);

// 2. First-byte / full-page timing
console.log();
console.log("── TTFB & Full Page Load ──");
const ttfbTimes = [];
const fullTimes = [];
for (let i = 0; i < RUNS; i++) {
  const start = performance.now();
  const resp = await fetch(BASE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 Perf-Measure" },
  });
  const ttfb = performance.now() - start;
  await resp.text();
  const full = performance.now() - start;
  ttfbTimes.push(ttfb);
  fullTimes.push(full);
}
const avgTTFB = Math.round(ttfbTimes.reduce((a, b) => a + b, 0) / ttfbTimes.length);
const avgFull = Math.round(fullTimes.reduce((a, b) => a + b, 0) / fullTimes.length);
console.log(`  TTFB (first byte):    ${avgTTFB}ms`);
console.log(`  Full page load:       ${avgFull}ms`);

// 3. Bundle sizes (from HTML)
console.log();
console.log("── Bundle Sizes ──");
const html = await (await fetch(BASE_URL, {
  headers: { "User-Agent": "Mozilla/5.0 Perf-Measure" },
})).text();

const scriptMatches = [...html.matchAll(/src="(\/assets\/[^"]+\.js)"/g)];
const cssMatches = [...html.matchAll(/href="(\/assets\/[^"]+\.css)"/g)];
const allAssets = [...new Set([...scriptMatches, ...cssMatches].map((m) => m[1]))];

let totalJS = 0;
let totalCSS = 0;
let totalLoadTime = 0;

for (const asset of allAssets) {
  const start = performance.now();
  const resp = await fetch(`${BASE_URL}${asset}`, {
    headers: { "User-Agent": "Mozilla/5.0 Perf-Measure" },
  });
  const elapsed = Math.round(performance.now() - start);
  const size = (await resp.arrayBuffer()).byteLength;
  totalLoadTime += elapsed;

  if (asset.endsWith(".js")) {
    totalJS += size;
    if (size > 10 * 1024) {
      console.log(`  ${asset.padEnd(50)} ${formatBytes(size).padStart(8)}  ${elapsed}ms`);
    }
  } else {
    totalCSS += size;
  }
}

console.log(`  ${"─".repeat(56)}`);
console.log(`  ${"Total JS:".padEnd(50)} ${formatBytes(totalJS).padStart(8)}`);
console.log(`  ${"Total CSS:".padEnd(50)} ${formatBytes(totalCSS).padStart(8)}`);
console.log(`  ${"Total HTML:".padEnd(50)} ${formatBytes(html.length).padStart(8)}`);
console.log(`  ${"Grand total:".padEnd(50)} ${formatBytes(totalJS + totalCSS + html.length).padStart(8)}`);
console.log(`  ${"Bundle load time:".padEnd(50)} ${totalLoadTime}ms`);

// 4. Summary / Score
console.log();
console.log("── Summary ──");
const lcpProxy = avgTTFB + totalLoadTime;
console.log(`  TTFB:              ${avgTTFB}ms  ${avgTTFB < 200 ? "✓" : avgTTFB < 400 ? "⚠" : "✗"} (target: <200ms)`);
console.log(`  Full page:         ${avgFull}ms  ${avgFull < 500 ? "✓" : avgFull < 1000 ? "⚠" : "✗"} (target: <500ms)`);
console.log(`  Bundle load:       ${totalLoadTime}ms`);
console.log(`  Total JS weight:   ${formatBytes(totalJS)}  ${totalJS < 500 * 1024 ? "✓" : totalJS < 800 * 1024 ? "⚠" : "✗"} (target: <500KB)`);
console.log(`  Total page weight: ${formatBytes(totalJS + totalCSS + html.length)}`);
console.log(`  Routes measured:   ${routes.length}`);
console.log(`  Avg route time:    ${Math.round(totalTime / routes.length)}ms`);
console.log();

const score =
  (avgTTFB < 200 ? 25 : avgTTFB < 400 ? 15 : 5) +
  (avgFull < 500 ? 25 : avgFull < 1000 ? 15 : 5) +
  (totalJS < 500 * 1024 ? 25 : totalJS < 800 * 1024 ? 15 : 5) +
  (totalTime / routes.length < 200 ? 25 : totalTime / routes.length < 400 ? 15 : 5);

console.log(`  Performance score: ${score}/100`);
console.log("═".repeat(60));