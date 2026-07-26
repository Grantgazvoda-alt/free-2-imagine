import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Input } from "@higgsfield/quanta/input";
import { Icon } from "@higgsfield/quanta/icon";
import { toast } from "@higgsfield/quanta/sonner";
import {
  CreditCard, Sparkles, BarChart3, ExternalLink, RefreshCw, Zap, Clock,
  UserPlus, Download, FileText, FileSpreadsheet, Users, Shield,
} from "lucide-react";
import { getUsageStatsFn, getBillingPortalUrlFn, inviteTeamMemberFn, removeTeamMemberFn, exportUsageFn } from "@/lib/billing.functions";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
  head: () => ({
    meta: [
      { title: "Billing — Orgasmo" },
      { name: "description", content: "Orgasmo billing and usage management" },
    ],
  }),
});

function StatCard({ icon, label, value, subtitle, color }: {
  icon: typeof CreditCard; label: string; value: string | number; subtitle?: string; color: string;
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

function UsageBar({ used, total, color }: { used: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const barColor = color ?? (pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-q-brand-primary");
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Typography as="span" variant="caption-sm-regular" color="tertiary">{used} used</Typography>
        <Typography as="span" variant="caption-sm-regular" color="tertiary">{total} total</Typography>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-q-background-tertiary">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <Typography as="span" variant="caption-xs-regular" color={pct >= 90 ? "danger" : "tertiary"}>
        {pct}% of limit
      </Typography>
    </div>
  );
}

function BillingPage() {
  const [portalLoading, setPortalLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteScope, setInviteScope] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [inviting, setInviting] = useState(false);

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
      if (result.ok && result.url) window.location.href = result.url;
    } catch {}
    setPortalLoading(false);
  };

  const handleExport = async (format: "csv" | "json") => {
    setExportLoading(true);
    try {
      const result = await exportUsageFn({ data: { format } });
      if (result.ok) {
        const mime = format === "csv" ? "text/csv" : "application/json";
        const ext = format === "csv" ? "csv" : "json";
        const blob = new Blob([result.data], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orgasmo-usage-${new Date().toISOString().split("T")[0]}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Usage exported as ${format.toUpperCase()}`);
      }
    } catch {}
    setExportLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteScope.trim() || !inviteName.trim()) return;
    setInviting(true);
    try {
      const result = await inviteTeamMemberFn({
        data: { memberScope: inviteScope.trim(), memberName: inviteName.trim(), memberRole: inviteRole },
      });
      if (result.ok) {
        toast.success("Team member invited successfully");
        setInviteOpen(false);
        setInviteScope("");
        setInviteName("");
        refetch();
      } else {
        toast.error(result.error === "already_member" ? "Already a team member" : "Failed to invite");
      }
    } catch {
      toast.error("Failed to invite team member");
    }
    setInviting(false);
  };

  const handleRemoveMember = async (scope: string) => {
    try {
      const result = await removeTeamMemberFn({ data: { memberScope: scope } });
      if (result.ok) {
        toast.success("Team member removed");
        refetch();
      }
    } catch {}
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
              <StatCard icon={Zap} label="Generations Used" value={usage.totalUsed} subtitle="this period" color="bg-blue-600" />
              <StatCard icon={BarChart3} label="Remaining" value={usage.remaining} subtitle={`of ${usage.monthlyLimit}`} color="bg-purple-600" />
              <StatCard icon={Clock} label="Status" value={usage.status === "active" ? "Active" : "Inactive"} subtitle={usage.plan === "free" ? "Free tier" : "Paid plan"} color="bg-amber-600" />
            </div>

            {/* Usage bar */}
            <div className="flex flex-col gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
              <Typography as="h2" variant="title-sm-semi-bold" color="primary">Monthly Usage</Typography>
              <UsageBar used={usage.totalUsed} total={usage.monthlyLimit} />
            </div>

            {/* Role-based limits */}
            {usage.roleLimits && (
              <div className="flex flex-col gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
                <div className="flex items-center gap-3">
                  <Icon as={Shield} size="md" className="text-q-text-tertiary" />
                  <Typography as="h2" variant="title-sm-semi-bold" color="primary">Role-Based Limits</Typography>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(usage.roleLimits).map(([role, lim]) => (
                    <div key={role} className="flex flex-col gap-1.5 rounded-q-300 bg-q-background-tertiary p-3">
                      <Typography as="span" variant="label-sm-medium" color="primary" className="capitalize">{role}</Typography>
                      <Typography as="span" variant="display-sm-bold" color="brand">{lim.limit}</Typography>
                      <Typography as="span" variant="caption-xs-regular" color="tertiary">{lim.label}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage by day */}
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

            {/* Per-member breakdown */}
            {usage.memberBreakdown && usage.memberBreakdown.length > 1 && (
              <div className="flex flex-col gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon as={Users} size="md" className="text-q-text-tertiary" />
                    <Typography as="h2" variant="title-sm-semi-bold" color="primary">Per-Member Usage</Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <Typography as="span" variant="caption-sm-regular" color="tertiary">
                      {usage.teamMemberCount ?? 0} team members
                    </Typography>
                    <Button variant="tertiary" size="xs" onClick={() => setInviteOpen(true)} start={<Icon as={UserPlus} size="sm" />}>
                      Invite
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {usage.memberBreakdown.map((member) => {
                    const pct = usage.totalUsed > 0 ? Math.round((member.count / usage.totalUsed) * 100) : 0;
                    const roleLimit = usage.roleLimits?.[member.role as keyof typeof usage.roleLimits];
                    return (
                      <div key={member.userScope} className="flex flex-col gap-1.5 rounded-q-300 bg-q-background-tertiary px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block size-2 shrink-0 rounded-full ${member.role === "owner" ? "bg-q-brand-primary" : member.role === "admin" ? "bg-amber-500" : "bg-blue-500"}`} />
                            <Typography as="span" variant="body-sm-regular" color="primary">{member.memberName}</Typography>
                            <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">({member.role})</Typography>
                          </div>
                          <div className="flex items-center gap-3">
                            <Typography as="span" variant="body-sm-semi-bold" color="brand">{member.count}</Typography>
                            {member.role !== "owner" && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.userScope)}
                                className="text-q-text-tertiary hover:text-red-500 transition-colors text-xs"
                                aria-label={`Remove ${member.memberName}`}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-q-background-secondary">
                            <div className="h-full rounded-full bg-q-brand-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <Typography as="span" variant="caption-xs-regular" color="tertiary" className="shrink-0 w-8 text-right">{pct}%</Typography>
                        </div>
                        {roleLimit && (
                          <Typography as="span" variant="caption-xs-regular" color="tertiary">
                            Role limit: {roleLimit.limit} generations ({roleLimit.label})
                          </Typography>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between rounded-q-300 bg-q-background-tertiary px-3 py-2">
                  <Typography as="span" variant="body-sm-semi-bold" color="primary">Total</Typography>
                  <Typography as="span" variant="body-sm-semi-bold" color="brand">{usage.totalUsed}</Typography>
                </div>
              </div>
            )}

            {/* Invite UI */}
            {inviteOpen && (
              <div className="flex flex-col gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
                <Typography as="h2" variant="title-sm-semi-bold" color="primary">Invite Team Member</Typography>
                <div className="flex flex-col gap-3">
                  <Input
                    value={inviteScope}
                    onChange={(e) => setInviteScope(e.target.value)}
                    placeholder="User ID or email"
                    label="User Scope"
                    description="The Higgsfield user ID or email of the person to invite"
                  />
                  <Input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Display name"
                    label="Display Name"
                  />
                  <div className="flex flex-col gap-1">
                    <Typography as="span" variant="caption-sm-regular" color="tertiary">Role</Typography>
                    <div className="flex gap-2">
                      <Button
                        variant={inviteRole === "member" ? "primary" : "tertiary"}
                        size="sm"
                        onClick={() => setInviteRole("member")}
                      >
                        Member (40% limit)
                      </Button>
                      <Button
                        variant={inviteRole === "admin" ? "primary" : "tertiary"}
                        size="sm"
                        onClick={() => setInviteRole("admin")}
                      >
                        Admin (60% limit)
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleInvite} disabled={inviting || !inviteScope.trim() || !inviteName.trim()}>
                      {inviting ? "Inviting..." : "Send Invite"}
                    </Button>
                    <Button variant="tertiary" onClick={() => setInviteOpen(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {usage.plan !== "free" && (
                <Button variant="tertiary" size="sm" onClick={handleBillingPortal} disabled={portalLoading} start={<Icon as={ExternalLink} size="sm" />}>
                  {portalLoading ? "Loading..." : "Manage Billing"}
                </Button>
              )}
              <Button variant="tertiary" size="sm" onClick={() => window.location.href = "/pricing"} start={<Icon as={Sparkles} size="sm" />}>
                {usage.plan === "free" ? "Upgrade Plan" : "Change Plan"}
              </Button>
              <Button variant="tertiary" size="sm" onClick={() => handleExport("csv")} disabled={exportLoading} start={<Icon as={FileSpreadsheet} size="sm" />}>
                Export CSV
              </Button>
              <Button variant="tertiary" size="sm" onClick={() => handleExport("json")} disabled={exportLoading} start={<Icon as={FileText} size="sm" />}>
                Export JSON
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}