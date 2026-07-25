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