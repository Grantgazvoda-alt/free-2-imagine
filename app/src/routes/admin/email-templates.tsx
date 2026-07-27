import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useState } from "react";
import { Typography } from "@higgsfield/quanta/typography";
import { toast } from "@higgsfield/quanta/sonner";
import { Button } from "@higgsfield/quanta/button";
import { Input } from "@higgsfield/quanta/input";
import { Icon } from "@higgsfield/quanta/icon";
import { Mail, Copy, Check, Download, Square, CheckSquare, Trash2, AlertTriangle, Edit } from "lucide-react";
import { renderInviteEmail, renderInviteText } from "@/lib/invite-email";

export const Route = createFileRoute("/admin/email-templates")({
  component: lazyRouteComponent(() => import("./email-templates-page"), "default"),
  head: () => ({
    meta: [
      { title: "Email Templates — Orgasmo Admin" },
      { name: "description", content: "Manage email notification templates" },
    ],
  }),
});