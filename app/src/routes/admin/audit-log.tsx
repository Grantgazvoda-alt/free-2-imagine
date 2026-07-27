import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const AuditLogPage = lazyRouteComponent(() => import("./audit-log-page"));

export const Route = createFileRoute("/admin/audit-log")({
  component: AuditLogPage,
  head: () => ({
    meta: [
      { title: "Audit Log — Orgasmo Admin" },
      { name: "description", content: "Usage limit audit log" },
    ],
  }),
});