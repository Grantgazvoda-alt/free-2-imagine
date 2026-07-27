import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  preload: true,
  component: lazyRouteComponent(() => import("./docs-page")),
  head: () => ({
    meta: [
      { title: "API Docs — Orgasmo" },
      { name: "description", content: "Orgasmo API documentation" },
    ],
  }),
});