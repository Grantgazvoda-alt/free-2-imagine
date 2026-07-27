import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Input } from "@higgsfield/quanta/input";
import { Icon } from "@higgsfield/quanta/icon";
import { Gauge, RefreshCw, Save, AlertTriangle } from "lucide-react";
import { getUsageLimitsFn, updateUsageLimitsFn } from "@/lib/billing.functions";
import { toast } from "@higgsfield/quanta/sonner";

export const Route = createFileRoute("/admin/usage-limits")({
  component: lazyRouteComponent(() => import("./usage-limits.page"), "default"),
  head: () => ({
    meta: [
      { title: "Usage Limits — Orgasmo Admin" },
      { name: "description", content: "Manage usage limits for all plans" },
    ],
  }),
});