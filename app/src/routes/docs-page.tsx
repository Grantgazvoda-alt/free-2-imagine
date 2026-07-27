import { useState } from "react";
import { Typography } from "@higgsfield/quanta/typography";
import { Icon } from "@higgsfield/quanta/icon";
import {
  Terminal,
  Code,
  Database,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  BarChart,
} from "lucide-react";


interface Endpoint {
  name: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  input?: string;
  output?: string;
}

interface Section {
  title: string;
  icon: typeof Terminal;
  description: string;
  endpoints: Endpoint[];
}

const SECTIONS: Section[] = [
  {
    title: "Authentication",
    icon: Shield,
    description: "User authentication and session management.",
    endpoints: [
      {
        name: "Get Current User",
        method: "GET",
        path: "/api/user",
        description: "Returns the current user profile. Proxies fnf.internal/user. Returns 401 when not signed in.",
        output: `{
  "id": "string",
  "workspaceId": "string",
  "workspaceType": "string",
  "planType": "string"
}`,
      },
      {
        name: "Sign In",
        method: "GET",
        path: "/__auth/login?return=<path>",
        description: "Redirects to Higgsfield sign-in. After login, redirects back to the return path.",
      },
      {
        name: "Sign Out",
        method: "GET",
        path: "/__auth/logout?return=<path>",
        description: "Signs out the current user and redirects to the return path.",
      },
    ],
  },
  {
    title: "Generation",
    icon: Terminal,
    description: "Image generation jobs using GPT Image 2.",
    endpoints: [
      {
        name: "Create Generation Job",
        method: "POST",
        path: "createJobsFn",
        description: "Submit a generation job. Requires a confirmation token from the approval gate.",
        input: `{
  "jobSetType": "string",
  "params": {
    "model": "gpt_image_2",
    "prompt": { "instruction": "string" },
    "settings": {
      "aspectRatio": "1:1 | 3:4 | 4:3 | 16:9 | 9:16",
      "quality": "low | medium | high",
      "resolution": "1k | 2k | 4k",
      "batchSize": "1 | 2 | 3 | 4"
    }
  },
  "confirmationToken": "string (optional)"
}`,
        output: `{
  "generations": [
    {
      "id": "string",
      "status": "queued | running | completed | failed",
      "results": {
        "rawUrl": "string",
        "minUrl": "string",
        "thumbnailUrl": "string"
      }
    }
  ]
}`,
      },
      {
        name: "Get Generation Job",
        method: "POST",
        path: "getJobFn",
        description: "Get a single generation job by ID.",
        input: `{ "id": "string" }`,
        output: `{ "id": "string", "status": "string", "results": {...} }`,
      },
      {
        name: "List Generations",
        method: "POST",
        path: "listJobsFn",
        description: "List generations with optional filters and pagination.",
        input: `{
  "type": "image (optional)",
  "cursor": "string | number (optional)",
  "size": "number (optional)",
  "status": "string (optional)",
  "model": "string (optional)"
}`,
        output: `{ "items": [...], "cursor": "string | null" }`,
      },
      {
        name: "Estimate Cost",
        method: "POST",
        path: "estimateCostFn",
        description: "Get the credit cost estimate for a generation input.",
        input: `{ "jobSetType": "string", "params": {...} }`,
        output: `{ "credits": "number" }`,
      },
      {
        name: "Cancel Generation",
        method: "POST",
        path: "cancelJobFn",
        description: "Cancel a running generation job.",
        input: `{ "id": "string" }`,
      },
    ],
  },
  {
    title: "Media",
    icon: Database,
    description: "Upload and manage media files.",
    endpoints: [
      {
        name: "Upload Media",
        method: "POST",
        path: "/api/media/upload",
        description: "Upload an image file. Accepts multipart/form-data with a `file` field.",
        input: "multipart/form-data: { file: File }",
        output: `{
  "ok": true,
  "ref": {
    "id": "string",
    "type": "media_input"
  },
  "url": "string"
}`,
      },
      {
        name: "Get Media",
        method: "POST",
        path: "getMediaFn",
        description: "Get a media reference by ID.",
        input: `{ "id": "string", "type": "image | video | audio" }`,
      },
      {
        name: "List Media",
        method: "POST",
        path: "listMediaFn",
        description: "List uploaded media with pagination.",
        input: `{ "type": "image | video | audio", "cursor?": "string", "size?": "number" }`,
      },
    ],
  },
  {
    title: "Profile & Workspace",
    icon: Terminal,
    description: "User profile, workspace management, and credits.",
    endpoints: [
      {
        name: "Get User",
        method: "POST",
        path: "getUserFn",
        description: "Get the current authenticated user.",
      },
      {
        name: "List Workspaces",
        method: "POST",
        path: "listWorkspacesFn",
        description: "List available workspaces.",
      },
      {
        name: "Get Current Workspace",
        method: "POST",
        path: "getCurrentWorkspaceFn",
        description: "Get the active workspace.",
      },
      {
        name: "Get Wallet",
        method: "POST",
        path: "getWorkspaceWalletFn",
        description: "Get wallet and credits balance.",
      },
      {
        name: "Switch Workspace",
        method: "POST",
        path: "switchWorkspaceFn",
        description: "Switch to a different workspace.",
        input: `{ "workspaceId": "string" }`,
      },
    ],
  },
  {
    title: "Projects",
    icon: FolderIcon,
    description: "Organize generations into named projects.",
    endpoints: [
      {
        name: "List Projects",
        method: "POST",
        path: "listStudioProjectsFn",
        description: "List all projects for the current user/workspace.",
      },
      {
        name: "Create Project",
        method: "POST",
        path: "createStudioProjectFn",
        description: "Create a new project.",
        input: `{ "name": "string" }`,
      },
      {
        name: "Rename Project",
        method: "POST",
        path: "renameStudioProjectFn",
        description: "Rename an existing project.",
        input: `{ "projectId": "string", "name": "string" }`,
      },
      {
        name: "Delete Project",
        method: "POST",
        path: "deleteStudioProjectFn",
        description: "Delete a project. Generations are kept.",
        input: `{ "projectId": "string" }`,
      },
      {
        name: "Link Generations",
        method: "POST",
        path: "linkStudioGenerationsFn",
        description: "Link generations to a project.",
        input: `{ "projectId": "string", "generationIds": "string[]" }`,
      },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart,
    description: "Track and retrieve analytics events.",
    endpoints: [
      {
        name: "Track Event",
        method: "POST",
        path: "trackEventFn",
        description: "Record an analytics event (page_view, feature_use, or generation).",
        input: `{
  "eventType": "page_view | feature_use | generation",
  "eventName": "string",
  "pagePath": "string (optional)",
  "sessionId": "string (optional)",
  "userScope": "string (optional)",
  "metadata": "string (optional)"
}`,
      },
      {
        name: "Get Analytics Summary",
        method: "POST",
        path: "getAnalyticsSummaryFn",
        description: "Get analytics summary including page views, top pages, recent events, feature usage, and daily views.",
      },
    ],
  },
  {
    title: "Error Codes",
    icon: AlertTriangle,
    description: "Common error codes returned by server functions.",
    endpoints: [
      {
        name: "out_of_credits",
        method: "GET" as const,
        path: "Error",
        description: "The user's account has insufficient credits. Show billing UI.",
      },
      {
        name: "rate_limit",
        method: "GET" as const,
        path: "Error",
        description: "Too many requests. Retry after a short delay.",
      },
      {
        name: "prompt_nsfw",
        method: "GET" as const,
        path: "Error",
        description: "The prompt was flagged by moderation.",
      },
      {
        name: "job_failed",
        method: "GET" as const,
        path: "Error",
        description: "The generation job failed on the backend.",
      },
      {
        name: "confirmation_rejected",
        method: "GET" as const,
        path: "Error",
        description: "The user declined the cost confirmation. This is a user choice, not a failure.",
      },
      {
        name: "validation",
        method: "GET" as const,
        path: "Error",
        description: "Invalid input parameters. Check the request body.",
      },
      {
        name: "db_unavailable",
        method: "GET" as const,
        path: "Error",
        description: "The database is not configured or unavailable.",
      },
    ],
  },
];

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-3 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex shrink-0 items-center rounded-q-200 px-2 py-0.5 text-q-caption-xs-semi-bold uppercase ${
                endpoint.method === "GET"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {endpoint.method}
            </span>
            <Typography as="span" variant="label-md-medium" color="primary" className="font-mono">
              {endpoint.path}
            </Typography>
          </div>
          <Typography as="span" variant="body-sm-regular" color="secondary">
            {endpoint.name}
          </Typography>
        </div>
        <button
          type="button"
          onClick={() => copyToClipboard(endpoint.path)}
          className="flex shrink-0 items-center gap-1 rounded-q-200 px-2 py-1 text-q-text-tertiary transition-colors hover:bg-q-transparent-light-05 hover:text-q-text-primary"
          aria-label="Copy endpoint path"
        >
          <Icon as={copied ? Check : Copy} size="sm" />
        </button>
      </div>

      <Typography as="p" variant="body-sm-regular" color="tertiary" className="text-sm">
        {endpoint.description}
      </Typography>

      {endpoint.input && (
        <div className="flex flex-col gap-1">
          <Typography as="span" variant="caption-xs-semi-bold" color="tertiary" className="uppercase tracking-wider">
            Request
          </Typography>
          <pre className="overflow-x-auto rounded-q-300 bg-q-background-tertiary p-3 text-q-caption-xs-regular text-q-text-secondary">
            <code>{endpoint.input}</code>
          </pre>
        </div>
      )}

      {endpoint.output && (
        <div className="flex flex-col gap-1">
          <Typography as="span" variant="caption-xs-semi-bold" color="tertiary" className="uppercase tracking-wider">
            Response
          </Typography>
          <pre className="overflow-x-auto rounded-q-300 bg-q-background-tertiary p-3 text-q-caption-xs-regular text-q-text-secondary">
            <code>{endpoint.output}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function SectionCard({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 text-left"
      >
        <div className="flex size-10 items-center justify-center rounded-q-300 bg-q-brand-primary/10">
          <Icon as={section.icon as any} size="md" className="text-q-brand-primary" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography as="h2" variant="title-md-semi-bold" color="primary">
            {section.title}
          </Typography>
          <Typography as="p" variant="body-sm-regular" color="tertiary">
            {section.description}
          </Typography>
        </div>
        <Icon as={expanded ? ChevronDown : ChevronRight} size="md" className="text-q-text-tertiary" />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 pl-13">
          {section.endpoints.map((ep, i) => (
            <EndpointCard key={i} endpoint={ep} />
          ))}
        </div>
      )}
    </div>
  );
}


export default function ApiDocs() {
  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Icon as={Code} size="lg" />
            <Typography as="h1" variant="headline-md-semi-bold" color="primary">
              API Documentation
            </Typography>
          </div>
          <Typography as="p" variant="body-sm-regular" color="secondary">
            Complete API reference for the Orgasmo image generation platform.
            All server functions run on Cloudflare Workers via TanStack Start.
          </Typography>
        </div>

        <div className="flex flex-col gap-8">
          {SECTIONS.map((section, i) => (
            <SectionCard key={i} section={section} />
          ))}
        </div>

        <div className="rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-6">
          <Typography as="h2" variant="title-md-semi-bold" color="primary" className="mb-3">
            Generation Input Schema
          </Typography>
          <pre className="overflow-x-auto rounded-q-300 bg-q-background-tertiary p-4 text-q-caption-xs-regular text-q-text-secondary">
            <code>{`{
  model: "gpt_image_2",
  prompt: {
    instruction: string      // The image description
  },
  media?: {
    image: MediaRef[]        // Optional reference images
  },
  settings: {
    aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16",
    quality: "low" | "medium" | "high",
    resolution: "1k" | "2k" | "4k",
    batchSize: 1 | 2 | 3 | 4  // Number of variations
  }
}`}</code>
          </pre>
        </div>

        <div className="rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-6">
          <Typography as="h2" variant="title-md-semi-bold" color="primary" className="mb-3">
            Bulk Actions API
          </Typography>
          <Typography as="p" variant="body-sm-regular" color="secondary">
            The email templates page supports bulk operations on multiple templates.
          </Typography>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">toggleSelectAll()</Typography>
              <Typography as="span" variant="body-sm-regular" color="secondary">Select/deselect all visible templates</Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">bulkDownload()</Typography>
              <Typography as="span" variant="body-sm-regular" color="secondary">Download each selected template as .html</Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">bulkCopy()</Typography>
              <Typography as="span" variant="body-sm-regular" color="secondary">Copy all selected templates to clipboard</Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">openBulkEdit() / applyBulkEdit()</Typography>
              <Typography as="span" variant="body-sm-regular" color="secondary">Set variables across all selected templates</Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography as="span" variant="caption-xs-regular" color="tertiary" className="font-mono">bulkDelete()</Typography>
              <Typography as="span" variant="body-sm-regular" color="secondary">Remove selected templates with confirmation</Typography>
            </div>
          </div>
        </div>

        <div className="rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-6">
          <Typography as="h2" variant="title-md-semi-bold" color="primary" className="mb-3">
            Database Schema (D1)
          </Typography>
          <div className="flex flex-col gap-4">
            <div>
              <Typography as="h3" variant="label-md-medium" color="primary" className="mb-1">
                analytics_events
              </Typography>
              <Typography as="p" variant="body-sm-regular" color="tertiary" className="font-mono text-xs">
                Page views, feature usage, and generation events.
              </Typography>
            </div>
            <div>
              <Typography as="h3" variant="label-md-medium" color="primary" className="mb-1">
                studio_projects
              </Typography>
              <Typography as="p" variant="body-sm-regular" color="tertiary" className="font-mono text-xs">
                User-created projects for organizing generations.
              </Typography>
            </div>
            <div>
              <Typography as="h3" variant="label-md-medium" color="primary" className="mb-1">
                studio_generation_projects
              </Typography>
              <Typography as="p" variant="body-sm-regular" color="tertiary" className="font-mono text-xs">
                Links between generations and projects.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import FolderIcon and BarChart from phosphor/lucide
import { Folder as FolderIcon } from "lucide-react";
