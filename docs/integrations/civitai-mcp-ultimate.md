# Civitai MCP Ultimate Integration

Source project: [timoncool/civitai-mcp-ultimate](https://github.com/timoncool/civitai-mcp-ultimate)

`civitai-mcp-ultimate` is an MIT-licensed Python MCP server that exposes the Civitai public REST API to MCP-compatible AI assistants. It supports model discovery, image and prompt browsing, creator and tag lookup, authenticated model downloads, and ComfyUI path mapping.

## Capabilities

The MCP server provides tools for:

- Searching checkpoints, LoRAs, ControlNets, and other Civitai model types
- Looking up models and model versions by ID or file hash
- Finding top checkpoints and LoRAs by base model
- Browsing Civitai images and retrieving generation parameters
- Searching creators and tags
- Producing authenticated download URLs and shell commands
- Filtering Civitai results by content rating when an API key is configured

## Installation

```bash
pip install civitai-mcp-ultimate
```

Run it directly:

```bash
civitai-mcp-ultimate
```

Or with `uvx`:

```bash
uvx civitai-mcp-ultimate
```

## MCP client configuration

```json
{
  "mcpServers": {
    "civitai": {
      "command": "uvx",
      "args": ["civitai-mcp-ultimate"],
      "env": {
        "CIVITAI_API_KEY": "your_key_here"
      }
    }
  }
}
```

## Environment variables

| Variable | Required | Default | Purpose |
|---|---:|---|---|
| `CIVITAI_API_KEY` | Recommended | — | Authenticated Civitai access and higher rate limits |
| `CIVITAI_MCP_LANG` | No | `en` | English or Russian output |
| `COMFYUI_MODELS_PATH` | No | — | Maps downloaded models into ComfyUI directories |
| `MEILISEARCH_KEY` | No | Built in | Search-only Meilisearch credential |

## Relationship to Free 2 Imagine

This integration is a **model-discovery and asset-research companion**, not a drop-in replacement for the app's existing Higgsfield generation runtime.

Free 2 Imagine runs as a React/TanStack application on Cloudflare Workers. `civitai-mcp-ultimate` runs as a Python MCP process over stdio. A production connection therefore requires one of these deployment patterns:

1. Run the MCP server alongside an AI assistant used by developers or operators.
2. Deploy a separate trusted Python service and expose a narrow authenticated HTTP adapter to the app.
3. Reimplement only the required Civitai REST calls in a server-only TypeScript module.

Do not expose `CIVITAI_API_KEY` to browser code. Credentials must remain in a server-side secret store.

## Recommended first use

Use Civitai discovery to help operators identify compatible checkpoints, LoRAs, trigger words, example prompts, and model metadata. Model execution still requires an inference runtime capable of loading those assets, such as ComfyUI or another Stable Diffusion-compatible backend.

## Upstream tools

### Models

- `search_models`
- `get_model`
- `get_model_version`
- `get_model_version_by_hash`
- `get_top_checkpoints`
- `get_top_loras`

### Images

- `browse_images`
- `get_top_images`
- `get_model_images`
- `get_image_generation_data`

### Creators and tags

- `get_creators`
- `get_tags`

### Downloads

- `get_download_url`
- `get_download_info`

## License and attribution

The upstream project is distributed under the MIT License. Preserve its license and attribution when copying or modifying upstream source code.
