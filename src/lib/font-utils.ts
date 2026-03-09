export function toFontUrl(filePath: string): string {
  const forward = filePath.replace(/\\/g, "/");
  const encoded = forward.split("/").map(encodeURIComponent).join("/");
  return `font://local/${encoded}`;
}

export const OPENTYPE_FEATURES = [
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

export const WEIGHT_NAMES: Record<number, string> = {
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

export function getVariantDisplayLabel(
  v: {
    full_name?: string;
    family?: string;
    subfamily?: string;
    weight?: number;
  },
  family: string
): string {
  const full = (v.full_name ?? "").trim();
  const sub = (v.subfamily ?? "").trim();
  const fam = (family ?? "").trim();
  const weight = v.weight != null ? Number(v.weight) : NaN;

  if (full && fam && full !== sub) {
    const afterFamily = full.startsWith(fam)
      ? full
          .slice(fam.length)
          .replace(/^[\s\-–—]+/, "")
          .trim()
      : "";
    if (afterFamily && afterFamily.toLowerCase() !== sub.toLowerCase()) {
      return afterFamily;
    }
  }

  const weightName =
    !Number.isNaN(weight) && weight >= 1 && weight <= 900
      ? (WEIGHT_NAMES[weight] ??
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
                        : "Black"))
      : null;
  const isGeneric = /^(Regular|Normal|Italic|Oblique|Bold|Bold Italic)$/i.test(
    sub
  );

  if (isGeneric && weightName && weightName !== sub) {
    return `${sub} (${weightName})`;
  }
  return sub || "Style";
}

export const FEATURE_SAMPLES: Record<string, string> = {
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
