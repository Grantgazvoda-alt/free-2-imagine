import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const EmailTemplatesPage = lazyRouteComponent(() => import("./email-templates-page"));

export const Route = createFileRoute("/admin/email-templates")({
  component: EmailTemplatesPage,
  head: () => ({
    meta: [
      { title: "Email Templates — Orgasmo Admin" },
      { name: "description", content: "Manage email notification templates" },
    ],
  }),
});