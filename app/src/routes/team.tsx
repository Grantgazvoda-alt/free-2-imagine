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
  Users, UserPlus, UserMinus, Send, Check, X, RefreshCw,
  ArrowRight, ArrowLeft, Clock, Shield,
} from "lucide-react";
import {
  getTeamMembersFn, inviteTeamMemberFn, updateInviteStatusFn,
} from "@/lib/billing.functions";

export const Route = createFileRoute("/team")({
  component: TeamPage,
  head: () => ({
    meta: [
      { title: "Team Management — Orgasmo" },
      { name: "description", content: "Orgasmo team and invite management" },
    ],
  }),
});

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    pending: "bg-amber-500/20 text-amber-400",
    invited: "bg-blue-500/20 text-blue-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-q-caption-xs-semi-bold ${colors[status] ?? "bg-gray-500/20 text-gray-400"}`}>
      {status}
    </span>
  );
}

function TeamPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteScope, setInviteScope] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [inviting, setInviting] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["team", "members"],
    queryFn: () => getTeamMembersFn(),
    refetchOnWindowFocus: false,
    staleTime: 10_000,
  });

  const handleInvite = async () => {
    if (!inviteScope.trim() || !inviteName.trim()) return;
    setInviting(true);
    try {
      const result = await inviteTeamMemberFn({
        data: { memberScope: inviteScope.trim(), memberName: inviteName.trim(), memberRole: inviteRole },
      });
      if (result.ok) {
        toast.success("Invitation sent");
        setInviteOpen(false);
        setInviteScope("");
        setInviteName("");
        refetch();
      } else {
        toast.error(result.error === "already_member" ? "Already a team member" : "Failed to invite");
      }
    } catch {
      toast.error("Failed to send invitation");
    }
    setInviting(false);
  };

  const handleAction = async (memberId: number, action: "accept" | "decline" | "cancel" | "resend") => {
    try {
      const result = await updateInviteStatusFn({ data: { memberId, action } });
      if (result.ok) {
        toast.success(action === "accept" ? "Invitation accepted" : action === "decline" ? "Invitation declined" : action === "cancel" ? "Invitation cancelled" : "Invitation resent");
        refetch();
      }
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-q-background-primary">
        <Loader size="md" color="neutral" aria-label="Loading team" />
      </div>
    );
  }

  const members = data?.ok ? data.members : [];
  const outgoing = members.filter((m) => m.direction === "outgoing");
  const incoming = members.filter((m) => m.direction === "incoming");
  const activeMembers = members.filter((m) => m.status === "active");
  const pendingInvites = members.filter((m) => m.status === "invited" || m.status === "pending");

  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon as={Users} size="lg" />
            <Typography as="h1" variant="headline-md-semi-bold" color="primary">Team Management</Typography>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="tertiary" size="sm" onClick={() => refetch()} start={<Icon as={RefreshCw} size="sm" />}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)} start={<Icon as={UserPlus} size="sm" />}>
              Invite Member
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-8 text-center">
            <Typography as="p" variant="body-sm-regular" color="danger">Failed to load team data</Typography>
            <Button variant="tertiary" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-4">
                <Typography as="span" variant="body-sm-regular" color="tertiary">Active Members</Typography>
                <Typography as="span" variant="display-md-bold" color="primary">{activeMembers.length}</Typography>
              </div>
              <div className="flex flex-col gap-1 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-4">
                <Typography as="span" variant="body-sm-regular" color="tertiary">Pending Invites</Typography>
                <Typography as="span" variant="display-md-bold" color="primary">{pendingInvites.length}</Typography>
              </div>
              <div className="flex flex-col gap-1 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-4">
                <Typography as="span" variant="body-sm-regular" color="tertiary">Total</Typography>
                <Typography as="span" variant="display-md-bold" color="primary">{members.length}</Typography>
              </div>
            </div>

            {/* Invite form */}
            {inviteOpen && (
              <div className="flex flex-col gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
                <Typography as="h2" variant="title-sm-semi-bold" color="primary">Invite a Team Member</Typography>
                <div className="flex flex-col gap-3">
                  <Input value={inviteScope} onChange={(e) => setInviteScope(e.target.value)} placeholder="User ID or email" label="User Scope" description="The Higgsfield user ID or email of the person to invite" />
                  <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Display name" label="Display Name" />
                  <div className="flex flex-col gap-1">
                    <Typography as="span" variant="caption-sm-regular" color="tertiary">Role</Typography>
                    <div className="flex gap-2">
                      <Button variant={inviteRole === "member" ? "primary" : "tertiary"} size="sm" onClick={() => setInviteRole("member")}>Member (40% limit)</Button>
                      <Button variant={inviteRole === "admin" ? "primary" : "tertiary"} size="sm" onClick={() => setInviteRole("admin")}>Admin (60% limit)</Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleInvite} disabled={inviting || !inviteScope.trim() || !inviteName.trim()} start={<Icon as={Send} size="sm" />}>
                      {inviting ? "Sending..." : "Send Invitation"}
                    </Button>
                    <Button variant="tertiary" onClick={() => setInviteOpen(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Active members */}
            {activeMembers.length > 0 && (
              <div className="flex flex-col gap-3">
                <Typography as="h2" variant="title-sm-semi-bold" color="primary">
                  Active Members ({activeMembers.length})
                </Typography>
                <div className="flex flex-col gap-2">
                  {activeMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-q-brand-primary/10">
                          <Icon as={m.direction === "outgoing" ? ArrowRight : ArrowLeft} size="sm" className="text-q-brand-primary" />
                        </span>
                        <div className="flex flex-col">
                          <Typography as="span" variant="body-sm-medium" color="primary">{m.name}</Typography>
                          <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">{m.scope.slice(0, 16)}...</Typography>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-q-text-tertiary">
                          <Icon as={Shield} size="sm" />
                          <Typography as="span" variant="caption-xs-regular" color="tertiary">{m.role}</Typography>
                        </span>
                        <StatusBadge status={m.status} />
                        <Typography as="span" variant="caption-xs-regular" color="tertiary">
                          {m.joinedAt ? m.joinedAt.slice(0, 10) : ""}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending invites */}
            {pendingInvites.length > 0 && (
              <div className="flex flex-col gap-3">
                <Typography as="h2" variant="title-sm-semi-bold" color="primary">
                  Pending Invites ({pendingInvites.length})
                </Typography>
                <div className="flex flex-col gap-2">
                  {pendingInvites.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
                          <Icon as={Clock} size="sm" className="text-amber-500" />
                        </span>
                        <div className="flex flex-col">
                          <Typography as="span" variant="body-sm-medium" color="primary">{m.name}</Typography>
                          <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">{m.scope.slice(0, 16)}...</Typography>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={m.status} />
                        {m.direction === "incoming" ? (
                          <>
                            <Button variant="primary" size="xs" onClick={() => handleAction(m.id, "accept")} start={<Icon as={Check} size="sm" />}>Accept</Button>
                            <Button variant="tertiary" size="xs" onClick={() => handleAction(m.id, "decline")} start={<Icon as={X} size="sm" />}>Decline</Button>
                          </>
                        ) : (
                          <>
                            <Button variant="tertiary" size="xs" onClick={() => handleAction(m.id, "resend")} start={<Icon as={Send} size="sm" />}>Resend</Button>
                            <Button variant="tertiary" size="xs" onClick={() => handleAction(m.id, "cancel")} start={<Icon as={UserMinus} size="sm" />}>Cancel</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {members.length === 0 && !inviteOpen && (
              <div className="flex flex-col items-center gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-12 text-center">
                <Icon as={Users} size="xl" className="text-q-text-tertiary" />
                <Typography as="h2" variant="title-md-semi-bold" color="secondary">No team members yet</Typography>
                <Typography as="p" variant="body-sm-regular" color="tertiary" className="max-w-sm">
                  Invite team members to collaborate on image generation. Members share the team's plan credits.
                </Typography>
                <Button onClick={() => setInviteOpen(true)} start={<Icon as={UserPlus} size="sm" />}>Invite Your First Member</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}