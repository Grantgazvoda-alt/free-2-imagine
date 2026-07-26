import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Icon } from "@higgsfield/quanta/icon";
import { ClipboardList, RefreshCw, Filter } from "lucide-react";
import { getAuditLogFn } from "@/lib/billing.functions";

export const Route = createFileRoute("/admin/audit-log")({
  component: AuditLogPage,
  head: () => ({
    meta: [
      { title: "Audit Log — Orgasmo Admin" },
      { name: "description", content: "Usage limit audit log" },
    ],
  }),
});

function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "audit-log", actionFilter],
    queryFn: () => getAuditLogFn({ data: { limit: 100, action: actionFilter || undefined } }),
    refetchOnWindowFocus: false,
    staleTime: 10_000,
  });

  const entries = data?.ok ? data.entries : [];

  const actions = [...new Set(entries.map((e) => e.action))];

  const getActionColor = (action: string) => {
    if (action.includes("limit") || action.includes("update")) return "text-amber-400";
    if (action.includes("delete") || action.includes("remove")) return "text-red-400";
    if (action.includes("create") || action.includes("invite")) return "text-green-400";
    return "text-blue-400";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-q-background-primary">
        <Loader size="md" color="neutral" aria-label="Loading audit log" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon as={ClipboardList} size="lg" />
            <Typography as="h1" variant="headline-md-semi-bold" color="primary">Audit Log</Typography>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="tertiary" size="sm" onClick={() => refetch()} start={<Icon as={RefreshCw} size="sm" />}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter by action */}
        {actions.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Icon as={Filter} size="sm" className="text-q-text-tertiary shrink-0" />
            <Button variant={!actionFilter ? "primary" : "tertiary"} size="xs" onClick={() => setActionFilter("")}>All</Button>
            {actions.map((a) => (
              <Button key={a} variant={actionFilter === a ? "primary" : "tertiary"} size="xs" onClick={() => setActionFilter(a)}>
                {a.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-12 text-center">
            <Icon as={ClipboardList} size="xl" className="text-q-text-tertiary" />
            <Typography as="h2" variant="title-md-semi-bold" color="secondary">No audit entries yet</Typography>
            <Typography as="p" variant="body-sm-regular" color="tertiary" className="max-w-sm">
              Audit entries will appear here when you update usage limits or perform admin actions.
            </Typography>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 rounded-q-400 border border-q-border-subtle bg-q-background-secondary px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-q-background-tertiary">
                  <span className={`text-xs font-bold ${getActionColor(entry.action)}`}>
                    {entry.action.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Typography as="span" variant="body-sm-medium" color="primary" className="capitalize">
                      {entry.action.replace(/_/g, " ")}
                    </Typography>
                    {entry.target_type && (
                      <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">
                        {entry.target_type}: {entry.target_id?.slice(0, 16)}...
                      </Typography>
                    )}
                  </div>
                  {entry.details && (
                    <Typography as="span" variant="caption-sm-regular" color="tertiary">
                      {entry.details}
                    </Typography>
                  )}
                </div>
                <Typography as="span" variant="caption-xs-regular" color="tertiary" className="shrink-0">
                  {entry.created_at?.slice(0, 16).replace("T", " ")}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}