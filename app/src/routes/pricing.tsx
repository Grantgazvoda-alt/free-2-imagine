import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  component: lazyRouteComponent(() => import("./pricing-page")),
  head: () => ({
    meta: [
      { title: "Pricing — Orgasmo" },
      { name: "description", content: "Orgasmo pricing plans — generate any image, no rules" },
    ],
  }),
});