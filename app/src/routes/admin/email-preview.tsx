import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Typography } from "@higgsfield/quanta/typography";
import { Icon } from "@higgsfield/quanta/icon";
import { Eye, Mail, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/email-preview")({
  component: lazyRouteComponent(() => import("./email-preview-page"), "default"),
  head: () => ({
    meta: [
      { title: "Email Preview — Orgasmo Admin" },
      { name: "description", content: "Preview email templates" },
    ],
  }),
});