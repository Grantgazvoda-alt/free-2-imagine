import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { trackEventFn } from "./analytics.functions";

let sessionId: string | undefined;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return sessionId;
}

/**
 * Track a page view event. Called automatically on route changes.
 */
export function trackPageView(pagePath: string, userScope?: string) {
  trackEventFn({
    data: {
      eventType: "page_view",
      eventName: "page_view",
      pagePath,
      sessionId: getSessionId(),
      userScope,
    },
  }).catch(() => {
    // Analytics failures are non-critical — silently ignore
  });
}

/**
 * Track a feature usage event.
 */
export function trackFeatureUse(
  featureName: string,
  metadata?: Record<string, string>,
) {
  trackEventFn({
    data: {
      eventType: "feature_use",
      eventName: featureName,
      pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      sessionId: getSessionId(),
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  }).catch(() => {});
}

/**
 * Track a generation event.
 */
export function trackGeneration(model: string, variationCount: number) {
  trackEventFn({
    data: {
      eventType: "generation",
      eventName: "generate",
      pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      sessionId: getSessionId(),
      metadata: JSON.stringify({ model, variations: variationCount }),
    },
  }).catch(() => {});
}

/**
 * React hook that automatically tracks page views on route changes.
 * Place once in the root component.
 */
export function usePageViewTracking(userScope?: string) {
  const router = useRouter();
  const lastPath = useRef("");

  useEffect(() => {
    const unsubscribe = router.history.subscribe(() => {
      const path = window.location.pathname;
      if (path !== lastPath.current) {
        lastPath.current = path;
        trackPageView(path, userScope);
      }
    });

    // Track initial page view
    const initialPath = window.location.pathname;
    lastPath.current = initialPath;
    trackPageView(initialPath, userScope);

    return unsubscribe;
  }, [router, userScope]);
}