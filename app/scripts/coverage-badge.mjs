#!/usr/bin/env node

/**
 * Generate a coverage badge SVG from the test results.
 * Usage: node scripts/coverage-badge.mjs [pass-count] [total-count]
 * If no args given, reads from the last coverage report.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

let passCount, totalCount;

if (process.argv.length >= 4) {
  passCount = parseInt(process.argv[2]);
  totalCount = parseInt(process.argv[3]);
} else {
  const reportPath = resolve(root, "tests", "coverage-report.md");
  if (!existsSync(reportPath)) {
    console.error("No coverage report found. Run 'node scripts/test-coverage.mjs' first.");
    process.exit(1);
  }
  const report = readFileSync(reportPath, "utf-8");
  const passMatch = report.match(/\|\s*Passed\s*\|\s*(\d+)\s*\|/);
  const totalMatch = report.match(/\|\s*Total Tests\s*\|\s*(\d+)\s*\|/);
  if (!passMatch || !totalMatch) {
    console.error("Could not parse coverage report.");
    process.exit(1);
  }
  passCount = parseInt(passMatch[1]);
  totalCount = parseInt(totalMatch[1]);
}

const rate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
const allPass = passCount === totalCount && totalCount > 0;

let color, label;
if (allPass) {
  color = "4c1";
  label = `${rate}%25`;
} else if (rate >= 80) {
  color = "97ca00";
  label = `${rate}%25`;
} else if (rate >= 50) {
  color = "dfb317";
  label = `${rate}%25`;
} else {
  color = "e05d44";
  label = `${rate}%25`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="20" role="img" aria-label="coverage: ${rate}%">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="140" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="74" height="20" fill="#555"/>
    <rect x="74" width="66" height="20" fill="#${color}"/>
    <rect width="140" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="37" y="15" fill="#010101" fill-opacity=".3">coverage</text>
    <text x="37" y="14">coverage</text>
    <text x="106" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="106" y="14">${label}</text>
  </g>
</svg>`;

const outPath = resolve(root, "tests", "coverage-badge.svg");
writeFileSync(outPath, svg);
console.log(`Badge written to ${outPath}`);
console.log(`Coverage: ${passCount}/${totalCount} (${rate}%)`);

// Also write JSON for shields.io endpoint
const json = JSON.stringify({
  schemaVersion: 1,
  label: "coverage",
  message: `${rate}%`,
  color: color === "4c1" ? "brightgreen" : color === "97ca00" ? "green" : color === "dfb317" ? "yellow" : "red",
}, null, 2);
writeFileSync(resolve(root, "tests", "coverage-badge.json"), json);
console.log(`Badge JSON written to tests/coverage-badge.json`);