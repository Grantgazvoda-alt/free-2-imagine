import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Icon } from "@higgsfield/quanta/icon";
import { User, CreditCard, Palette, LogOut, ExternalLink, Shield } from "lucide-react";
import { fetchCurrentUser } from "@/lib/fnf.browser";

export const Route = createFileRoute("/settings")({
  component: lazyRouteComponent(() => import("./settings-page")),
  head: () => ({
    meta: [
      { title: "Settings — Orgasmo" },
      { name: "description", content: "Orgasmo user settings and profile" },
    ],
  }),
});