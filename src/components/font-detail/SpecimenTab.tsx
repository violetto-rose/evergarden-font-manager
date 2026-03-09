import { cn } from "@/lib/utils";

interface SpecimenTabProps {
  activeTab: string;
  font: any;
  isOsInstalled: boolean;
  specimenText: string;
  setSpecimenText: (text: string) => void;
  getTypographyStyle: (
    baseFontSize?: number,
    settings?: { featureSettings?: string }
  ) => React.CSSProperties;
  typography: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    align: string;
  };
  characters: string[];
}

export function SpecimenTab({
  activeTab,
  font,
  isOsInstalled,
  specimenText,
  setSpecimenText,
  getTypographyStyle,
  typography,
  characters,
}: SpecimenTabProps) {
  return (
    <div className={cn("flex flex-col", activeTab !== "specimen" && "hidden")}>
      <section className="border-b p-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-2">
            <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              Selected Family
            </span>
            <div className="mb-8 flex items-center gap-3">
              <h1 className="text-3xl font-semibold">{font.family}</h1>
              {isOsInstalled && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-500 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Installed
                </span>
              )}
            </div>
          </div>
          <div
            className="text-foreground focus:border-muted-foreground min-h-[1.2em] text-[120px] leading-tight wrap-break-word outline-none focus:border-b focus:border-dashed"
            contentEditable
            suppressContentEditableWarning
            style={getTypographyStyle()}
            onInput={(e) => setSpecimenText(e.currentTarget.textContent || "")}
            onBlur={(e) => setSpecimenText(e.currentTarget.textContent || "")}
          >
            {specimenText}
          </div>
          <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
            <span>Click to edit specimen text</span>
            <span>
              {typography.fontSize}px / {typography.lineHeight} Leading
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-20 p-12">
        {/* Headlines */}
        <div>
          <h3 className="text-muted-foreground mb-6 font-mono text-xs tracking-widest uppercase">
            Headlines
          </h3>
          <div className="space-y-8">
            <p
              className="text-6xl leading-tight"
              style={getTypographyStyle(60)}
            >
              The quick brown fox jumps over the lazy dog.
            </p>
            <p
              className="text-5xl leading-tight"
              style={getTypographyStyle(48)}
            >
              Typography is the craft of endowing human language with a durable
              visual form.
            </p>
          </div>
        </div>

        {/* Paragraph Body */}
        <div>
          <h3 className="text-muted-foreground mb-6 font-mono text-xs tracking-widest uppercase">
            Paragraph Body
          </h3>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <p
                className="text-lg leading-relaxed"
                style={getTypographyStyle(18)}
              >
                In a professional design environment, the choice of typeface is
                more than just an aesthetic decision; it's a functional one. A
                font must balance readability, character, and technical
                performance across various digital and physical mediums.
              </p>
            </div>
            <div className="space-y-4">
              <p
                className="text-lg leading-relaxed"
                style={getTypographyStyle(18)}
              >
                The details are not the details. They make the design.
                Typography is an art. Good typography is invisible. If you're
                noticing it, it's either very good or very bad, depending on the
                context of the work.
              </p>
            </div>
          </div>
        </div>

        {/* Character Set */}
        <div>
          <h3 className="text-muted-foreground mb-6 font-mono text-xs tracking-widest uppercase">
            Character Set
          </h3>
          <div className="grid grid-cols-8 gap-2 text-2xl sm:grid-cols-12">
            {characters.map((char, idx) => (
              <div
                key={idx}
                className="hover:bg-secondary border-border flex aspect-square cursor-default items-center justify-center rounded border"
                style={getTypographyStyle(24)}
              >
                {char}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
