import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const AnalyticsPage = lazyRouteComponent(() => import("./analytics-page"));

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  preload: () => AnalyticsPage.preload?.(),
  head: () => ({
    meta: [
      { title: "Analytics — Orgasmo" },
      { name: "description", content: "Orgasmo analytics dashboard" },
    ],
  }),
});