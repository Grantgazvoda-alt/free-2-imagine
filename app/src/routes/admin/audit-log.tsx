import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Input } from "@higgsfield/quanta/input";
import { Icon } from "@higgsfield/quanta/icon";
import { ClipboardList, RefreshCw, Filter, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { getAuditLogFn, exportAuditLogCsvFn } from "@/lib/billing.functions";
import { toast } from "@higgsfield/quanta/sonner";

export const Route = createFileRoute("/admin/audit-log")({
  component: AuditLogPage,
  head: () => ({
    meta: [
      { title: "Audit Log — Orgasmo Admin" },
      { name: "description", content: "Usage limit audit log" },
    ],
  }),
});

const PAGE_SIZE = 25;

function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "audit-log", actionFilter, searchQuery, offset],
    queryFn: () => getAuditLogFn({
      data: {
        limit: PAGE_SIZE,
        offset,
        action: actionFilter || undefined,
        search: searchQuery || undefined,
      },
    }),
    refetchOnWindowFocus: false,
    staleTime: 10_000,
  });

  const entries = data?.ok ? data.entries : [];
  const total = data?.ok ? (data as any).total ?? 0 : 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const actions = [...new Set(entries.map((e: any) => e.action))];

  const getActionColor = (action: string) => {
    if (action.includes("limit") || action.includes("update")) return "text-amber-400";
    if (action.includes("delete") || action.includes("remove")) return "text-red-400";
    if (action.includes("create") || action.includes("invite")) return "text-green-400";
    return "text-blue-400";
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setOffset(0);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const result = await exportAuditLogCsvFn({
        data: { action: actionFilter || undefined, search: searchQuery || undefined },
      });
      if (result.ok) {
        const blob = new Blob([result.csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orgasmo-audit-log-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${result.count} audit entries`);
      }
    } catch {}
    setExporting(false);
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
            <Button variant="tertiary" size="sm" onClick={handleExportCsv} disabled={exporting || entries.length === 0} start={<Icon as={Download} size="sm" />}>
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => refetch()} start={<Icon as={RefreshCw} size="sm" />}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon as={Search} size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-q-text-tertiary" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search audit log by action, details, or target..."
            className="w-full pl-9"
            aria-label="Search audit log"
          />
        </div>

        {/* Filter + pagination info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Icon as={Filter} size="sm" className="text-q-text-tertiary shrink-0" />
            <Button variant={!actionFilter ? "primary" : "tertiary"} size="xs" onClick={() => { setActionFilter(""); setOffset(0); }}>All</Button>
            {["update_usage_limits", "invite_team_member", "remove_team_member", "export_usage"].map((a) => (
              <Button
                key={a}
                variant={actionFilter === a ? "primary" : "tertiary"}
                size="xs"
                onClick={() => { setActionFilter(a === actionFilter ? "" : a); setOffset(0); }}
              >
                {a.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
          {total > 0 && (
            <Typography as="span" variant="caption-sm-regular" color="tertiary" className="shrink-0">
              {total} entries · Page {currentPage}/{totalPages}
            </Typography>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-12 text-center">
            <Icon as={ClipboardList} size="xl" className="text-q-text-tertiary" />
            <Typography as="h2" variant="title-md-semi-bold" color="secondary">{searchQuery ? "No matching entries" : "No audit entries yet"}</Typography>
            <Typography as="p" variant="body-sm-regular" color="tertiary" className="max-w-sm">
              {searchQuery ? `No entries matching "${searchQuery}". Try a different search term.` : "Audit entries will appear here when you update usage limits or perform admin actions."}
            </Typography>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {entries.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-4 rounded-q-400 border border-q-border-subtle bg-q-background-secondary px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-q-background-tertiary">
                  <span className={`text-xs font-bold ${getActionColor(entry.action)}`}>
                    {entry.action.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Typography as="span" variant="body-sm-medium" color="primary" className="capitalize">
                      {entry.action.replace(/_/g, " ")}
                    </Typography>
                    {entry.target_type && (
                      <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">
                        {entry.target_type}: {entry.target_id?.slice(0, 20)}
                        {entry.target_id && entry.target_id.length > 20 ? "..." : ""}
                      </Typography>
                    )}
                  </div>
                  {entry.details && (
                    <Typography as="span" variant="caption-sm-regular" color="tertiary" className="line-clamp-2">
                      {entry.details}
                    </Typography>
                  )}
                </div>
                <Typography as="span" variant="caption-xs-regular" color="tertiary" className="shrink-0 whitespace-nowrap">
                  {entry.created_at?.slice(0, 16).replace("T", " ")}
                </Typography>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="tertiary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              start={<Icon as={ChevronLeft} size="sm" />}
            >
              Previous
            </Button>
            <Typography as="span" variant="body-sm-regular" color="tertiary">
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              variant="tertiary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              <div className="flex items-center gap-1">
                Next <Icon as={ChevronRight} size="sm" />
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}