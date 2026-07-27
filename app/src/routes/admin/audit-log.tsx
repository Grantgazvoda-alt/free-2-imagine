import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Input } from "@higgsfield/quanta/input";
import { Icon } from "@higgsfield/quanta/icon";
import {
  ClipboardList, RefreshCw, Filter, Search, Download,
  ChevronLeft, ChevronRight, Calendar, X, Activity,
} from "lucide-react";
import { getAuditLogFn, exportAuditLogCsvFn } from "@/lib/billing.functions";
import { toast } from "@higgsfield/quanta/sonner";

export const Route = createFileRoute("/admin/audit-log")({
  component: lazyRouteComponent(() => import("./audit-log.page"), "default"),
  head: () => ({
    meta: [
      { title: "Audit Log — Orgasmo Admin" },
      { name: "description", content: "Usage limit audit log" },
    ],
  }),
});