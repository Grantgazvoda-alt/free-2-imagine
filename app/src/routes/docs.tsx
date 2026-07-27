import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useState } from "react";
import { Typography } from "@higgsfield/quanta/typography";
import { Icon } from "@higgsfield/quanta/icon";
import {
  Terminal, Code, Database, Shield, AlertTriangle,
  ChevronDown, ChevronRight, Copy, Check,
} from "lucide-react";

export const Route = createFileRoute("/docs")({
  component: lazyRouteComponent(() => import("./docs-page"), "default"),
  head: () => ({
    meta: [
      { title: "API Docs — Orgasmo" },
      { name: "description", content: "Orgasmo API documentation" },
    ],
  }),
});