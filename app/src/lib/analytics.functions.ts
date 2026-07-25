import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const trackEventSchema = z.object({
  eventType: z.enum(["page_view", "feature_use", "generation"]),
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
      if (!db) return { ok: false, error: "db_unavailable" };

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

      return { ok: true };
    } catch (error) {
      console.error("Analytics: failed to track event", error);
      return { ok: false, error: "internal_error" };
    }
  });

export const getAnalyticsSummaryFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { bindings } = await import("./bindings.server");
    const db = bindings().DB;
    if (!db) return { ok: false, error: "db_unavailable" };

    const pageViews = await db
      .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'page_view'")
      .first<{ count: number }>();

    const topPages = await db
      .prepare(
        "SELECT page_path, COUNT(*) as count FROM analytics_events WHERE event_type = 'page_view' AND page_path IS NOT NULL GROUP BY page_path ORDER BY count DESC LIMIT 10",
      )
      .all();

    const recentEvents = await db
      .prepare(
        "SELECT event_type, event_name, page_path, created_at FROM analytics_events ORDER BY created_at DESC LIMIT 20",
      )
      .all();

    return {
      ok: true,
      summary: {
        totalPageViews: pageViews?.count ?? 0,
        topPages: topPages.results ?? [],
        recentEvents: recentEvents.results ?? [],
      },
    };
  } catch (error) {
    console.error("Analytics: failed to get summary", error);
    return { ok: false, error: "internal_error" };
  }
});