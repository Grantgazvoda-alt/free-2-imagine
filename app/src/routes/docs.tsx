import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const DocsPage = lazyRouteComponent(() => import("./docs-page"));

export const Route = createFileRoute("/docs")({
  component: DocsPage,
  preload: () => DocsPage.preload?.(),
  head: () => ({
    meta: [
      { title: "API Docs — Orgasmo" },
      { name: "description", content: "Orgasmo API documentation" },
    ],
  }),
});