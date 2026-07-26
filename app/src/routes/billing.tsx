import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Icon } from "@higgsfield/quanta/icon";
import { CreditCard, Sparkles, BarChart3, ExternalLink, RefreshCw, Zap, Clock } from "lucide-react";
import { getUsageStatsFn, getBillingPortalUrlFn } from "@/lib/billing.functions";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
  head: () => ({
    meta: [
      { title: "Billing — Orgasmo" },
      { name: "description", content: "Orgasmo billing and usage management" },
    ],
  }),
});

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-q-400 ${color}`}>
        <Icon as={icon} size="lg" className="text-white" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Typography as="span" variant="body-sm-regular" color="tertiary">{label}</Typography>
        <Typography as="span" variant="display-md-bold" color="primary">{value}</Typography>
        {subtitle && <Typography as="span" variant="caption-xs-regular" color="tertiary">{subtitle}</Typography>}
      </div>
    </div>
  );
}

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-q-brand-primary";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Typography as="span" variant="caption-sm-regular" color="tertiary">{used} used</Typography>
        <Typography as="span" variant="caption-sm-regular" color="tertiary">{total} total</Typography>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-q-background-tertiary">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <Typography as="span" variant="caption-xs-regular" color={pct >= 90 ? "danger" : "tertiary"}>
        {pct}% of monthly limit
      </Typography>
    </div>
  );
}

function BillingPage() {
  const [portalLoading, setPortalLoading] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: () => getUsageStatsFn(),
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });

  const handleBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const result = await getBillingPortalUrlFn();
      if (result.ok && result.url) {
        window.location.href = result.url;
      }
    } catch {}
    setPortalLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-q-background-primary">
        <Loader size="md" color="neutral" aria-label="Loading billing" />
      </div>
    );
  }

  const usage = data?.ok ? data.usage : null;

  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon as={CreditCard} size="lg" />
            <Typography as="h1" variant="headline-md-semi-bold" color="primary">Billing & Usage</Typography>
          </div>
          <Button variant="tertiary" size="sm" onClick={() => refetch()} start={<Icon as={RefreshCw} size="sm" />}>
            Refresh
          </Button>
        </div>

        {error || !usage ? (
          <div className="flex flex-col items-center gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-8 text-center">
            <Typography as="p" variant="body-sm-regular" color="danger">Failed to load billing data</Typography>
            <Button variant="tertiary" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Sparkles} label="Current Plan" value={usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)} subtitle={usage.status} color="bg-lime-600" />
              <StatCard icon={Zap} label="Generations Used" value={usage.totalUsed} subtitle={`this period`} color="bg-blue-600" />
              <StatCard icon={BarChart3} label="Remaining" value={usage.remaining} subtitle={`of ${usage.monthlyLimit}`} color="bg-purple-600" />
              <StatCard icon={Clock} label="Status" value={usage.status === "active" ? "Active" : "Inactive"} subtitle={usage.plan === "free" ? "Free tier" : "Paid plan"} color="bg-amber-600" />
            </div>

            {/* Usage bar */}
            <div className="flex flex-col gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
              <Typography as="h2" variant="title-sm-semi-bold" color="primary">Monthly Usage</Typography>
              <UsageBar used={usage.totalUsed} total={usage.monthlyLimit} />
            </div>

            {/* Usage by day (last 30 days) */}
            {usage.usageByDay.length > 0 && (
              <div className="flex flex-col gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
                <Typography as="h2" variant="title-sm-semi-bold" color="primary">Usage (Last 30 Days)</Typography>
                <div className="flex items-end gap-1 overflow-x-auto pb-2">
                  {usage.usageByDay.map((day) => {
                    const max = Math.max(...usage.usageByDay.map((d) => d.count), 1);
                    const h = Math.max((day.count / max) * 60, 4);
                    return (
                      <div key={day.day} className="flex shrink-0 flex-col items-center gap-1" title={`${day.day}: ${day.count} generations`}>
                        <Typography as="span" variant="caption-xs-regular" color="tertiary">{day.count}</Typography>
                        <div className="w-5 rounded-t-q-200 bg-q-brand-primary" style={{ height: `${h}px` }} />
                        <Typography as="span" variant="caption-xs-regular" color="tertiary" className="text-[9px]">{day.day.slice(5)}</Typography>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Usage by model */}
            {usage.usageByModel.length > 0 && (
              <div className="flex flex-col gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
                <Typography as="h2" variant="title-sm-semi-bold" color="primary">Usage by Model</Typography>
                <div className="flex flex-col gap-2">
                  {usage.usageByModel.map((m) => (
                    <div key={m.model} className="flex items-center justify-between rounded-q-300 bg-q-background-tertiary px-3 py-2">
                      <Typography as="span" variant="body-sm-regular" color="primary" className="font-mono text-xs">{m.model}</Typography>
                      <Typography as="span" variant="body-sm-semi-bold" color="brand">{m.count}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {usage.plan !== "free" && (
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={handleBillingPortal}
                  disabled={portalLoading}
                  start={<Icon as={ExternalLink} size="sm" />}
                >
                  {portalLoading ? "Loading..." : "Manage Billing"}
                </Button>
              )}
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => window.location.href = "/pricing"}
                start={<Icon as={Sparkles} size="sm" />}
              >
                {usage.plan === "free" ? "Upgrade Plan" : "Change Plan"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}