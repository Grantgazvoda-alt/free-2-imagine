import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const PricingPage = lazyRouteComponent(() => import("./pricing-page"));

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  // Preload the pricing page component immediately when the app renders
  // (pricing is a high-traffic conversion page)
  preload: () => PricingPage.preload?.(),
  head: () => ({
    meta: [
      { title: "Pricing — Orgasmo" },
      { name: "description", content: "Orgasmo pricing plans — generate any image, no rules" },
    ],
  }),
});