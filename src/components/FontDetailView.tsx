import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, FolderOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FontDetailViewProps {
  font: any;
  onBack: () => void;
}

const OPENTYPE_FEATURES = [
  { tag: "liga", label: "Standard Ligatures", category: "Ligatures" },
  { tag: "dlig", label: "Discretionary Ligatures", category: "Ligatures" },
  { tag: "hlig", label: "Historical Ligatures", category: "Ligatures" },
  { tag: "calt", label: "Contextual Alternates", category: "Ligatures" },
  { tag: "swsh", label: "Swashes", category: "Alternates" },
  { tag: "salt", label: "Stylistic Alternates", category: "Alternates" },
  { tag: "aalt", label: "Access All Alternates", category: "Alternates" },
  { tag: "lnum", label: "Lining Figures", category: "Numbers" },
  { tag: "onum", label: "Oldstyle Figures", category: "Numbers" },
  { tag: "pnum", label: "Proportional Figures", category: "Numbers" },
  { tag: "tnum", label: "Tabular Figures", category: "Numbers" },
  { tag: "frac", label: "Fractions", category: "Numbers" },
  { tag: "ordn", label: "Ordinals", category: "Numbers" },
  { tag: "zero", label: "Slashed Zero", category: "Numbers" },
  { tag: "sups", label: "Superscript", category: "Numbers" },
  { tag: "subs", label: "Subscript", category: "Numbers" },
  { tag: "sinf", label: "Scientific Inferiors", category: "Numbers" },
  { tag: "ss01", label: "Stylistic Set 1", category: "Stylistic Sets" },
  { tag: "ss02", label: "Stylistic Set 2", category: "Stylistic Sets" },
  { tag: "ss03", label: "Stylistic Set 3", category: "Stylistic Sets" },
  { tag: "ss04", label: "Stylistic Set 4", category: "Stylistic Sets" },
  { tag: "ss05", label: "Stylistic Set 5", category: "Stylistic Sets" },
  { tag: "ss06", label: "Stylistic Set 6", category: "Stylistic Sets" },
  { tag: "ss07", label: "Stylistic Set 7", category: "Stylistic Sets" },
  { tag: "ss08", label: "Stylistic Set 8", category: "Stylistic Sets" },
  { tag: "kern", label: "Kerning", category: "Spacing" },
  { tag: "cpsp", label: "Capital Spacing", category: "Spacing" },
  { tag: "mark", label: "Mark Positioning", category: "Spacing" },
  { tag: "mkmk", label: "Mark to Mark Positioning", category: "Spacing" },
  { tag: "ccmp", label: "Glyph Composition", category: "Technical" },
  { tag: "locl", label: "Localized Forms", category: "Technical" },
  { tag: "case", label: "Case-Sensitive Forms", category: "Technical" },
  { tag: "titl", label: "Titling", category: "Technical" },
];

const FEATURE_SAMPLES: Record<string, string> = {
  liga: "fi fl ffi ffl fb ffb fj ffj",
  dlig: "st ct Th",
  smcp: "Small Caps Test",
  c2sc: "CAPS TO SMALL CAPS",
  lnum: "0123456789",
  onum: "0123456789",
  tnum: "111 000",
  pnum: "111 000",
  frac: "1/2 3/4 8/9",
  ordn: "1st 2nd 3rd",
  zero: "0 O 0 O",
  ss01: "The quick brown fox jumps over the lazy dog",
  ss02: "The quick brown fox jumps over the lazy dog",
  aalt: "(( )) [[ ]] {{ }} - - -- --",
  case: "(( )) [[ ]] {{ }} - - -- -- @ @",
  calt: "-> <- - > =>",
};

export function FontDetailView({ font, onBack }: FontDetailViewProps) {
  const [specimenText, setSpecimenText] = useState("Refinement");
  const [activeTab, setActiveTab] = useState<"specimen" | "glyphs" | "ligatures" | "ot" | "waterfall" | "info">("specimen");
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Load all variants for this font family
  useEffect(() => {
    const loadVariants = async () => {
      if (window.api && window.api.getFontVariants) {
        const allVariants = await window.api.getFontVariants(font.family);
        setVariants(allVariants);

        if (allVariants.length > 0) {
          // Priority: named "Regular"/"Normal"/"Book"/"Roman", then any non-Italic, then first one
          const priorityTerms = ["Regular", "Normal", "Book", "Roman"];
          const bestVariant = allVariants.find((v: any) =>
            priorityTerms.some(term => v.subfamily.includes(term))
          );
          const nonItalic = allVariants.find((v: any) => !v.subfamily.includes("Italic"));

          setSelectedVariant(bestVariant || nonItalic || allVariants[0]);
        }
      } else {
        // Fallback if API not available
        setVariants([font]);
        setSelectedVariant(font);
      }
    };
    loadVariants();
  }, [font.family]);

  // Use selected variant or fallback to prop font
  const currentFont = selectedVariant || font;

  // Typography state
  const [typography, setTypography] = useState({
    fontSize: 72,
    lineHeight: 1.2,
    letterSpacing: 0,
    align: "left" as "left" | "center" | "right",
  });

  // Features state
  const [features, setFeatures] = useState<Record<string, boolean>>({
    liga: true,
    kern: true,
  });

  // Extract features and chars from metadata
  const { supportedFeatures, supportedChars } = useMemo(() => {
    try {
      if (!currentFont.metadata_json) return { supportedFeatures: new Set<string>(), supportedChars: [] };
      const metadata = JSON.parse(currentFont.metadata_json);
      return {
        supportedFeatures: new Set<string>(metadata.features || []),
        supportedChars: (metadata.characterSet as number[]) || []
      };
    } catch (e) {
      return { supportedFeatures: new Set<string>(), supportedChars: [] };
    }
  }, [currentFont]);

  // Pagination for glyphs
  const [glyphLimit, setGlyphLimit] = useState(200);

  // Sort supported chars and filter control codes
  const sortedChars = useMemo(() => {
    return [...supportedChars]
      .filter(c => !((c >= 0 && c <= 31) || (c >= 127 && c <= 159)))
      .sort((a, b) => a - b);
  }, [supportedChars]);

  // Create glyph display array
  const glyphsToRender = useMemo(() => {
    if (sortedChars.length > 0) {
      return sortedChars.slice(0, glyphLimit);
    }
    // Fallback to ASCII 33-126 if no charset info (or before rescan)
    return Array.from({ length: 94 }).map((_, i) => 33 + i);
  }, [sortedChars, glyphLimit]);

  const fontId = `font-detail-${currentFont.id}`;
  const fontFaceStyle = `
    @font-face {
      font-family: '${fontId}';
      src: url('file://${currentFont.file_path.replace(/\\/g, "/")}');
      font-display: swap;
    }
  `;

  const characters = "ABCDEFGHIJKLabcd0123&$?!".split("");

  // Generate font-feature-settings CSS from features state
  const featureSettings = useMemo(() => {
    return Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => `"${key}" 1`)
      .join(", ");
  }, [features]);

  // Generate style object with typography settings
  const getTypographyStyle = (baseFontSize?: number, settings?: { featureSettings?: string }) => ({
    fontFamily: `'${fontId}', sans-serif`,
    fontFeatureSettings: settings?.featureSettings ?? featureSettings,
    fontSize: baseFontSize || typography.fontSize,
    lineHeight: typography.lineHeight,
    letterSpacing: `${typography.letterSpacing}px`,
  });

  // Group features by category
  const featuresByCategory = useMemo(() => {
    const grouped: Record<string, typeof OPENTYPE_FEATURES> = {};
    OPENTYPE_FEATURES.forEach((feature) => {
      if (!grouped[feature.category]) {
        grouped[feature.category] = [];
      }
      grouped[feature.category].push(feature);
    });
    return grouped;
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <style>{fontFaceStyle}</style>

      {/* Header */}
      <header className="border-b bg-background flex h-14 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter">Evergarden</span>
            <div className="bg-border mx-2 h-4 w-px"></div>
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <nav className="flex items-center gap-1">
            {["Specimen", "Glyphs", "Ligatures", "OT", "Waterfall", "Info"].map((tab) => (
              <button
                key={tab}
                className={cn(
                  "pb-4 mt-4 px-3 text-sm font-medium",
                  activeTab === tab.toLowerCase()
                    ? "border-b-2 border-foreground text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setActiveTab(tab.toLowerCase() as any)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="bg-background flex-1 overflow-y-auto">

          {/* Hero Specimen (Visible only on Specimen tab, or all? Usually only Specimen or Waterfall) */}
          {/* The user request implies new TABS. So Hero Specimen is likely part of 'Specimen' tab only or shared logic?
              In existing code, Hero was ALWAYS visible above tabs content.
              But new tabs (Waterfall) need full height.
              Let's move Hero INSIDE Specimen tab to be cleaner, or keep it if it fits.
              The existing code had Hero separate from tabs content.
              Screenshot shows tabs at TOP, and content below.
              If I keep Hero at top, Waterfall will push it down.
              I'll move Hero INSIDE Specimen tab for better layout of other tabs.
          */}

          {/* Hero Section (Visible on all tabs) */}
          <section className="border-b p-12">
            <div className="mx-auto max-w-5xl">
              <div className="mb-2">
                <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Selected Family
                </span>
                <h1 className="mb-8 text-3xl font-semibold">{font.family}</h1>
              </div>
              <div
                className="text-[120px] leading-tight wrap-break-word text-foreground outline-none focus:border-b focus:border-dashed focus:border-muted-foreground min-h-[1.2em]"
                contentEditable
                suppressContentEditableWarning
                style={getTypographyStyle()}
                onInput={(e) => setSpecimenText(e.currentTarget.textContent || "")}
                onBlur={(e) => setSpecimenText(e.currentTarget.textContent || "")}
              >
                {specimenText}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Click to edit specimen text</span>
                <span>{typography.fontSize}px / {typography.lineHeight} Leading</span>
              </div>
            </div>
          </section>

          {activeTab === "specimen" && (

            <section className="mx-auto max-w-5xl space-y-20 p-12">
              {/* Headlines */}
              <div>
                <h3 className="mb-6 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Headlines
                </h3>
                <div className="space-y-8">
                  <p className="text-6xl leading-tight" style={getTypographyStyle(60)}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p className="text-5xl leading-tight" style={getTypographyStyle(48)}>
                    Typography is the craft of endowing human language with a durable visual form.
                  </p>
                </div>
              </div>

              {/* Paragraph Body */}
              <div>
                <h3 className="mb-6 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Paragraph Body
                </h3>
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed" style={getTypographyStyle(18)}>
                      In a professional design environment, the choice of typeface is more than just an aesthetic decision; it's a functional one. A font must balance readability, character, and technical performance across various digital and physical mediums.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed" style={getTypographyStyle(18)}>
                      The details are not the details. They make the design. Typography is an art. Good typography is invisible. If you're noticing it, it's either very good or very bad, depending on the context of the work.
                    </p>
                  </div>
                </div>
              </div>

              {/* Character Set */}
              <div>
                <h3 className="mb-6 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Character Set
                </h3>
                <div className="grid grid-cols-8 gap-2 text-2xl sm:grid-cols-12">
                  {characters.map((char, idx) => (
                    <div
                      key={idx}
                      className="border hover:bg-secondary flex aspect-square cursor-default items-center justify-center rounded border-border"
                      style={getTypographyStyle(24)}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "glyphs" && (
            <section className="mx-auto max-w-5xl p-12">
              <div className="mb-4 text-sm text-muted-foreground flex justify-between items-center">
                <span>Showing {glyphsToRender.length} of {sortedChars.length > 0 ? sortedChars.length : "default"} glyphs</span>
                {sortedChars.length === 0 && <span className="text-xs opacity-70">(Rescan library to verify full support)</span>}
              </div>

              <div className="grid grid-cols-8 gap-3 sm:grid-cols-12 md:grid-cols-16">
                {glyphsToRender.map((code) => (
                  <div
                    key={code}
                    className="border hover:bg-secondary flex aspect-square items-center justify-center rounded border-border text-2xl cursor-default"
                    style={getTypographyStyle(24)}
                    title={`U+${code.toString(16).toUpperCase().padStart(4, '0')}`}
                  >
                    {String.fromCodePoint(code)}
                  </div>
                ))}
              </div>

              {sortedChars.length > glyphLimit && (
                <div className="mt-8 text-center pb-8">
                  <Button onClick={() => setGlyphLimit(prev => prev + 200)} variant="outline">Load More Glyphs</Button>
                </div>
              )}
            </section>
          )}

          {activeTab === "ligatures" && (
            <section className="mx-auto max-w-5xl p-12 space-y-12">
              <div className="prose dark:prose-invert">
                <h2 className="text-2xl font-semibold mb-4">Ligatures</h2>
                <p className="text-muted-foreground">Common ligatures comparisons. The second line enables the <code>liga</code> feature.</p>
              </div>

              <div className="grid gap-8">
                <div className="border p-8 rounded-lg space-y-4">
                  <h3 className="font-mono text-xs uppercase text-muted-foreground">Standard Ligatures (fi, fl, ffi, ffl)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Disabled</p>
                      <p className="text-6xl" style={getTypographyStyle(64, { featureSettings: '"liga" 0' })}>
                        infinite flower office waffle
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Enabled (liga)</p>
                      <p className="text-6xl" style={getTypographyStyle(64, { featureSettings: '"liga" 1' })}>
                        infinite flower office waffle
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "ot" && (
            <section className="mx-auto max-w-5xl p-12 space-y-10">
              <div className="border-b pb-8">
                <h2 className="text-2xl font-semibold mb-2">OpenType Features</h2>
                <p className="text-muted-foreground">
                  This font supports {supportedFeatures.size} OpenType features.
                </p>
              </div>

              {Array.from(supportedFeatures).sort().map(featureTag => {
                const sample = FEATURE_SAMPLES[featureTag] || "The quick brown fox jumps over the lazy dog 0123456789";
                const featureInfo = OPENTYPE_FEATURES.find(f => f.tag === featureTag);

                return (
                  <div key={featureTag} className="space-y-4">
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-lg font-mono font-bold text-primary">{featureTag}</h3>
                      <span className="text-sm text-muted-foreground">{featureInfo?.label || "Unknown Feature"}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 p-6 rounded-lg">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Off</p>
                        <p className="text-3xl" style={getTypographyStyle(32, { featureSettings: `"${featureTag}" 0` })}>
                          {sample}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">On</p>
                        <p className="text-3xl" style={getTypographyStyle(32, { featureSettings: `"${featureTag}" 1` })}>
                          {sample}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {supportedFeatures.size === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No OpenType features detected.
                </div>
              )}
            </section>
          )}

          {activeTab === "waterfall" && (
            <section className="mx-auto max-w-5xl p-8">
              <div className="space-y-8 overflow-hidden">
                {[96, 72, 60, 48, 36, 24, 18, 14, 12].map(size => (
                  <div key={size} className="flex gap-4 items-baseline group">
                    <span className="w-12 text-[10px] text-muted-foreground shrink-0 select-none group-hover:text-primary">{size}px</span>
                    <p style={getTypographyStyle(size)} className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {specimenText || "The quick brown fox jumps over the lazy dog"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "info" && (
            <section className="mx-auto max-w-5xl p-12">
              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    Font Information
                  </h3>
                  <div className="rounded-lg border bg-card p-6">
                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">Family Name</dt>
                        <dd className="mt-1 text-sm font-medium">{currentFont.family}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">Subfamily</dt>
                        <dd className="mt-1 text-sm font-medium">{currentFont.subfamily}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">Full Name</dt>
                        <dd className="mt-1 text-sm">{currentFont.full_name}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">PostScript Name</dt>
                        <dd className="mt-1 text-sm">{currentFont.postscript_name}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">Version</dt>
                        <dd className="mt-1 text-sm">{currentFont.version || "Unknown"}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">Copyright</dt>
                        <dd className="mt-1 text-sm">{currentFont.copyright || "None"}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">File Path</dt>
                        <dd className="mt-1 text-xs break-all">{currentFont.file_path}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">File Format</dt>
                        <dd className="mt-1 text-sm uppercase">{currentFont.file_path.split('.').pop()}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">Category</dt>
                        <dd className="mt-1 text-sm">{currentFont.category || "Unknown"}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">Subcategory</dt>
                        <dd className="mt-1 text-sm">{currentFont.subcategory || "Unknown"}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">Supported Features</dt>
                        <dd className="mt-1 text-sm">{supportedFeatures.size} features</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-xs text-muted-foreground">Variants</dt>
                        <dd className="mt-1 text-sm">{variants.length} styles</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Sidebar */}
        <aside className="border-l bg-card flex w-80 shrink-0 flex-col overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Font Variants */}
            {variants.length > 1 && (
              <div>
                <h3 className="mb-4 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  Weight & Style
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((v) => (
                    <Button
                      key={v.id}
                      variant={selectedVariant?.id === v.id ? "secondary" : "outline"}
                      className={cn(
                        "justify-start h-auto py-2 px-3 text-xs",
                        selectedVariant?.id === v.id && "border-primary"
                      )}
                      onClick={() => setSelectedVariant(v)}
                    >
                      <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
                        <span className="font-medium truncate w-full">{v.subfamily}</span>
                        {/* Preview of the style */}
                        <span
                          className="text-lg w-full truncate opacity-70"
                          style={{
                            fontFamily: `'font-detail-${v.id}'`,
                          }}
                        >
                          Aa
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
                {/* Hidden font-faces for variants to show preview used above */}
                {variants.map(v => (
                  <style key={v.id}>{`
                     @font-face {
                       font-family: 'font-detail-${v.id}';
                       src: url('file://${v.file_path.replace(/\\/g, "/")}');
                       font-display: swap;
                     }
                   `}</style>
                ))}
              </div>
            )}

            {/* Typography Controls */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  Typography
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => setTypography({
                    fontSize: 72,
                    lineHeight: 1.2,
                    letterSpacing: 0,
                    align: "left"
                  })}
                  title="Reset Typography"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Size</label>
                    <span className="font-mono text-xs text-muted-foreground">{typography.fontSize}px</span>
                  </div>
                  <Slider
                    value={[typography.fontSize]}
                    onValueChange={(val) => setTypography(prev => ({ ...prev, fontSize: val[0] }))}
                    min={12}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Line Height</label>
                    <span className="font-mono text-xs text-muted-foreground">{typography.lineHeight}</span>
                  </div>
                  <Slider
                    value={[typography.lineHeight * 100]}
                    onValueChange={(val) => setTypography(prev => ({ ...prev, lineHeight: val[0] / 100 }))}
                    min={80}
                    max={250}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Letter Spacing</label>
                    <span className="font-mono text-xs text-muted-foreground">{typography.letterSpacing}px</span>
                  </div>
                  <Slider
                    value={[typography.letterSpacing]}
                    onValueChange={(val) => setTypography(prev => ({ ...prev, letterSpacing: val[0] }))}
                    min={-5}
                    max={20}
                    step={0.5}
                  />
                </div>
              </div>
            </div>

            {/* Features Controls */}
            <div>
              <h3 className="mb-4 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                OpenType Features
              </h3>
              <div className="space-y-6">
                {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => {
                  // Filter to only show features supported by this font
                  const availableFeatures = categoryFeatures.filter(f => supportedFeatures.has(f.tag));

                  if (availableFeatures.length === 0) return null;

                  return (
                    <div key={category}>
                      <h4 className="mb-2 text-[9px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {availableFeatures.map(({ tag, label }) => (
                          <label key={tag} className="group flex cursor-pointer items-center justify-between">
                            <span className="text-xs font-medium">{label}</span>
                            <Switch
                              checked={features[tag] || false}
                              onCheckedChange={(checked) =>
                                setFeatures(prev => ({ ...prev, [tag]: checked }))
                              }
                              className="scale-75 origin-right"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Show message if no features are available */}
                {Object.values(featuresByCategory).every(cat =>
                  cat.filter(f => supportedFeatures.has(f.tag)).length === 0
                ) && (
                    <div className="text-xs text-muted-foreground py-2 text-center border border-dashed rounded p-4">
                      No OpenType features detected for this font.
                    </div>
                  )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t mt-auto">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  if (window.api && window.api.revealInFolder) {
                    window.api.revealInFolder(currentFont.file_path);
                  }
                }}
              >
                <FolderOpen className="w-4 h-4" />
                Reveal in Folder
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div >
  );
}
