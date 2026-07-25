import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@higgsfield/quanta/button";
import { Icon } from "@higgsfield/quanta/icon";
import { Typography } from "@higgsfield/quanta/typography";
import { Modal } from "@higgsfield/quanta/modal";
import { Input } from "@higgsfield/quanta/input";
import { Heart, HeartOff, Grid3X3, Search, Download, Upload, Check } from "lucide-react";

export interface AvatarStyle {
  value: string;
  title: string;
  subtitle: string;
  gradient: string;
  emoji: string;
  previewSvg: string;
}

const FAVORITES_KEY = "orgasmo_avatar_favorites";

function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {}
}

function generatePreviewSvg(emoji: string, gradient: string, title: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradient.split(",")[0].split("(")[1].trim() || "#333"}" />
        <stop offset="100%" stop-color="${gradient.split(",").pop()?.split(")")[0]?.trim() || "#111"}" />
      </linearGradient>
    </defs>
    <rect width="200" height="150" fill="url(#g)" rx="8" />
    <text x="100" y="75" text-anchor="middle" dominant-baseline="central" font-size="40">${emoji}</text>
    <text x="100" y="125" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="11" font-family="sans-serif">${title}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const AVATAR_STYLE_DEFS: AvatarStyle[] = [
  { value: "professional", title: "Professional", subtitle: "Corporate headshot", gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", emoji: "💼", previewSvg: "" },
  { value: "fantasy", title: "Fantasy", subtitle: "Mythical character", gradient: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)", emoji: "🧙", previewSvg: "" },
  { value: "cartoon", title: "Cartoon", subtitle: "Animated style", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", emoji: "🎨", previewSvg: "" },
  { value: "cyberpunk", title: "Cyberpunk", subtitle: "Futuristic neon", gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", emoji: "🤖", previewSvg: "" },
  { value: "anime", title: "Anime", subtitle: "Japanese animation", gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", emoji: "🌸", previewSvg: "" },
  { value: "realistic", title: "Realistic", subtitle: "Photorealistic", gradient: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)", emoji: "📸", previewSvg: "" },
  { value: "pixel", title: "Pixel Art", subtitle: "Retro game style", gradient: "linear-gradient(135deg, #0f9b0f 0%, #00d2ff 100%)", emoji: "🕹️", previewSvg: "" },
  { value: "noir", title: "Noir", subtitle: "Film noir", gradient: "linear-gradient(135deg, #000000 0%, #434343 100%)", emoji: "🎬", previewSvg: "" },
  { value: "watercolor", title: "Watercolor", subtitle: "Soft painted style", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", emoji: "🎨", previewSvg: "" },
  { value: "oilpainting", title: "Oil Painting", subtitle: "Classic canvas art", gradient: "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)", emoji: "🖼️", previewSvg: "" },
  { value: "sketch", title: "Sketch", subtitle: "Pencil drawing", gradient: "linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)", emoji: "✏️", previewSvg: "" },
  { value: "3drender", title: "3D Render", subtitle: "CGI realistic", gradient: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)", emoji: "💎", previewSvg: "" },
  { value: "steampunk", title: "Steampunk", subtitle: "Victorian sci-fi", gradient: "linear-gradient(135deg, #3e1f00 0%, #b8860b 100%)", emoji: "⚙️", previewSvg: "" },
  { value: "gothic", title: "Gothic", subtitle: "Dark romantic", gradient: "linear-gradient(135deg, #1a0000 0%, #4a0000 100%)", emoji: "🦇", previewSvg: "" },
  { value: "popart", title: "Pop Art", subtitle: "Comic book style", gradient: "linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6bcb77 100%)", emoji: "💥", previewSvg: "" },
  { value: "renaissance", title: "Renaissance", subtitle: "Classical portrait", gradient: "linear-gradient(135deg, #8b4513 0%, #d4a574 100%)", emoji: "🎭", previewSvg: "" },
  { value: "vaporwave", title: "Vaporwave", subtitle: "80s retro aesthetic", gradient: "linear-gradient(135deg, #ff00cc 0%, #333399 100%)", emoji: "🌴", previewSvg: "" },
  { value: "minimalist", title: "Minimalist", subtitle: "Clean line art", gradient: "linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)", emoji: "○", previewSvg: "" },
];

// Generate preview SVGs
AVATAR_STYLE_DEFS.forEach((s) => {
  s.previewSvg = generatePreviewSvg(s.emoji, s.gradient, s.title);
});

export function getStyleByValue(value: string): AvatarStyle | undefined {
  return AVATAR_STYLE_DEFS.find((s) => s.value === value);
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AvatarStyleCard({
  style,
  selected,
  favorited,
  onSelect,
  onToggleFavorite,
}: {
  style: AvatarStyle;
  selected: boolean;
  favorited: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-q-500 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
      <button
        type="button"
        onClick={onSelect}
        className={`flex cursor-pointer flex-col overflow-hidden border-2 transition-all ${
          selected
            ? "border-q-brand-primary shadow-[0_0_0_1px_var(--hf-color-brand-primary)]"
            : "border-transparent hover:border-q-border-subtle"
        } rounded-q-500`}
      >
        <div
          className="relative flex h-20 items-center justify-center overflow-hidden"
          style={{ backgroundImage: style.gradient }}
        >
          <img
            src={style.previewSvg}
            alt={style.title}
            className="absolute inset-0 size-full object-cover"
          />
          <span className="relative text-3xl drop-shadow-lg">{style.emoji}</span>
        </div>
        <div className="flex flex-col gap-0.5 bg-q-background-secondary px-2.5 py-2">
          <Typography as="span" variant="label-sm-medium" color="primary" truncate>
            {style.title}
          </Typography>
          <Typography as="span" variant="caption-xs-regular" color="tertiary" truncate>
            {style.subtitle}
          </Typography>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Icon as={favorited ? Heart : HeartOff} size="sm" />
      </button>
    </div>
  );
}

export function AvatarStylePickerModal({
  open,
  onOpenChange,
  selectedStyle,
  onSelect,
  customCount,
  onCustomCountChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStyle: string;
  onSelect: (style: string) => void;
  customCount: number;
  onCustomCountChange: (count: number) => void;
}) {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customCountInput, setCustomCountInput] = useState(String(customCount));
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = (value: string) => {
    setFavorites((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleExport = () => {
    const data = JSON.stringify({ favorites, exportedAt: new Date().toISOString(), count: favorites.length }, null, 2);
    downloadFile(data, `orgasmo-favorites-${new Date().toISOString().split("T")[0]}.json`, "application/json");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.favorites && Array.isArray(data.favorites)) {
          const valid = data.favorites.filter((v: string) =>
            AVATAR_STYLE_DEFS.some((s) => s.value === v)
          );
          setFavorites(valid);
        }
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filteredStyles = useMemo(() => {
    let all = AVATAR_STYLE_DEFS;
    if (showFavorites) {
      all = all.filter((s) => favorites.includes(s.value));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      all = all.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.subtitle.toLowerCase().includes(q) ||
          s.value.toLowerCase().includes(q),
      );
    }
    return [...all].sort((a, b) => {
      const aFav = favorites.includes(a.value) ? 1 : 0;
      const bFav = favorites.includes(b.value) ? 1 : 0;
      return bFav - aFav;
    });
  }, [favorites, showFavorites, searchQuery]);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="lg">
        <Modal.Header>
          <div className="flex items-center gap-3">
            <Icon as={Grid3X3} size="md" />
            <Modal.Title>Choose Avatar Style</Modal.Title>
          </div>
          <Modal.CloseButton />
        </Modal.Header>

        {/* Search + toolbar */}
        <div className="flex flex-col gap-3 px-4 pb-3">
          <div className="relative">
            <Icon as={Search} size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-q-text-tertiary" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search styles..."
              className="w-full pl-9"
              aria-label="Search avatar styles"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant={showFavorites ? "primary" : "tertiary"}
                size="sm"
                onClick={() => setShowFavorites(!showFavorites)}
                start={<Icon as={Heart} size="sm" />}
              >
                {showFavorites ? "All Styles" : `Favorites (${favorites.length})`}
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                onClick={handleExport}
                start={<Icon as={copied ? Check : Download} size="sm" />}
                disabled={favorites.length === 0}
              >
                {copied ? "Exported" : "Export"}
              </Button>
              <Button
                variant="tertiary"
                size="sm"
                onClick={handleImport}
                start={<Icon as={Upload} size="sm" />}
              >
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <Typography as="span" variant="caption-sm-regular" color="tertiary">
                Batch:
              </Typography>
              <Input
                type="number"
                value={customCountInput}
                onChange={(e) => {
                  setCustomCountInput(e.target.value);
                  const n = parseInt(e.target.value, 10);
                  if (n >= 1 && n <= 36) onCustomCountChange(n);
                }}
                className="w-16"
                min={1}
                max={36}
                aria-label="Custom batch count"
              />
            </div>
          </div>
        </div>

        {/* Style grid */}
        <div className="max-h-[360px] min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {filteredStyles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Icon as={searchQuery ? Search : HeartOff} size="lg" className="text-q-text-tertiary" />
              <Typography as="p" variant="body-sm-regular" color="tertiary">
                {searchQuery
                  ? `No styles matching "${searchQuery}"`
                  : "No favorites yet. Click the heart icon on a style to add it."}
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {filteredStyles.map((style) => (
                <AvatarStyleCard
                  key={style.value}
                  style={style}
                  selected={selectedStyle === style.value}
                  favorited={favorites.includes(style.value)}
                  onSelect={() => {
                    onSelect(style.value);
                    onOpenChange(false);
                  }}
                  onToggleFavorite={() => toggleFavorite(style.value)}
                />
              ))}
            </div>
          )}
        </div>

        <Modal.Footer>
          <Modal.FooterCaption>
            {filteredStyles.length} of {AVATAR_STYLE_DEFS.length} styles
            {favorites.length > 0 ? ` · ${favorites.length} favorited` : ""}
            {searchQuery ? ` · searching "${searchQuery}"` : ""}
          </Modal.FooterCaption>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}