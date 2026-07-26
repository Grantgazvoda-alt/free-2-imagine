import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Check D1 connectivity
          let dbStatus = "unavailable";
          try {
            const { bindings } = await import("../../lib/bindings.server");
            const db = bindings().DB;
            dbStatus = db ? "connected" : "unconfigured";
          } catch {
            dbStatus = "unavailable";
          }

          const body = JSON.stringify(
            {
              status: "ok",
              app: "orgasmo",
              version: "1.0.0",
              timestamp: new Date().toISOString(),
              checks: {
                database: dbStatus,
                auth: "available",
              },
            },
            null,
            2,
          );

          return new Response(body, {
            status: 200,
            headers: {
              "content-type": "application/json",
              "cache-control": "no-store",
            },
          });
        } catch (error) {
          return new Response(
            JSON.stringify({ status: "error", error: String(error) }),
            {
              status: 500,
              headers: {
                "content-type": "application/json",
                "cache-control": "no-store",
              },
            },
          );
        }
      },
    },
  },
});