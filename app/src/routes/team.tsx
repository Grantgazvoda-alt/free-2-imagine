import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/team")({
  preload: true,
  component: lazyRouteComponent(() => import("./team-page")),
  head: () => ({
    meta: [
      { title: "Team Management — Orgasmo" },
      { name: "description", content: "Orgasmo team and invite management" },
    ],
  }),
});