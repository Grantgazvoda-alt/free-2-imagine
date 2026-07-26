import { useState } from "react";
import { Modal } from "@higgsfield/quanta/modal";
import { Button } from "@higgsfield/quanta/button";
import { Icon } from "@higgsfield/quanta/icon";
import { Typography } from "@higgsfield/quanta/typography";
import { Tabs } from "@higgsfield/quanta/tabs";
import { HelpCircle, Sparkles, UserRound, Layers, BarChart3, Settings, FileText } from "lucide-react";

const HELP_SECTIONS = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Sparkles,
    content: [
      { title: "Sign In", text: "Click Sign In in the sidebar or go to Settings to connect your Higgsfield account." },
      { title: "Choose a Mode", text: "Freeform mode lets you generate any image from a text prompt. Avatar mode creates personalized avatars from a reference photo." },
      { title: "Enter a Prompt", text: "Describe what you want to generate. Be specific about style, colors, lighting, and composition." },
      { title: "Generate", text: "Click the Generate button (the cost is shown inside the button). Confirm the cost in the approval modal." },
    ],
  },
  {
    id: "freeform",
    label: "Freeform Mode",
    icon: Sparkles,
    content: [
      { title: "Text Prompts", text: "Describe any image you want. The model supports detailed descriptions of subjects, styles, lighting, and composition." },
      { title: "Style Presets", text: "Choose from Natural, Vivid, Cinematic, Anime, Illustration, Noir, or Fantasy to set the overall aesthetic." },
      { title: "Reference Images", text: "Upload a reference image to guide the generation style or composition." },
      { title: "Aspect Ratio", text: "Pick from Square (1:1), Portrait (3:4), Landscape (4:3), Wide (16:9), or Story (9:16)." },
      { title: "Variations", text: "Set the number of variations (1-4) to generate multiple options at once. All variations appear in your feed." },
    ],
  },
  {
    id: "avatar",
    label: "Avatar Mode",
    icon: UserRound,
    content: [
      { title: "Reference Photo", text: "Upload a photo of a person. The AI will use this as the base for generating avatars in different styles." },
      { title: "Style Presets", text: "18 styles available: Professional, Fantasy, Cartoon, Cyberpunk, Anime, Realistic, Pixel Art, Noir, Watercolor, Oil Painting, Sketch, 3D Render, Steampunk, Gothic, Pop Art, Renaissance, Vaporwave, Minimalist." },
      { title: "Browse Styles", text: "Click 'Browse Styles' below the prompt box to see all styles with visual previews. You can search, favorite, and export your favorites." },
      { title: "Batch Generation", text: "Choose Single style, 4 styles, 6 styles, All 18, or a custom number. The model generates each style as a separate variation." },
      { title: "Favorites", text: "Click the heart icon on any style card to add it to your favorites. Export/import favorites as JSON files." },
    ],
  },
  {
    id: "bulk",
    label: "Bulk Generation",
    icon: Layers,
    content: [
      { title: "Variations", text: "In Freeform mode, set Variations to 2-4 to generate multiple images from the same prompt at once." },
      { title: "Pick the Best", text: "After bulk generation, a 'Pick the best result' modal shows all variations side-by-side. Click 'Keep this' on your favorite." },
      { title: "All Results Saved", text: "All variations are saved to your feed regardless of which one you pick. You can always go back and compare." },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    content: [
      { title: "Dashboard", text: "Visit the Analytics page from the sidebar to see your usage statistics." },
      { title: "Page Views", text: "Shows total page views and daily view counts for the last 14 days." },
      { title: "Generations", text: "Tracks how many images you've generated." },
      { title: "Feature Usage", text: "Shows which features are used most often (templates, generation modes, etc.)." },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    content: [
      { title: "Profile", text: "View your user ID and workspace. Sign out from here." },
      { title: "Credits", text: "Manage your subscription and credits through your Higgsfield account." },
      { title: "Appearance", text: "Orgasmo uses the system dark theme, matching the Higgsfield platform." },
    ],
  },
  {
    id: "api",
    label: "API Reference",
    icon: FileText,
    content: [
      { title: "REST API", text: "The app exposes server functions for generation, media, auth, projects, and analytics. See the full API docs at /docs." },
      { title: "Health Check", text: "GET /api/health returns app status, database connectivity, and version info." },
      { title: "Generation Input", text: "The generation model is gpt_image_2. Input includes prompt, settings (aspectRatio, quality, resolution, batchSize), and optional media references." },
    ],
  },
];

export function HelpModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("getting-started");

  const activeSection = HELP_SECTIONS.find((s) => s.id === activeTab);
  const tabs = HELP_SECTIONS.map((s) => ({
    value: s.id,
    label: s.label,
    start: <Icon as={s.icon} size="sm" />,
  }));

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg">
        <Modal.Header>
          <div className="flex items-center gap-3">
            <Icon as={HelpCircle} size="md" />
            <Modal.Title>Help & Guide</Modal.Title>
          </div>
          <Modal.CloseButton />
        </Modal.Header>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <Tabs.Root variant="pill" value={activeTab} onValueChange={(v) => setActiveTab(String(v))}>
            <Tabs.List items={tabs} className="flex-wrap" />
          </Tabs.Root>
        </div>

        <div className="max-h-[400px] min-h-0 overflow-y-auto px-4 pb-4">
          {activeSection && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-q-300 bg-q-brand-primary/10">
                  <Icon as={activeSection.icon} size="md" className="text-q-brand-primary" />
                </div>
                <Typography as="h2" variant="title-md-semi-bold" color="primary">
                  {activeSection.label}
                </Typography>
              </div>
              <div className="flex flex-col gap-3">
                {activeSection.content.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-q-400 bg-q-background-secondary p-3">
                    <Typography as="h3" variant="label-sm-medium" color="primary">
                      {item.title}
                    </Typography>
                    <Typography as="p" variant="body-sm-regular" color="secondary">
                      {item.text}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Modal.Footer>
          <Modal.FooterCaption>
            {HELP_SECTIONS.length} topics · Need more help? Visit the{" "}
            <a href="/docs" className="text-q-brand-primary underline">
              API Docs
            </a>
          </Modal.FooterCaption>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-q-brand-primary text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95"
      aria-label="Help"
    >
      <Icon as={HelpCircle} size="lg" />
    </button>
  );
}