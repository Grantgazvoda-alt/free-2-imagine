export type ModelAvailability =
  | "registered"
  | "external-inference-required"
  | "discovery-only";

export type ModelOutput = "image" | "video" | "image-edit" | "model-asset";

export interface ProductModel {
  id: string;
  label: string;
  provider: string;
  output: ModelOutput;
  availability: ModelAvailability;
  tier: "fast" | "standard" | "premium" | "specialist";
  supportsReferences: boolean;
  maxBatch?: number;
  notes: string;
}

/**
 * Models that have typed job definitions and are registered with FNF.
 * Availability at runtime still depends on the deployed Higgsfield catalog.
 */
export const REGISTERED_MODELS: readonly ProductModel[] = [
  {
    id: "gpt_image_2",
    label: "GPT Image 2",
    provider: "OpenAI / Higgsfield",
    output: "image",
    availability: "registered",
    tier: "premium",
    supportsReferences: true,
    maxBatch: 4,
    notes: "Current default. Supports 1K-4K output and up to four images per approved job.",
  },
  {
    id: "nano_banana_flash",
    label: "Nano Banana Flash",
    provider: "Google / Higgsfield",
    output: "image",
    availability: "registered",
    tier: "fast",
    supportsReferences: true,
    maxBatch: 4,
    notes: "Fast image generation and editing route.",
  },
  {
    id: "nano_banana_2",
    label: "Nano Banana Pro",
    provider: "Google / Higgsfield",
    output: "image",
    availability: "registered",
    tier: "standard",
    supportsReferences: true,
    maxBatch: 4,
    notes: "Higher-quality multi-reference image generation.",
  },
  {
    id: "seedream_v4_5",
    label: "Seedream 4.5",
    provider: "ByteDance",
    output: "image",
    availability: "registered",
    tier: "standard",
    supportsReferences: true,
    maxBatch: 4,
    notes: "Multi-reference image generation with basic and high quality modes.",
  },
  {
    id: "recraft_v4_1",
    label: "Recraft V4.1",
    provider: "Recraft",
    output: "image",
    availability: "registered",
    tier: "specialist",
    supportsReferences: false,
    maxBatch: 4,
    notes: "Design, typography and vector-oriented output through standard, utility and vector modes.",
  },
  {
    id: "seedance_2_0",
    label: "Seedance 2.0",
    provider: "ByteDance",
    output: "video",
    availability: "registered",
    tier: "premium",
    supportsReferences: true,
    maxBatch: 4,
    notes: "Standard and fast video modes, multimodal references and optional generated audio.",
  },
  {
    id: "happy_horse_video",
    label: "HappyHorse Video",
    provider: "Alibaba",
    output: "video",
    availability: "registered",
    tier: "standard",
    supportsReferences: true,
    maxBatch: 4,
    notes: "Text-to-video or image-to-video from 3-15 seconds at 720p or 1080p.",
  },
  {
    id: "kling3_0",
    label: "Kling 3.0",
    provider: "Kuaishou",
    output: "video",
    availability: "registered",
    tier: "premium",
    supportsReferences: true,
    notes: "Supports first/last frames, multi-shot prompts, sound and up to 4K mode.",
  },
  {
    id: "veo3_1_lite",
    label: "Veo 3.1 Lite",
    provider: "Google",
    output: "video",
    availability: "registered",
    tier: "premium",
    supportsReferences: true,
    notes: "4, 6 or 8 second video with optional audio and first/last frames.",
  },
  {
    id: "wan2_7",
    label: "Wan 2.7",
    provider: "Alibaba",
    output: "video",
    availability: "registered",
    tier: "standard",
    supportsReferences: true,
    notes: "2-15 second video at 720p or 1080p.",
  },
  {
    id: "grok_video",
    label: "Grok Imagine Video",
    provider: "xAI",
    output: "video",
    availability: "registered",
    tier: "premium",
    supportsReferences: true,
    notes: "Text-to-video or image-to-video with 1-15 second duration.",
  },
  {
    id: "grok_video_v15",
    label: "Grok Imagine Video 1.5",
    provider: "xAI",
    output: "video",
    availability: "registered",
    tier: "premium",
    supportsReferences: true,
    notes: "Image-to-video route requiring a starting frame.",
  },
] as const;

/**
 * Recommended models from the supplied model-selection guide that are not
 * implemented by the current FNF runtime. Listing them here prevents the UI
 * from falsely presenting them as executable.
 */
export const EXTERNAL_MODELS: readonly ProductModel[] = [
  {
    id: "flux-1-schnell",
    label: "FLUX.1 Schnell",
    provider: "Black Forest Labs",
    output: "image",
    availability: "external-inference-required",
    tier: "fast",
    supportsReferences: false,
    notes: "Recommended preview route; requires a Workers AI or other inference adapter.",
  },
  {
    id: "flux-2-klein-4b",
    label: "FLUX.2 Klein 4B",
    provider: "Black Forest Labs",
    output: "image-edit",
    availability: "external-inference-required",
    tier: "standard",
    supportsReferences: true,
    notes: "Recommended interactive image generation/editing route; no adapter exists in this app.",
  },
  {
    id: "flux-2-klein-9b",
    label: "FLUX.2 Klein 9B",
    provider: "Black Forest Labs",
    output: "image-edit",
    availability: "external-inference-required",
    tier: "premium",
    supportsReferences: true,
    notes: "Higher-quality FLUX tier requiring an external inference adapter.",
  },
  {
    id: "flux-2-dev",
    label: "FLUX.2 Dev",
    provider: "Black Forest Labs",
    output: "image-edit",
    availability: "external-inference-required",
    tier: "specialist",
    supportsReferences: true,
    notes: "Detailed realism/editing route; costs depend on inference steps and deployment.",
  },
  {
    id: "stable-diffusion-xl-base-1.0",
    label: "Stable Diffusion XL 1.0",
    provider: "Stability AI",
    output: "image",
    availability: "external-inference-required",
    tier: "specialist",
    supportsReferences: false,
    notes: "Legacy self-hosted compatibility option, not a recommended default.",
  },
  {
    id: "stable-diffusion-v1-5-img2img",
    label: "Stable Diffusion 1.5 Img2Img",
    provider: "RunwayML",
    output: "image-edit",
    availability: "external-inference-required",
    tier: "specialist",
    supportsReferences: true,
    notes: "Legacy transformation compatibility route requiring external inference.",
  },
  {
    id: "stable-diffusion-v1-5-inpainting",
    label: "Stable Diffusion 1.5 Inpainting",
    provider: "RunwayML",
    output: "image-edit",
    availability: "external-inference-required",
    tier: "specialist",
    supportsReferences: true,
    notes: "Legacy masked editing route requiring external inference and a mask UI.",
  },
  {
    id: "dreamshaper-8-lcm",
    label: "DreamShaper 8 LCM",
    provider: "Lykon",
    output: "image",
    availability: "external-inference-required",
    tier: "specialist",
    supportsReferences: false,
    notes: "Civitai-style checkpoint route; confirm exact license and model provenance before deployment.",
  },
] as const;

export const CIVITAI_DISCOVERY_FAMILIES: readonly ProductModel[] = [
  "SD 1.5",
  "SDXL 1.0",
  "Flux.1",
  "Flux.2",
  "Pony",
  "Illustrious",
  "NoobAI",
  "ControlNet",
  "LoRA",
].map((label) => ({
  id: `civitai:${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`,
  label,
  provider: "Civitai community",
  output: "model-asset" as const,
  availability: "discovery-only" as const,
  tier: "specialist" as const,
  supportsReferences: false,
  notes: "Searchable/downloadable through Civitai MCP. Execution requires ComfyUI or another compatible GPU backend.",
}));

export const MODEL_CATALOG = [
  ...REGISTERED_MODELS,
  ...EXTERNAL_MODELS,
  ...CIVITAI_DISCOVERY_FAMILIES,
] as const;
