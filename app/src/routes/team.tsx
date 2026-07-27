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
  Users, UserPlus, UserMinus, Send, Check, X, RefreshCw,
  ArrowRight, ArrowLeft, Clock, Shield, Zap, FileSpreadsheet, FileText,
} from "lucide-react";
import {
  getTeamMembersFn, inviteTeamMemberFn, updateInviteStatusFn, getUsageStatsFn, exportUsageFn,
} from "@/lib/billing.functions";

export const Route = createFileRoute("/team")({
  component: lazyRouteComponent(() => import("./team-page")),
  head: () => ({
    meta: [
      { title: "Team Management — Orgasmo" },
      { name: "description", content: "Orgasmo team and invite management" },
    ],
  }),
});