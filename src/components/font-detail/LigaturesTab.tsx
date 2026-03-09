import { cn } from "@/lib/utils";

interface LigaturesTabProps {
  activeTab: string;
  getTypographyStyle: (
    baseFontSize?: number,
    settings?: { featureSettings?: string }
  ) => React.CSSProperties;
}

export function LigaturesTab({
  activeTab,
  getTypographyStyle,
}: LigaturesTabProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-5xl space-y-12 p-12",
        activeTab !== "ligatures" && "hidden"
      )}
    >
      <div className="prose dark:prose-invert max-w-none">
        <h2 className="mb-4 text-2xl font-semibold">Ligatures</h2>
        <p className="text-muted-foreground">
          Common ligatures comparisons. The second line enables the{" "}
          <code>liga</code> feature.
        </p>
      </div>

      <div className="grid gap-8">
        <div className="space-y-4 rounded-lg border p-8">
          <h3 className="text-muted-foreground font-mono text-xs uppercase">
            Standard Ligatures (fi, fl, ffi, ffl)
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground mb-2 text-xs">Disabled</p>
              <p
                className="text-6xl"
                style={getTypographyStyle(64, {
                  featureSettings: '"liga" 0',
                })}
              >
                infinite flower office waffle
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 text-xs">
                Enabled (liga)
              </p>
              <p
                className="text-6xl"
                style={getTypographyStyle(64, {
                  featureSettings: '"liga" 1',
                })}
              >
                infinite flower office waffle
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
