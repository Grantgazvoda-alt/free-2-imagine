import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const EmailPreviewPage = lazyRouteComponent(() => import("./email-preview-page"));

export const Route = createFileRoute("/admin/email-preview")({
  component: EmailPreviewPage,
  head: () => ({
    meta: [
      { title: "Email Preview — Orgasmo Admin" },
      { name: "description", content: "Preview email templates" },
    ],
  }),
});