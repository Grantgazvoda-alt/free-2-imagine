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
const PAGE_SIZE = 25;

const ACTION_TYPES = [
  { value: "update_usage_limits", label: "Update Usage Limits", icon: "⚙️", color: "text-amber-400" },
  { value: "invite_team_member", label: "Invite Team Member", icon: "👤", color: "text-green-400" },
  { value: "remove_team_member", label: "Remove Team Member", icon: "🚫", color: "text-red-400" },
  { value: "export_usage", label: "Export Usage", icon: "📤", color: "text-blue-400" },
  { value: "create_checkout_session", label: "Checkout Session", icon: "💳", color: "text-purple-400" },
  { value: "subscription_updated", label: "Subscription Updated", icon: "🔄", color: "text-cyan-400" },
  { value: "plan_changed", label: "Plan Changed", icon: "⭐", color: "text-yellow-400" },
  { value: "generation_limit_reached", label: "Limit Reached", icon: "⚠️", color: "text-orange-400" },
  { value: "login", label: "Login", icon: "🔑", color: "text-indigo-400" },
  { value: "logout", label: "Logout", icon: "🚪", color: "text-gray-400" },
];
export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = actionFilter || searchQuery || dateFrom || dateTo;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "audit-log", actionFilter, searchQuery, dateFrom, dateTo, offset],
    queryFn: () => getAuditLogFn({
      data: {
        limit: PAGE_SIZE,
        offset,
        action: actionFilter || undefined,
        search: searchQuery || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      },
    }),
    refetchOnWindowFocus: false,
    staleTime: 10_000,
  });

  const entries = (data as any)?.ok ? (data as any).entries : [];
  const total = (data as any)?.ok ? (data as any).total ?? 0 : 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const getActionColor = (action: string) => {
    const found = ACTION_TYPES.find((a) => a.value === action);
    return found?.color ?? "text-blue-400";
  };

  const getActionIcon = (action: string) => {
    const found = ACTION_TYPES.find((a) => a.value === action);
    return found?.icon ?? "📋";
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setOffset(0);
  };

  const clearFilters = () => {
    setActionFilter("");
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setOffset(0);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const result = await exportAuditLogCsvFn({
        data: {
          action: actionFilter || undefined,
          search: searchQuery || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
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

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-q-background-primary">
        <Loader size="md" color="neutral" aria-label="Loading audit log" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon as={ClipboardList} size="lg" />
            <Typography as="h1" variant="headline-md-semi-bold" color="primary">Audit Log</Typography>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="tertiary" size="sm"
              onClick={() => setShowFilters(!showFilters)}
              start={<Icon as={Filter} size="sm" />}
            >
              Filters {hasActiveFilters ? "Active" : ""}
            </Button>
            <Button
              variant="tertiary" size="sm"
              onClick={handleExportCsv} disabled={exporting || entries.length === 0}
              start={<Icon as={Download} size="sm" />}
            >
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

        {/* Collapsible filters */}
        {showFilters && (
          <div className="flex flex-col gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-4">
            {/* Date range */}
            <div className="flex items-center gap-4">
              <Icon as={Calendar} size="sm" className="text-q-text-tertiary shrink-0" />
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setOffset(0); }}
                  className="w-40"
                  aria-label="Date from"
                />
                <Typography as="span" variant="body-sm-regular" color="tertiary">to</Typography>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setOffset(0); }}
                  className="w-40"
                  aria-label="Date to"
                />
              </div>
            </div>

            {/* Action type filter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon as={Activity} size="sm" className="text-q-text-tertiary" />
                <Typography as="span" variant="caption-sm-regular" color="tertiary">Action Type</Typography>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant={!actionFilter ? "primary" : "tertiary"} size="xs"
                  onClick={() => { setActionFilter(""); setOffset(0); }}
                >
                  All
                </Button>
                {ACTION_TYPES.map((a) => (
                  <Button
                    key={a.value}
                    variant={actionFilter === a.value ? "primary" : "tertiary"}
                    size="xs"
                    onClick={() => {
                      setActionFilter(a.value === actionFilter ? "" : a.value);
                      setOffset(0);
                    }}
                  >
                    <span className="mr-1">{a.icon}</span>
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button variant="tertiary" size="xs" onClick={clearFilters} start={<Icon as={X} size="sm" />} className="self-start">
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {/* Results header */}
        {total > 0 && (
          <div className="flex items-center justify-between">
            <Typography as="span" variant="body-sm-regular" color="tertiary">
              {total} entries found
              {actionFilter && ` · filtered by "${ACTION_TYPES.find(a => a.value === actionFilter)?.label ?? actionFilter}"`}
              {searchQuery && ` · searching "${searchQuery}"`}
              {(dateFrom || dateTo) && " · date range"}
            </Typography>
            <Typography as="span" variant="caption-sm-regular" color="tertiary">
              Page {currentPage}/{totalPages}
            </Typography>
          </div>
        )}

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-12 text-center">
            <Icon as={ClipboardList} size="xl" className="text-q-text-tertiary" />
            <Typography as="h2" variant="title-md-semi-bold" color="secondary">
              {searchQuery || actionFilter || dateFrom || dateTo ? "No matching entries" : "No audit entries yet"}
            </Typography>
            <Typography as="p" variant="body-sm-regular" color="tertiary" className="max-w-sm">
              {(searchQuery || actionFilter || dateFrom || dateTo)
                ? "Try adjusting your filters or search term."
                : "Audit entries will appear here when you update usage limits or perform admin actions."}
            </Typography>
            {hasActiveFilters && (
              <Button variant="tertiary" size="sm" onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {entries.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-4 rounded-q-400 border border-q-border-subtle bg-q-background-secondary px-4 py-3 hover:bg-q-background-tertiary/50 transition-colors">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-q-background-tertiary text-sm">
                  {getActionIcon(entry.action)}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Typography as="span" variant="body-sm-medium" color="primary" className="capitalize">
                      {entry.action.replace(/_/g, " ")}
                    </Typography>
                    {entry.target_type && (
                      <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">
                        {entry.target_type}: {entry.target_id?.slice(0, 20)}{entry.target_id && entry.target_id.length > 20 ? "..." : ""}
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
              variant="tertiary" size="sm"
              disabled={currentPage <= 1}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              start={<Icon as={ChevronLeft} size="sm" />}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "tertiary"}
                    size="xs"
                    onClick={() => setOffset((pageNum - 1) * PAGE_SIZE)}
                    className="min-w-[32px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="tertiary" size="sm"
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