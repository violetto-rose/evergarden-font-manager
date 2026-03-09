import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GlyphsTabProps {
  activeTab: string;
  glyphsToRender: number[];
  sortedChars: number[];
  glyphLimit: number;
  setGlyphLimit: React.Dispatch<React.SetStateAction<number>>;
  getTypographyStyle: (
    baseFontSize?: number,
    settings?: { featureSettings?: string }
  ) => React.CSSProperties;
}

export function GlyphsTab({
  activeTab,
  glyphsToRender,
  sortedChars,
  glyphLimit,
  setGlyphLimit,
  getTypographyStyle,
}: GlyphsTabProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-5xl p-12",
        activeTab !== "glyphs" && "hidden"
      )}
    >
      <div className="text-muted-foreground mb-4 flex items-center justify-between text-sm">
        <span>
          Showing {glyphsToRender.length} of{" "}
          {sortedChars.length > 0 ? sortedChars.length : "default"} glyphs
        </span>
        {sortedChars.length === 0 && (
          <span className="text-xs opacity-70">
            (Rescan library to verify full support)
          </span>
        )}
      </div>

      <div className="grid grid-cols-8 gap-3 sm:grid-cols-12 md:grid-cols-16">
        {glyphsToRender.map((code) => (
          <div
            key={code}
            className="hover:bg-secondary border-border flex aspect-square cursor-default items-center justify-center rounded border text-2xl"
            style={getTypographyStyle(24)}
            title={`U+${code.toString(16).toUpperCase().padStart(4, "0")}`}
          >
            {String.fromCodePoint(code)}
          </div>
        ))}
      </div>

      {sortedChars.length > glyphLimit && (
        <div className="mt-8 pb-8 text-center">
          <Button
            onClick={() => setGlyphLimit((prev) => prev + 200)}
            variant="outline"
          >
            Load More Glyphs
          </Button>
        </div>
      )}
    </section>
  );
}
