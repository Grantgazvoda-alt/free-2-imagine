import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const SettingsPage = lazyRouteComponent(() => import("./settings-page"));

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  preload: () => SettingsPage.preload?.(),
  head: () => ({
    meta: [
      { title: "Settings — Orgasmo" },
      { name: "description", content: "Orgasmo user settings and profile" },
    ],
  }),
});