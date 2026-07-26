import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Typography } from "@higgsfield/quanta/typography";
import { Button } from "@higgsfield/quanta/button";
import { Input } from "@higgsfield/quanta/input";
import { Select } from "@higgsfield/quanta/select";
import { Icon } from "@higgsfield/quanta/icon";
import { Mail, Eye, Copy, Check } from "lucide-react";
import { renderInviteEmail, renderInviteText } from "@/lib/invite-email";

export const Route = createFileRoute("/admin/email-preview")({
  component: EmailPreviewPage,
  head: () => ({
    meta: [
      { title: "Email Preview — Orgasmo Admin" },
      { name: "description", content: "Preview email templates" },
    ],
  }),
});

function EmailPreviewPage() {
  const [template, setTemplate] = useState("invite");
  const [memberName, setMemberName] = useState("Jane Doe");
  const [role, setRole] = useState("member");
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://orgasmo.higgsfield.app/team?invite=demo-user-123`;

  const html = renderInviteEmail({
    inviterName: "Demo User",
    inviterEmail: "demo@orgasmo.app",
    teamName: "Orgasmo Team",
    memberName,
    role,
    inviteLink,
    expiresIn: "7 days",
  });

  const text = renderInviteText({
    inviterName: "Demo User",
    teamName: "Orgasmo Team",
    memberName,
    role,
    inviteLink,
  });

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Icon as={Mail} size="lg" />
          <Typography as="h1" variant="headline-md-semi-bold" color="primary">Email Template Preview</Typography>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
          <div className="flex flex-col gap-1">
            <Typography as="span" variant="caption-sm-regular" color="tertiary">Template</Typography>
            <div className="flex gap-2">
              <Button variant={template === "invite" ? "primary" : "tertiary"} size="sm" onClick={() => setTemplate("invite")}>Team Invite</Button>
            </div>
          </div>
          <Input label="Member Name" value={memberName} onChange={(e) => setMemberName(e.target.value)} className="w-48" />
          <div className="flex flex-col gap-1">
            <Typography as="span" variant="caption-sm-regular" color="tertiary">Role</Typography>
            <div className="flex gap-2">
              <Button variant={role === "member" ? "primary" : "tertiary"} size="sm" onClick={() => setRole("member")}>Member</Button>
              <Button variant={role === "admin" ? "primary" : "tertiary"} size="sm" onClick={() => setRole("admin")}>Admin</Button>
            </div>
          </div>
        </div>

        {/* HTML Preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Typography as="h2" variant="title-sm-semi-bold" color="primary">
              <Icon as={Eye} size="sm" className="inline mr-2" />
              HTML Preview
            </Typography>
            <Button variant="tertiary" size="xs" onClick={copyHtml} start={<Icon as={copied ? Check : Copy} size="sm" />}>
              {copied ? "Copied" : "Copy HTML"}
            </Button>
          </div>
          <div className="overflow-hidden rounded-q-500 border border-q-border-subtle">
            <iframe
              srcDoc={html}
              title="Email preview"
              className="h-[600px] w-full bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Plain text preview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Typography as="h2" variant="title-sm-semi-bold" color="primary">Plain Text Version</Typography>
            <Button variant="tertiary" size="xs" onClick={copyText} start={<Icon as={copied ? Check : Copy} size="sm" />}>
              {copied ? "Copied" : "Copy Text"}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-4 text-q-body-sm-regular text-q-text-secondary whitespace-pre-wrap font-mono text-sm">
            {text}
          </pre>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-q-caption-sm-regular text-q-text-tertiary">
          <span>HTML: {html.length.toLocaleString()} chars</span>
          <span>Text: {text.length.toLocaleString()} chars</span>
          <span>Ratio: {Math.round((text.length / html.length) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}