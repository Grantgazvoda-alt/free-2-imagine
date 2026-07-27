import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Icon } from "@higgsfield/quanta/icon";
import { BarChart3, Eye, Sparkles, Globe, Activity } from "lucide-react";
import { getAnalyticsSummaryFn } from "@/lib/analytics.functions";

export const Route = createFileRoute("/analytics")({
  component: lazyRouteComponent(() => import("./analytics-page")),
  head: () => ({
    meta: [
      { title: "Analytics — Orgasmo" },
      { name: "description", content: "Orgasmo analytics dashboard" },
    ],
  }),
});