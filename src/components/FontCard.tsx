import { memo, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface Font {
  id: number;
  family: string;
  subfamily: string;
  file_path: string;
  metadata_json: string;
  variant_count?: number;
  category?: string;
  subcategory?: string;
  is_favorite?: number;
}

interface FontCardProps {
  font: Font;
  isSelected: boolean;
  onClick: () => void;
  previewText?: string;
  fontSize?: number;
  features?: Record<string, boolean>;
  onFontsChange?: () => void;
}

export const FontCard = memo(function FontCard({
  font,
  isSelected,
  onClick,
  previewText = "",
  fontSize = 32,
  features = {},
  onFontsChange,
}: FontCardProps) {
  const fontId = `font-${font.id}`;
  const [isFavorite, setIsFavorite] = useState(!!font.is_favorite);

  const fontFaceStyle = useMemo(() => {
    // Escaping backslashes for Windows paths
    const url = `file://${font.file_path.replace(/\\/g, "/")}`;
    return (
      <style key={fontId}>
        {`
            @font-face {
                font-family: '${fontId}';
                src: url('${url}');
                font-display: swap;
            }
            `}
      </style>
    );
  }, [font.file_path, fontId]);

  const featureSettings = useMemo(() => {
    return Object.entries(features)
      .map(([key, value]) => `"${key}" ${value ? 1 : 0}`)
      .join(", ");
  }, [features]);

  const displayText = previewText || "Aa";

  return (
    <>
      {fontFaceStyle}
      <div
        onClick={onClick}
        className={cn(
          "group relative flex flex-col justify-between rounded-xl border bg-card p-4 cursor-pointer h-full shadow-sm",
          isSelected && "border-primary ring-1 ring-primary"
        )}
      >
        <div className="mb-8 flex items-start justify-between">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const newState = !isFavorite;
              setIsFavorite(newState);
              if (window.api?.toggleFavorite) {
                await window.api.toggleFavorite(font.family, newState);
                // Refresh font list to update favorites view
                if (onFontsChange) {
                  onFontsChange();
                }
              }
            }}
            className="p-1 -m-1"
          >
            <Heart
              className={cn(
                "w-5 h-5",
                isFavorite
                  ? "fill-destructive text-destructive"
                  : "text-muted-foreground/30 hover:text-destructive group-hover:text-destructive"
              )}
            />
          </button>
          <span className="rounded bg-secondary/50 px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {font.variant_count ? `${font.variant_count} ${font.variant_count === 1 ? 'style' : 'styles'}` : '1 style'}
          </span>
        </div>

        <div
          className="mb-8 flex h-24 items-center justify-center overflow-hidden w-full text-center"
          style={{
            fontFamily: `'${fontId}', sans-serif`, // Fallback
            fontSize: `${fontSize}px`,
            fontFeatureSettings: featureSettings,
            opacity: 1,
            isolation: 'isolate',
          }}
        >
          <span className="truncate w-full block">{displayText}</span>
        </div>

        <div>
          <h3 className="text-base font-medium truncate select-none" title={font.family}>{font.family}</h3>
          {(font.category || font.subcategory) && (
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {[font.category, font.subcategory].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>
    </>
  );
}, (prev, next) => {
  return (
    prev.font.id === next.font.id &&
    prev.isSelected === next.isSelected &&
    prev.fontSize === next.fontSize &&
    prev.previewText === next.previewText &&
    prev.features === next.features
  );
});
