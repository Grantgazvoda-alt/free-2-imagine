import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const TeamPage = lazyRouteComponent(() => import("./team-page"));

export const Route = createFileRoute("/team")({
  component: TeamPage,
  preload: () => TeamPage.preload?.(),
  head: () => ({
    meta: [
      { title: "Team Management — Orgasmo" },
      { name: "description", content: "Orgasmo team and invite management" },
    ],
  }),
});