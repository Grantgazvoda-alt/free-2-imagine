/**
 * Real User Monitoring (RUM) — captures Web Vitals and performance metrics
 * on every page load and sends them to the analytics endpoint.
 *
 * Uses the Performance API (available in all modern browsers).
 * Metrics captured:
 *   - LCP (Largest Contentful Paint)
 *   - FID / INP (First Input Delay / Interaction to Next Paint)
 *   - CLS (Cumulative Layout Shift)
 *   - TTFB (Time to First Byte)
 *   - FCP (First Contentful Paint)
 *   - DOM Content Loaded
 *   - Load Event
 */

import { trackEventFn } from "./analytics.functions";

interface WebVitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
}

function getRating(name: string, value: number): WebVitalMetric["rating"] {
  switch (name) {
    case "LCP":
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
    case "FID":
      return value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor";
    case "INP":
      return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
    case "CLS":
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
    case "TTFB":
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor";
    case "FCP":
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
    default:
      return "good";
  }
}

function sendMetrics(metrics: WebVitalMetric[]) {
  const pagePath = window.location.pathname;
  const sessionId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  for (const metric of metrics) {
    trackEventFn({
      data: {
        eventType: "performance",
        eventName: `web_vital_${metric.name.toLowerCase()}`,
        pagePath,
        sessionId,
        metadata: JSON.stringify({
          value: metric.value,
          rating: metric.rating,
          metric: metric.name,
        }),
      },
    }).catch(() => {
      // Analytics failures are non-critical
    });
  }

  // Also log to console in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("[Web Vitals]", metrics.map((m) => `${m.name}: ${m.value} (${m.rating})`).join(", "));
  }
}

export function initWebVitals(): void {
  if (typeof window === "undefined" || !("performance" in window)) return;

  const metrics: WebVitalMetric[] = [];

  // ── TTFB (Time to First Byte) ──
  const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (navEntry) {
    const ttfb = navEntry.responseStart - navEntry.requestStart;
    metrics.push({ name: "TTFB", value: Math.round(ttfb), rating: getRating("TTFB", ttfb) });
  }

  // ── FCP (First Contentful Paint) ──
  const fcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    if (entries.length > 0) {
      const fcp = entries[0].startTime;
      const existing = metrics.find((m) => m.name === "FCP");
      if (!existing) {
        metrics.push({ name: "FCP", value: Math.round(fcp), rating: getRating("FCP", fcp) });
      }
    }
  });
  try {
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch {
    // PerformanceObserver not supported
  }

  // ── LCP (Largest Contentful Paint) ──
  let lcpValue = 0;
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      lcpValue = lastEntry.startTime;
    }
  });
  try {
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // PerformanceObserver not supported
  }

  // ── CLS (Cumulative Layout Shift) ──
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
  });
  try {
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {
    // PerformanceObserver not supported
  }

  // ── FID (First Input Delay) ──
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fid = (entry as any).processingStart - entry.startTime;
      metrics.push({ name: "FID", value: Math.round(fid), rating: getRating("FID", fid) });
      fidObserver.disconnect();
    }
  });
  try {
    fidObserver.observe({ type: "first-input", buffered: true });
  } catch {
    // PerformanceObserver not supported
  }

  // ── DOM Content Loaded & Load Event ──
  if (navEntry) {
    const dcl = navEntry.domContentLoadedEventEnd - navEntry.startTime;
    const load = navEntry.loadEventEnd - navEntry.startTime;
    metrics.push({ name: "DCL", value: Math.round(dcl), rating: "good" });
    metrics.push({ name: "Load", value: Math.round(load), rating: "good" });
  }

  // ── Send metrics when the page is fully loaded ──
  const sendAll = () => {
    // Add LCP if we got one
    if (lcpValue > 0) {
      const existing = metrics.find((m) => m.name === "LCP");
      if (!existing) {
        metrics.push({ name: "LCP", value: Math.round(lcpValue), rating: getRating("LCP", lcpValue) });
      }
    }

    // Add CLS
    const existing = metrics.find((m) => m.name === "CLS");
    if (!existing) {
      metrics.push({ name: "CLS", value: clsValue, rating: getRating("CLS", clsValue) });
    }

    if (metrics.length > 0) {
      // Debounce: wait a bit for late metrics (LCP, CLS)
      setTimeout(() => sendMetrics(metrics), 1000);
    }
  };

  if (document.readyState === "complete") {
    sendAll();
  } else {
    window.addEventListener("load", () => {
      // Give LCP/CLS observers a chance to fire
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          sendAll();
        });
      });
    });
  }
}