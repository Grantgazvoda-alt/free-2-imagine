# Orgasmo — Generation Credit Pass (TODO)

This file tracks assets that still need to be generated once credits are available.
The app is fully functional without these — every placeholder is a styled dark SVG,
not a broken image — but these are needed for marketplace publishing and polish.

## Blocking publish (cover + icon)

These three fields in `app/src/app-meta.json` must be filled before `publish_website`:

| Field | Tool | Spec |
|---|---|---|
| `og_image_url` | `generate_app_branding` → `finalize_app_branding` | 3:2 scene, text-free, code-drawn title |
| `marketplace_cover_url` | Same run | Full-bleed version of the OG image |
| `favicon_url` | Same run | 1:1 square icon, 3D style |

**Sequence:** `generate_app_branding(route: "graphic", product_name: "Orgasmo", scene_concept: "surreal boundless art studio floating in a cosmic void, digital fountain of color, neon brushes, no text", icon_style: "3d", icon_subject: "polished chrome paintbrush with glowing rainbow splash, deep purple background")` → poll jobs → judge 2 scenes (kill any with lettering) → `finalize_app_branding(title: "Orgasmo")`.

## Hero images

The Studio hero currently shows a triptych of placeholder SVGs. Replace with:

| Slot | Prompt for `gpt_image_2` | Aspect |
|---|---|---|
| Center (focal) | "surreal abstract digital art, glowing neon orbs floating in a dark cyberpunk workspace, volumetric fog, cinematic lighting, ultra detailed" | 1:1 |
| Left support | "abstract close-up of iridescent crystal formations, electric blue and purple, macro photography" | 4:3 |
| Right support | "wide shot of a futuristic neon-lit data center, holographic displays, deep purple shadows" | 4:3 |

## Template/preset thumbnails

6 templates in `app/src/components/template-picker.tsx`. Each needs a 1:1 thumbnail:

| Preset | Prompt for `gpt_image_2` |
|---|---|
| Cyberpunk City | "neon-lit cyberpunk city street at night, vibrant pink and cyan lights, wet asphalt reflections, cinematic" |
| Fantasy Portrait | "epic fantasy character portrait, glowing magical aura, detailed armor, dramatic lighting" |
| Surreal Landscape | "dreamlike impossible landscape, floating islands, glowing crystals, purple and teal color palette" |
| Noir Film Frame | "high contrast black and white film noir scene, dramatic shadows, venetian blinds, smoke" |
| Vaporwave | "retro 80s synthwave aesthetic, neon sunset over grid, palm trees, purple and pink gradient" |
| Product Hero | "clean studio product photography, white background, dramatic rim lighting, sharp focus" |

## Optional: cover video

Permission-gated. If the user wants it: `og_video_url` via the cover-animator workflow.