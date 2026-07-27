import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/billing")({
  preload: true,
  component: lazyRouteComponent(() => import("./billing-page")),
  head: () => ({
    meta: [
      { title: "Billing — Orgasmo" },
      { name: "description", content: "Billing and usage management" },
    ],
  }),
});