import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Input } from "@higgsfield/quanta/input";
import { Icon } from "@higgsfield/quanta/icon";
import { toast } from "@higgsfield/quanta/sonner";
import { Shield, Save, RefreshCw } from "lucide-react";
import { getUsageLimitsFn, updateUsageLimitsFn } from "@/lib/billing.functions";

export const Route = createFileRoute("/admin/usage-limits")({
  component: UsageLimitsPage,
  head: () => ({
    meta: [
      { title: "Usage Limits — Orgasmo Admin" },
      { name: "description", content: "Manage usage limits for team members" },
    ],
  }),
});

function UsageLimitsPage() {
  const [ownerLimit, setOwnerLimit] = useState("");
  const [adminLimit, setAdminLimit] = useState("");
  const [memberLimit, setMemberLimit] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "usage-limits"],
    queryFn: () => getUsageLimitsFn(),
    refetchOnWindowFocus: false,
    staleTime: 10_000,
  });

  const limits = data?.ok ? data.limits : null;

  // Initialize form fields when data loads
  useState(() => {
    if (limits) {
      setOwnerLimit(String(limits.owner));
      setAdminLimit(String(limits.admin));
      setMemberLimit(String(limits.member));
    }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateUsageLimitsFn({
        data: {
          memberScope: "current",
          ownerLimit: parseInt(ownerLimit) || undefined,
          adminLimit: parseInt(adminLimit) || undefined,
          memberLimit: parseInt(memberLimit) || undefined,
        },
      });
      if (result.ok) {
        toast.success("Usage limits updated");
        refetch();
      } else {
        toast.error("Failed to update limits");
      }
    } catch {
      toast.error("Failed to update limits");
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-q-background-primary">
        <Loader size="md" color="neutral" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon as={Shield} size="lg" />
            <Typography as="h1" variant="headline-md-semi-bold" color="primary">Usage Limits</Typography>
          </div>
          <Button variant="tertiary" size="sm" onClick={() => refetch()} start={<Icon as={RefreshCw} size="sm" />}>
            Refresh
          </Button>
        </div>

        {limits && (
          <>
            <div className="flex flex-col gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
              <Typography as="h2" variant="title-sm-semi-bold" color="primary">Current Plan</Typography>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <Typography as="span" variant="caption-sm-regular" color="tertiary">Plan</Typography>
                  <Typography as="span" variant="display-sm-bold" color="primary" className="capitalize">{limits.plan}</Typography>
                </div>
                <div className="flex flex-col gap-1">
                  <Typography as="span" variant="caption-sm-regular" color="tertiary">Default Limit</Typography>
                  <Typography as="span" variant="display-sm-bold" color="primary">{limits.defaultLimit}</Typography>
                </div>
                <div className="flex flex-col gap-1">
                  <Typography as="span" variant="caption-sm-regular" color="tertiary">Custom</Typography>
                  <Typography as="span" variant="display-sm-bold" color="primary">{limits.isCustom ? "Yes" : "No"}</Typography>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
              <Typography as="h2" variant="title-sm-semi-bold" color="primary">Custom Limits</Typography>
              <Typography as="p" variant="body-sm-regular" color="secondary">
                Override the default role-based limits. Leave empty to use defaults.
              </Typography>
              <div className="flex flex-col gap-3">
                <Input
                  label="Owner Limit"
                  value={ownerLimit}
                  onChange={(e) => setOwnerLimit(e.target.value)}
                  type="number"
                  min={1}
                  max={10000}
                  description="Full plan limit for account owner"
                />
                <Input
                  label="Admin Limit"
                  value={adminLimit}
                  onChange={(e) => setAdminLimit(e.target.value)}
                  type="number"
                  min={1}
                  max={10000}
                  description="Limit for admin role members"
                />
                <Input
                  label="Member Limit"
                  value={memberLimit}
                  onChange={(e) => setMemberLimit(e.target.value)}
                  type="number"
                  min={1}
                  max={10000}
                  description="Limit for regular member role"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                start={<Icon as={Save} size="sm" />}
                className="self-start"
              >
                {saving ? "Saving..." : "Save Limits"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}