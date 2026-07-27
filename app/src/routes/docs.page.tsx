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
} from "lucide-react";

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
