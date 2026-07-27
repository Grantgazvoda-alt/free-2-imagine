/**
 * Bundle size diff for PRs — compares current build against a stored baseline.
 *
 * Usage:
 *   # Save baseline (run on main branch)
 *   node scripts/check-bundle-size.mjs --save-baseline
 *
 *   # Check diff (run on PR branch)
 *   node scripts/check-bundle-size.mjs --diff
 *
 *   # Or pass a baseline file explicitly
 *   node scripts/check-bundle-size.mjs --baseline dist/bundle-baseline.json
 *
 * The baseline file stores the sizes of all built JS bundles keyed by their
 * stable prefix (e.g. "index-", "routes-", "pricing-page-") so the diff
 * is stable across content-hash changes.
 */
import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "..", "dist", "client", "assets");
const BASELINE_PATH = join(__dirname, "..", "dist", "bundle-baseline.json");

const args = process.argv.slice(2);
const mode = args.find((a) => a.startsWith("--"));

// ── Helpers ──────────────────────────────────────────────────────────────
function getBundleSizes() {
  if (!existsSync(ASSETS_DIR)) {
    console.error("❌ dist/client/assets/ not found. Run `vite build` first.");
    process.exit(1);
  }
  const files = readdirSync(ASSETS_DIR).filter((f) => f.endsWith(".js"));
  const sizes = {};

  // Group by stable prefix: everything before the first uppercase letter
  // after the first hyphen, or the full prefix before the hash
  for (const file of files) {
    const path = join(ASSETS_DIR, file);
    const size = readFileSync(path).length;

    // Extract stable prefix: remove the content hash (e.g. D51kpXKa)
    // Pattern: prefix-<hash>.js -> prefix
    const prefix = file.replace(/-[A-Za-z0-9_-]+\.js$/, "");
    if (!sizes[prefix]) sizes[prefix] = 0;
    sizes[prefix] += size;
  }

  return sizes;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0B";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function formatDiff(diff) {
  if (diff === 0) return "  0B";
  const sign = diff > 0 ? "+" : "";
  const abs = Math.abs(diff);
  const formatted = abs < 1024 ? `${abs}B` : `${(abs / 1024).toFixed(0)}KB`;
  return `${sign}${formatted}`;
}

// ── Modes ────────────────────────────────────────────────────────────────
if (mode === "--save-baseline") {
  const sizes = getBundleSizes();
  writeFileSync(BASELINE_PATH, JSON.stringify(sizes, null, 2));
  console.log("✅ Saved bundle baseline:");
  console.log(`   ${BASELINE_PATH}`);
  console.log(`   ${Object.keys(sizes).length} bundles tracked`);
  process.exit(0);
}

if (mode === "--diff" || mode === "--baseline") {
  const baselineArg = args.find((a) => a.startsWith("--baseline="));
  const baselinePath = baselineArg ? baselineArg.split("=")[1] : BASELINE_PATH;

  if (!existsSync(baselinePath)) {
    console.error(`❌ Baseline not found at ${baselinePath}`);
    console.error("   Run `node scripts/check-bundle-size.mjs --save-baseline` on main first");
    process.exit(1);
  }

  const baseline = JSON.parse(readFileSync(baselinePath, "utf-8"));
  const current = getBundleSizes();

  const allKeys = new Set([...Object.keys(baseline), ...Object.keys(current)]);
  let totalBaseline = 0;
  let totalCurrent = 0;
  let additions = 0;
  let removals = 0;
  let changes = 0;

  console.log("📊 Bundle Size Diff");
  console.log("═".repeat(60));
  console.log(`  ${"Bundle".padEnd(50)} ${"Baseline".padEnd(10)} ${"Current".padEnd(10)} ${"Diff".padEnd(10)}`);
  console.log("  " + "─".repeat(56));

  for (const key of [...allKeys].sort()) {
    const base = baseline[key] ?? 0;
    const curr = current[key] ?? 0;
    const diff = curr - base;

    totalBaseline += base;
    totalCurrent += curr;

    if (base === 0 && curr > 0) {
      additions++;
      console.log(`  + ${key.padEnd(47)} ${formatBytes(base).padStart(10)} ${formatBytes(curr).padStart(10)} ${formatDiff(diff).padStart(10)}`);
    } else if (base > 0 && curr === 0) {
      removals++;
      console.log(`  - ${key.padEnd(47)} ${formatBytes(base).padStart(10)} ${formatBytes(curr).padStart(10)} ${formatDiff(diff).padStart(10)}`);
    } else if (diff !== 0) {
      changes++;
      const pct = ((diff / base) * 100).toFixed(1);
      console.log(`  ${diff > 0 ? "↑" : "↓"} ${key.padEnd(47)} ${formatBytes(base).padStart(10)} ${formatBytes(curr).padStart(10)} ${formatDiff(diff).padStart(10)} (${pct}%)`);
    }
  }

  console.log("  " + "─".repeat(56));
  const totalDiff = totalCurrent - totalBaseline;
  const totalPct = totalBaseline > 0 ? ((totalDiff / totalBaseline) * 100).toFixed(1) : "N/A";
  console.log(`  ${"TOTAL".padEnd(50)} ${formatBytes(totalBaseline).padStart(10)} ${formatBytes(totalCurrent).padStart(10)} ${formatDiff(totalDiff).padStart(10)} (${totalPct}%)`);
  console.log();

  console.log(`  Additions: ${additions}`);
  console.log(`  Removals:  ${removals}`);
  console.log(`  Changes:   ${changes}`);
  console.log();

  if (totalDiff > 50 * 1024) {
    console.error("⚠️  Bundle size increased by more than 50KB — review before merging");
  } else if (totalDiff > 0) {
    console.log(`ℹ️  Bundle size increased by ${formatBytes(totalDiff)} — within acceptable range`);
  } else if (totalDiff < 0) {
    console.log(`✅ Bundle size decreased by ${formatBytes(Math.abs(totalDiff))}`);
  } else {
    console.log("✅ Bundle size unchanged");
  }

  process.exit(totalDiff > 100 * 1024 ? 1 : 0);
}

// Default mode: save + diff (check against existing baseline)
if (existsSync(BASELINE_PATH)) {
  console.log("📊 Comparing against existing baseline...\n");
  process.argv.push("--diff");
  // Re-run in diff mode
  const { execSync } = await import("node:child_process");
  execSync(`node ${process.argv[1]} --diff`, { stdio: "inherit" });
} else {
  console.log("📊 No baseline found. Saving current build as baseline...\n");
  const sizes = getBundleSizes();
  writeFileSync(BASELINE_PATH, JSON.stringify(sizes, null, 2));
  console.log(`✅ Baseline saved to ${BASELINE_PATH}`);
  console.log(`   ${Object.keys(sizes).length} bundles tracked`);
}