import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Input } from "@higgsfield/quanta/input";
import { Icon } from "@higgsfield/quanta/icon";
import { toast } from "@higgsfield/quanta/sonner";
import {
  CreditCard, Sparkles, BarChart3, ExternalLink, RefreshCw, Zap, Clock,
  UserPlus, Download, FileText, FileSpreadsheet, Users, Shield, Mail, Settings,
} from "lucide-react";
import { getUsageStatsFn, getBillingPortalUrlFn, inviteTeamMemberFn, removeTeamMemberFn, exportUsageFn, exportUsageAndEmailFn } from "@/lib/billing.functions";

export const Route = createFileRoute("/billing")({
  component: lazyRouteComponent(() => import("./billing-page")),
  head: () => ({
    meta: [
      { title: "Billing — Orgasmo" },
      { name: "description", content: "Billing and usage management" },
    ],
  }),
});