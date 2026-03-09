import { cn } from "@/lib/utils";

interface WaterfallTabProps {
  activeTab: string;
  specimenText: string;
  getTypographyStyle: (
    baseFontSize?: number,
    settings?: { featureSettings?: string }
  ) => React.CSSProperties;
}

export function WaterfallTab({
  activeTab,
  specimenText,
  getTypographyStyle,
}: WaterfallTabProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-5xl p-8",
        activeTab !== "waterfall" && "hidden"
      )}
    >
      <div className="space-y-8 overflow-hidden">
        {[96, 72, 60, 48, 36, 24, 18, 14, 12].map((size) => (
          <div key={size} className="group flex items-baseline gap-4">
            <span className="text-muted-foreground group-hover:text-primary w-12 shrink-0 text-[10px] select-none">
              {size}px
            </span>
            <p
              style={getTypographyStyle(size)}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {specimenText || "The quick brown fox jumps over the lazy dog"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
