import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const UsageLimitsPage = lazyRouteComponent(() => import("./usage-limits-page"));

export const Route = createFileRoute("/admin/usage-limits")({
  component: UsageLimitsPage,
  head: () => ({
    meta: [
      { title: "Usage Limits — Orgasmo Admin" },
      { name: "description", content: "Manage usage limits for all plans" },
    ],
  }),
});