import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const BillingPage = lazyRouteComponent(() => import("./billing-page"));

export const Route = createFileRoute("/billing")({
  component: BillingPage,
  // Preload billing when the app renders (it's a core feature route)
  preload: () => BillingPage.preload?.(),
  head: () => ({
    meta: [
      { title: "Billing — Orgasmo" },
      { name: "description", content: "Billing and usage management" },
    ],
  }),
});