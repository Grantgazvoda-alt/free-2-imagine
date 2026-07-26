import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Typography } from "@higgsfield/quanta/typography";
import { Button } from "@higgsfield/quanta/button";
import { Input } from "@higgsfield/quanta/input";
import { Icon } from "@higgsfield/quanta/icon";
import { Mail, Copy, Check, Download, Square, CheckSquare } from "lucide-react";
import { renderInviteEmail, renderInviteText } from "@/lib/invite-email";

export const Route = createFileRoute("/admin/email-templates")({
  component: EmailTemplatesPage,
  head: () => ({
    meta: [
      { title: "Email Templates — Orgasmo Admin" },
      { name: "description", content: "Manage email templates" },
    ],
  }),
});

interface TemplateDef {
  id: string;
  name: string;
  description: string;
  variables: string[];
  preview: (vars: Record<string, string>) => { html: string; text: string };
}

const TEMPLATES: TemplateDef[] = [
  {
    id: "team-invite",
    name: "Team Invite",
    description: "Sent when a team member is invited to join",
    variables: ["inviterName", "teamName", "memberName", "role", "inviteLink", "expiresIn"],
    preview: (vars) => {
      const html = renderInviteEmail({
        inviterName: vars.inviterName || "Demo User",
        inviterEmail: vars.inviterEmail || "demo@orgasmo.app",
        teamName: vars.teamName || "Orgasmo Team",
        memberName: vars.memberName || "Jane Doe",
        role: vars.role || "member",
        inviteLink: vars.inviteLink || "https://orgasmo.higgsfield.app/team?invite=demo",
        expiresIn: vars.expiresIn || "7 days",
      });
      const text = renderInviteText({
        inviterName: vars.inviterName || "Demo User",
        teamName: vars.teamName || "Orgasmo Team",
        memberName: vars.memberName || "Jane Doe",
        role: vars.role || "member",
        inviteLink: vars.inviteLink || "https://orgasmo.higgsfield.app/team?invite=demo",
      });
      return { html, text };
    },
  },
  {
    id: "usage-export",
    name: "Usage Export",
    description: "Sent when usage data is exported via email",
    variables: ["filename", "generatedDate", "recordCount", "format"],
    preview: (vars) => {
      const filename = vars.filename || "orgasmo-usage-2026-07-25.csv";
      const date = vars.generatedDate || new Date().toISOString();
      const count = vars.recordCount || "150";
      const format = vars.format || "CSV";
      const html = `<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a0f; color: #e4e4e7; border-radius: 12px;">
        <div style="font-size: 24px; font-weight: 700; color: #a3e635; margin-bottom: 4px;">Orgasmo</div>
        <div style="color: #71717a; font-size: 14px; margin-bottom: 24px;">AI Image Generation</div>
        <h1 style="font-size: 20px; color: #fff; margin: 0 0 8px;">Usage Export Ready</h1>
        <p style="color: #a1a1aa; font-size: 15px; line-height: 1.5;">Your usage data has been exported. See attached file for details.</p>
        <div style="background: #12121f; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <dl>
            <dt style="color: #71717a; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;">File</dt>
            <dd style="color: #e4e4e7; font-size: 14px; margin: 0 0 12px;">${filename}</dd>
            <dt style="color: #71717a; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;">Format</dt>
            <dd style="color: #e4e4e7; font-size: 14px; margin: 0 0 12px;">${format}</dd>
            <dt style="color: #71717a; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;">Records</dt>
            <dd style="color: #e4e4e7; font-size: 14px; margin: 0 0 12px;">${count}</dd>
            <dt style="color: #71717a; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;">Generated</dt>
            <dd style="color: #e4e4e7; font-size: 14px; margin: 0;">${date}</dd>
          </dl>
        </div>
        <p style="color: #52525b; font-size: 13px;">This is an automated export from Orgasmo.</p>
      </div>`;
      const text = `Orgasmo - Usage Export Ready\n\nYour usage data has been exported.\nFile: ${filename}\nFormat: ${format}\nRecords: ${count}\nGenerated: ${date}`;
      return { html, text };
    },
  },
  {
    id: "usage-limit",
    name: "Usage Limit Warning",
    description: "Sent when approaching or exceeding usage limits",
    variables: ["planName", "limit", "used", "percent", "memberName"],
    preview: (vars) => {
      const pct = vars.percent || "85";
      const html = `<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a0f; color: #e4e4e7; border-radius: 12px;">
        <div style="font-size: 24px; font-weight: 700; color: #a3e635; margin-bottom: 4px;">Orgasmo</div>
        <div style="color: #71717a; font-size: 14px; margin-bottom: 24px;">AI Image Generation</div>
        <h1 style="font-size: 20px; color: #fff; margin: 0 0 8px;">Usage Limit Warning</h1>
        <p style="color: #a1a1aa; font-size: 15px; line-height: 1.5;">You've used ${pct}% of your ${vars.planName || "Pro"} plan limit.</p>
        <div style="background: #12121f; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <dl>
            <dt style="color: #71717a; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;">Used</dt>
            <dd style="color: #e4e4e7; font-size: 14px; margin: 0 0 12px;">${vars.used || "85"} / ${vars.limit || "100"} generations</dd>
            <dt style="color: #71717a; font-size: 12px; text-transform: uppercase; margin-bottom: 2px;">Plan</dt>
            <dd style="color: #e4e4e7; font-size: 14px; margin: 0 0 12px;">${vars.planName || "Pro"}</dd>
          </dl>
        </div>
        <a href="https://orgasmo.higgsfield.app/pricing" style="display: inline-block; background: #a3e635; color: #0a0a0f; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">Upgrade Plan</a>
      </div>`;
      const text = `Orgasmo - Usage Limit Warning\n\nYou've used ${pct}% of your ${vars.planName || "Pro"} plan limit.\nUsed: ${vars.used || "85"} / ${vars.limit || "100"} generations\n\nUpgrade: https://orgasmo.higgsfield.app/pricing`;
      return { html, text };
    },
  },
];

function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(filteredTemplates.map((t) => t.id));
    }
    setSelectAll(!selectAll);
  };

  const bulkDownload = () => {
    for (const id of selectedTemplates) {
      const t = TEMPLATES.find((t) => t.id === id);
      if (t) {
        const preview = t.preview({});
        const blob = new Blob([preview.html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${id}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const bulkCopy = async () => {
    const texts = selectedTemplates.map((id) => {
      const t = TEMPLATES.find((t) => t.id === id);
      return t ? `${t.name}: ${t.preview({}).html}` : "";
    }).join("\n\n---\n\n");
    await navigator.clipboard.writeText(texts);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTemplates = TEMPLATES;

  const template = TEMPLATES.find((t) => t.id === selectedTemplate) ?? TEMPLATES[0];
  const preview = template.preview(variables);

  const copyHtml = async () => {
    await navigator.clipboard.writeText(preview.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const blob = new Blob([preview.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Icon as={Mail} size="lg" />
          <Typography as="h1" variant="headline-md-semi-bold" color="primary">Email Templates</Typography>
        </div>

        {/* Template selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TEMPLATES.map((t) => (
            <Button
              key={t.id}
              variant={selectedTemplate === t.id ? "primary" : "tertiary"}
              
              onClick={() => { setSelectedTemplate(t.id); setVariables({}); }}
            >
              {t.name}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Preview */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Typography as="h2" variant="title-sm-semi-bold" color="primary">{template.name}</Typography>
                <Typography as="p" variant="body-sm-regular" color="tertiary">{template.description}</Typography>
              </div>
              <div className="flex gap-2">
                <Button variant="tertiary" size="xs" onClick={copyHtml} start={<Icon as={copied ? Check : Copy}  />}>
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="tertiary" size="xs" onClick={downloadHtml} start={<Icon as={Download}  />}>
                  Download
                </Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-q-500 border border-q-border-subtle">
              <iframe
                srcDoc={preview.html}
                title={template.name}
                className="h-[500px] w-full bg-white"
                sandbox="allow-same-origin"
              />
            </div>
            <div className="flex gap-4 text-q-caption-xs-regular text-q-text-tertiary">
              <span>HTML: {preview.html.length.toLocaleString()} chars</span>
              <span>Text: {preview.text.length.toLocaleString()} chars</span>
            </div>
          </div>

          {/* Variables panel */}
          <div className="flex flex-col gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-4">
            <Typography as="h3" variant="label-sm-medium" color="primary">Template Variables</Typography>
            {template.variables.length === 0 ? (
              <Typography as="p" variant="body-sm-regular" color="tertiary">No variables for this template.</Typography>
            ) : (
              <div className="flex flex-col gap-3">
                {template.variables.map((v) => (
                  <div key={v} className="flex flex-col gap-0.5">
                    <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">{`{{${v}}}`}</Typography>
                    <Input
                      value={variables[v] ?? ""}
                      onChange={(e) => setVariables((prev) => ({ ...prev, [v]: e.target.value }))}
                      placeholder={v}
                      
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Plain text */}
        <div className="flex flex-col gap-2">
          <Typography as="h3" variant="label-sm-medium" color="primary">Plain Text</Typography>
          <pre className="overflow-x-auto rounded-q-400 border border-q-border-subtle bg-q-background-secondary p-3 text-q-body-sm-regular text-q-text-secondary whitespace-pre-wrap font-mono text-sm">
            {preview.text}
          </pre>
        </div>
      </div>
    </div>
  );
}