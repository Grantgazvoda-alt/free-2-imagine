import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const trackEventSchema = z.object({
  eventType: z.enum(["page_view", "feature_use", "generation", "performance"]),
  eventName: z.string().min(1).max(128),
  pagePath: z.string().optional(),
  sessionId: z.string().optional(),
  userScope: z.string().optional(),
  metadata: z.string().optional(),
});

export const trackEventFn = createServerFn({ method: "POST" })
  .validator(trackEventSchema)
  .handler(async ({ data }) => {
    try {
      const { bindings } = await import("./bindings.server");
      const db = bindings().DB;
      if (!db) return { ok: false as const, error: "db_unavailable" as const };

      await db
        .prepare(
          `INSERT INTO analytics_events (event_type, event_name, page_path, session_id, user_scope, metadata)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          data.eventType,
          data.eventName,
          data.pagePath ?? null,
          data.sessionId ?? null,
          data.userScope ?? null,
          data.metadata ?? null,
        )
        .run();

      return { ok: true as const };
    } catch (error) {
      console.error("Analytics: failed to track event", error);
      return { ok: false as const, error: "internal_error" as const };
    }
  });

export interface AnalyticsSummary {
  totalPageViews: number;
  totalGenerations: number;
  topPages: { page_path: string; count: number }[];
  recentEvents: { event_type: string; event_name: string; page_path: string | null; created_at: string }[];
  pageViewsByDay: { day: string; count: number }[];
  featureUsage: { event_name: string; count: number }[];
}

export const getAnalyticsSummaryFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { bindings } = await import("./bindings.server");
    const db = bindings().DB;
    if (!db) return { ok: false as const, error: "db_unavailable" as const };

    const pageViews = await db
      .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'page_view'")
      .first<{ count: number }>();

    const generations = await db
      .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'generation'")
      .first<{ count: number }>();

    const topPages = await db
      .prepare(
        "SELECT page_path, COUNT(*) as count FROM analytics_events WHERE event_type = 'page_view' AND page_path IS NOT NULL GROUP BY page_path ORDER BY count DESC LIMIT 10",
      )
      .all() as unknown as { results: { page_path: string; count: number }[] };

    const recentEvents = await db
      .prepare(
        "SELECT event_type, event_name, page_path, created_at FROM analytics_events ORDER BY created_at DESC LIMIT 20",
      )
      .all() as unknown as { results: { event_type: string; event_name: string; page_path: string | null; created_at: string }[] };

    const pageViewsByDay = await db
      .prepare(
        "SELECT DATE(created_at) as day, COUNT(*) as count FROM analytics_events WHERE event_type = 'page_view' GROUP BY DATE(created_at) ORDER BY day DESC LIMIT 14",
      )
      .all() as unknown as { results: { day: string; count: number }[] };

    const featureUsage = await db
      .prepare(
        "SELECT event_name, COUNT(*) as count FROM analytics_events WHERE event_type = 'feature_use' GROUP BY event_name ORDER BY count DESC LIMIT 10",
      )
      .all() as unknown as { results: { event_name: string; count: number }[] };

    return {
      ok: true as const,
      summary: {
        totalPageViews: pageViews?.count ?? 0,
        totalGenerations: generations?.count ?? 0,
        topPages: topPages.results ?? [],
        recentEvents: recentEvents.results ?? [],
        pageViewsByDay: pageViewsByDay.results ?? [],
        featureUsage: featureUsage.results ?? [],
      } as AnalyticsSummary,
    };
  } catch (error) {
    console.error("Analytics: failed to get summary", error);
    return { ok: false as const, error: "internal_error" as const };
  }
});