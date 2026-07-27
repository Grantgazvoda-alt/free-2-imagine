import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  // Preload the pricing page component eagerly (it's a high-traffic conversion page)
  preload: true,
  component: lazyRouteComponent(() => import("./pricing-page")),
  head: () => ({
    meta: [
      { title: "Pricing — Orgasmo" },
      { name: "description", content: "Orgasmo pricing plans — generate any image, no rules" },
    ],
  }),
});