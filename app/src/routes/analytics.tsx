import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/analytics")({
  preload: true,
  component: lazyRouteComponent(() => import("./analytics-page")),
  head: () => ({
    meta: [
      { title: "Analytics — Orgasmo" },
      { name: "description", content: "Orgasmo analytics dashboard" },
    ],
  }),
});