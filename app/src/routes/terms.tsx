import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: lazyRouteComponent(() => import("./terms-page")),
  head: () => ({
    meta: [
      { title: "Terms of Service — Orgasmo" },
      { name: "description", content: "Orgasmo Terms of Service" },
    ],
  }),
});