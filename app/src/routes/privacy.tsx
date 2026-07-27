import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: lazyRouteComponent(() => import("./privacy.page"), "default"),
  head: () => ({
    meta: [
      { title: "Privacy Policy — Orgasmo" },
      { name: "description", content: "Orgasmo Privacy Policy" },
    ],
  }),
});