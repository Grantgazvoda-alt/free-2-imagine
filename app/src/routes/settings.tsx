import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  preload: true,
  component: lazyRouteComponent(() => import("./settings-page")),
  head: () => ({
    meta: [
      { title: "Settings — Orgasmo" },
      { name: "description", content: "Orgasmo user settings and profile" },
    ],
  }),
});