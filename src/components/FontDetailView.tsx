import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, FolderOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import logo from "../../assets/logo.svg";

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

/** Weight class to human-readable name (OpenType usWeightClass). */
const WEIGHT_NAMES: Record<number, string> = {
  1: "Thin",
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi Bold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
};

/** Unambiguous label for a variant in the specimen viewer (avoids multiple "Regular"/"Italic"). */
function getVariantDisplayLabel(
  v: { full_name?: string; family?: string; subfamily?: string; weight?: number },
  family: string
): string {
  const full = (v.full_name ?? "").trim();
  const sub = (v.subfamily ?? "").trim();
  const fam = (family ?? "").trim();
  const weight = v.weight != null ? Number(v.weight) : NaN;

  if (full && fam && full !== sub) {
    const afterFamily = full.startsWith(fam)
      ? full.slice(fam.length).replace(/^[\s\-–—]+/, "").trim()
      : "";
    if (afterFamily && afterFamily.toLowerCase() !== sub.toLowerCase()) {
      return afterFamily;
    }
  }

  const weightName =
    !Number.isNaN(weight) && weight >= 1 && weight <= 900
      ? WEIGHT_NAMES[weight] ??
        (weight <= 150
          ? "Thin"
          : weight <= 250
            ? "Extra Light"
            : weight <= 350
              ? "Light"
              : weight <= 450
                ? "Regular"
                : weight <= 550
                  ? "Medium"
                  : weight <= 650
                    ? "Semi Bold"
                    : weight <= 750
                      ? "Bold"
                      : weight <= 850
                        ? "Extra Bold"
                        : "Black")
      : null;
  const isGeneric =
    /^(Regular|Normal|Italic|Oblique|Bold|Bold Italic)$/i.test(sub);

  if (isGeneric && weightName && weightName !== sub) {
    return `${sub} (${weightName})`;
  }
  return sub || "Style";
}

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

const DETAIL_TABS = [
  { id: "specimen" as const, label: "Specimen" },
  { id: "glyphs" as const, label: "Glyphs" },
  { id: "ligatures" as const, label: "Ligatures" },
  { id: "ot" as const, label: "OT" },
  { id: "waterfall" as const, label: "Waterfall" },
  { id: "info" as const, label: "Info" },
];

export function FontDetailView({ font, onBack }: FontDetailViewProps) {
  const [specimenText, setSpecimenText] = useState("Refinement");
  const [activeTab, setActiveTab] = useState<
    "specimen" | "glyphs" | "ligatures" | "ot" | "waterfall" | "info"
  >("specimen");
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
            priorityTerms.some((term) => v.subfamily.includes(term))
          );
          const nonItalic = allVariants.find(
            (v: any) => !v.subfamily.includes("Italic")
          );

          setSelectedVariant(bestVariant || nonItalic || allVariants[0]);
        }
      } else {
        // Fallback if API not available
        setVariants([font]);
        setSelectedVariant(font);
      }
    };
    loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (!currentFont.metadata_json)
        return { supportedFeatures: new Set<string>(), supportedChars: [] };
      const metadata = JSON.parse(currentFont.metadata_json);
      return {
        supportedFeatures: new Set<string>(metadata.features || []),
        supportedChars: (metadata.characterSet as number[]) || [],
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
      .filter((c) => !((c >= 0 && c <= 31) || (c >= 127 && c <= 159)))
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
  const getTypographyStyle = (
    baseFontSize?: number,
    settings?: { featureSettings?: string }
  ) => ({
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
    <div className="bg-background flex h-screen flex-col overflow-hidden">
      <style>{fontFaceStyle}</style>

      {/* Header */}
      <header className="bg-background flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Evergarden" className="h-8 w-auto" />
            <div className="bg-border mx-2 h-4 w-px"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <nav className="flex items-center gap-1">
            {DETAIL_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={cn(
                  "mt-4 px-3 pb-4 text-sm font-medium",
                  activeTab === tab.id
                    ? "border-foreground text-foreground border-b-2"
                    : "text-muted-foreground hover:text-foreground/80"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
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
                <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                  Selected Family
                </span>
                <h1 className="mb-8 text-3xl font-semibold">{font.family}</h1>
              </div>
              <div
                className="text-foreground focus:border-muted-foreground min-h-[1.2em] text-[120px] leading-tight wrap-break-word outline-none focus:border-b focus:border-dashed"
                contentEditable
                suppressContentEditableWarning
                style={getTypographyStyle()}
                onInput={(e) =>
                  setSpecimenText(e.currentTarget.textContent || "")
                }
                onBlur={(e) =>
                  setSpecimenText(e.currentTarget.textContent || "")
                }
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

          <section
            className={cn(
              "mx-auto max-w-5xl space-y-20 p-12",
              activeTab !== "specimen" && "hidden"
            )}
            aria-hidden={activeTab !== "specimen"}
          >
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
                    Typography is the craft of endowing human language with a
                    durable visual form.
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
                      In a professional design environment, the choice of
                      typeface is more than just an aesthetic decision; it's a
                      functional one. A font must balance readability,
                      character, and technical performance across various
                      digital and physical mediums.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p
                      className="text-lg leading-relaxed"
                      style={getTypographyStyle(18)}
                    >
                      The details are not the details. They make the design.
                      Typography is an art. Good typography is invisible. If
                      you're noticing it, it's either very good or very bad,
                      depending on the context of the work.
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

          <section
            className={cn(
              "mx-auto max-w-5xl p-12",
              activeTab !== "glyphs" && "hidden"
            )}
            aria-hidden={activeTab !== "glyphs"}
          >
              <div className="text-muted-foreground mb-4 flex items-center justify-between text-sm">
                <span>
                  Showing {glyphsToRender.length} of{" "}
                  {sortedChars.length > 0 ? sortedChars.length : "default"}{" "}
                  glyphs
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

          <section
            className={cn(
              "mx-auto max-w-5xl space-y-12 p-12",
              activeTab !== "ligatures" && "hidden"
            )}
            aria-hidden={activeTab !== "ligatures"}
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
                      <p className="text-muted-foreground mb-2 text-xs">
                        Disabled
                      </p>
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

          <section
            className={cn(
              "mx-auto max-w-5xl space-y-10 p-12",
              activeTab !== "ot" && "hidden"
            )}
            aria-hidden={activeTab !== "ot"}
          >
              <div className="border-b pb-8">
                <h2 className="mb-2 text-2xl font-semibold">
                  OpenType Features
                </h2>
                <p className="text-muted-foreground">
                  This font supports {supportedFeatures.size} OpenType features.
                </p>
              </div>

              {Array.from(supportedFeatures)
                .sort()
                .map((featureTag) => {
                  const sample =
                    FEATURE_SAMPLES[featureTag] ||
                    "The quick brown fox jumps over the lazy dog 0123456789";
                  const featureInfo = OPENTYPE_FEATURES.find(
                    (f) => f.tag === featureTag
                  );

                  return (
                    <div key={featureTag} className="space-y-4">
                      <div className="flex items-baseline gap-4">
                        <h3 className="text-primary font-mono text-lg font-bold">
                          {featureTag}
                        </h3>
                        <span className="text-muted-foreground text-sm">
                          {featureInfo?.label || "Unknown Feature"}
                        </span>
                      </div>

                      <div className="bg-secondary/20 grid grid-cols-1 gap-4 rounded-lg p-6 md:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground mb-2 text-[10px] tracking-wider uppercase">
                            Off
                          </p>
                          <p
                            className="text-3xl"
                            style={getTypographyStyle(32, {
                              featureSettings: `"${featureTag}" 0`,
                            })}
                          >
                            {sample}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-2 text-[10px] tracking-wider uppercase">
                            On
                          </p>
                          <p
                            className="text-3xl"
                            style={getTypographyStyle(32, {
                              featureSettings: `"${featureTag}" 1`,
                            })}
                          >
                            {sample}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {supportedFeatures.size === 0 && (
                <div className="text-muted-foreground py-12 text-center">
                  No OpenType features detected.
                </div>
              )}
          </section>

          <section
            className={cn(
              "mx-auto max-w-5xl p-8",
              activeTab !== "waterfall" && "hidden"
            )}
            aria-hidden={activeTab !== "waterfall"}
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
                      {specimenText ||
                        "The quick brown fox jumps over the lazy dog"}
                    </p>
                  </div>
                ))}
              </div>
          </section>

          <section
            className={cn(
              "mx-auto max-w-5xl p-12",
              activeTab !== "info" && "hidden"
            )}
            aria-hidden={activeTab !== "info"}
          >
              <div className="space-y-8">
                <div>
                  <h3 className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
                    Font Information
                  </h3>
                  <div className="bg-card rounded-lg border p-6">
                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          Family Name
                        </dt>
                        <dd className="mt-1 text-sm font-medium">
                          {currentFont.family}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          Subfamily
                        </dt>
                        <dd className="mt-1 text-sm font-medium">
                          {currentFont.subfamily}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          Full Name
                        </dt>
                        <dd className="mt-1 text-sm">
                          {currentFont.full_name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          PostScript Name
                        </dt>
                        <dd className="mt-1 text-sm">
                          {currentFont.postscript_name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          Version
                        </dt>
                        <dd className="mt-1 text-sm">
                          {currentFont.version || "Unknown"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          Copyright
                        </dt>
                        <dd className="mt-1 text-sm">
                          {currentFont.copyright || "None"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          File Path
                        </dt>
                        <dd className="mt-1 text-sm break-all">
                          {currentFont.file_path}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          File Format
                        </dt>
                        <dd className="mt-1 text-sm uppercase">
                          {currentFont.file_path.split(".").pop()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          Category
                        </dt>
                        <dd className="mt-1 text-sm">
                          {currentFont.category || "Unknown"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          Subcategory
                        </dt>
                        <dd className="mt-1 text-sm">
                          {currentFont.subcategory || "Unknown"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          Supported Features
                        </dt>
                        <dd className="mt-1 text-sm">
                          {supportedFeatures.size} features
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground font-mono text-xs">
                          Variants
                        </dt>
                        <dd className="mt-1 text-sm">
                          {variants.length} styles
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="bg-card flex w-80 shrink-0 flex-col overflow-y-auto border-l">
          <div className="space-y-6 p-6">
            {/* Font Variants */}
            {variants.length > 1 && (
              <div>
                <h3 className="text-muted-foreground mb-4 text-[10px] font-bold tracking-[0.2em] uppercase">
                  Weight & Style
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((v) => (
                    <Button
                      key={v.id}
                      variant={
                        selectedVariant?.id === v.id ? "secondary" : "outline"
                      }
                      className={cn(
                        "h-auto justify-start px-3 py-2 text-xs",
                        selectedVariant?.id === v.id && "border-primary"
                      )}
                      onClick={() => setSelectedVariant(v)}
                    >
                      <div className="flex w-full flex-col items-start gap-1 overflow-hidden">
                        <span className="w-full truncate font-medium" title={v.full_name || v.subfamily}>
                          {getVariantDisplayLabel(v, font.family)}
                        </span>
                        {/* Preview of the style */}
                        <span
                          className="w-full truncate text-lg opacity-70"
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
                {variants.map((v) => (
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
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-muted-foreground text-[10px] font-bold tracking-[0.2em] uppercase">
                  Typography
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() =>
                    setTypography({
                      fontSize: 72,
                      lineHeight: 1.2,
                      letterSpacing: 0,
                      align: "left",
                    })
                  }
                  title="Reset Typography"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Size</label>
                    <span className="text-muted-foreground font-mono text-xs">
                      {typography.fontSize}px
                    </span>
                  </div>
                  <Slider
                    value={[typography.fontSize]}
                    onValueChange={(val) =>
                      setTypography((prev) => ({ ...prev, fontSize: val[0] }))
                    }
                    min={12}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Line Height</label>
                    <span className="text-muted-foreground font-mono text-xs">
                      {typography.lineHeight}
                    </span>
                  </div>
                  <Slider
                    value={[typography.lineHeight * 100]}
                    onValueChange={(val) =>
                      setTypography((prev) => ({
                        ...prev,
                        lineHeight: val[0] / 100,
                      }))
                    }
                    min={80}
                    max={250}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">
                      Letter Spacing
                    </label>
                    <span className="text-muted-foreground font-mono text-xs">
                      {typography.letterSpacing}px
                    </span>
                  </div>
                  <Slider
                    value={[typography.letterSpacing]}
                    onValueChange={(val) =>
                      setTypography((prev) => ({
                        ...prev,
                        letterSpacing: val[0],
                      }))
                    }
                    min={-5}
                    max={20}
                    step={0.5}
                  />
                </div>
              </div>
            </div>

            {/* Features Controls */}
            <div>
              <h3 className="text-muted-foreground mb-4 text-[10px] font-bold tracking-[0.2em] uppercase">
                OpenType Features
              </h3>
              <div className="space-y-6">
                {Object.entries(featuresByCategory).map(
                  ([category, categoryFeatures]) => {
                    // Filter to only show features supported by this font
                    const availableFeatures = categoryFeatures.filter((f) =>
                      supportedFeatures.has(f.tag)
                    );

                    if (availableFeatures.length === 0) return null;

                    return (
                      <div key={category}>
                        <h4 className="text-muted-foreground/70 mb-2 text-[9px] font-semibold tracking-wider uppercase">
                          {category}
                        </h4>
                        <div className="space-y-2">
                          {availableFeatures.map(({ tag, label }) => (
                            <label
                              key={tag}
                              className="group flex cursor-pointer items-center justify-between"
                            >
                              <span className="text-xs font-medium">
                                {label}
                              </span>
                              <Switch
                                checked={features[tag] || false}
                                onCheckedChange={(checked) =>
                                  setFeatures((prev) => ({
                                    ...prev,
                                    [tag]: checked,
                                  }))
                                }
                                className="origin-right scale-75"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}

                {/* Show message if no features are available */}
                {Object.values(featuresByCategory).every(
                  (cat) =>
                    cat.filter((f) => supportedFeatures.has(f.tag)).length === 0
                ) && (
                  <div className="text-muted-foreground rounded border border-dashed p-4 py-2 text-center text-xs">
                    No OpenType features detected for this font.
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto border-t pt-6">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  if (window.api && window.api.revealInFolder) {
                    window.api.revealInFolder(currentFont.file_path);
                  }
                }}
              >
                <FolderOpen className="h-4 w-4" />
                Reveal in Folder
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
