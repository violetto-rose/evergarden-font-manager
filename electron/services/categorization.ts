// Font categorization: heuristic fallback for all fonts (paid, demo, unknown).
// Bridge is for reference only; scan always uses this so non–Google Fonts get classified.

function hasAny(str: string, terms: string[]): boolean {
  const s = str.toLowerCase();
  return terms.some((t) => s.includes(t.toLowerCase()));
}

export function categorizeFontFamily(
  familyName: string,
  subfamily: string,
  monospace: number
): { category: string; subcategory: string } {
  const family = familyName.toLowerCase();
  const sub = subfamily.toLowerCase();
  const combined = `${family} ${sub}`;

  // Monospace
  if (
    monospace === 1 ||
    hasAny(combined, [
      "mono",
      "code",
      "console",
      "terminal",
      "programming",
      "pixel",
    ])
  ) {
    return { category: "Monospace", subcategory: "Code" };
  }

  // Cursive / Handwriting (check before Display so "Script" display fonts can still match)
  const cursiveTerms = [
    "script",
    "cursive",
    "brush",
    "handwriting",
    "hand written",
    "handwritten",
    "calligraph",
    "signature",
    "copperplate",
    "spencerian",
    "formal script",
    "informal script",
    "script pro",
    "ink",
    "pen script",
    "brush script",
    "casual",
    "chalk",
    "comic",
    "kaufmann",
    "palace",
    "freestyle",
    "lucida handwriting",
    "segoe script",
    "snell roundhand",
    "viner",
    "mistral",
    "bickham",
    "flourish",
    "swash",
  ];
  if (hasAny(combined, cursiveTerms)) {
    // Prefer Handwriting subcategory for casual/handwritten terms
    const handwritingTerms = [
      "handwriting",
      "hand written",
      "handwritten",
      "brush",
      "casual",
      "chalk",
      "comic",
      "freestyle",
    ];
    const subcategory = hasAny(combined, handwritingTerms)
      ? "Handwriting"
      : "Script";
    return { category: "Cursive", subcategory };
  }

  // Display: Blackletter, Stencil, Decorative (check before generic serif/sans)
  const blackletterTerms = [
    "blackletter",
    "black letter",
    "fraktur",
    "textura",
    "uncial",
    "old english",
    "oldenglish",
    "schwabacher",
    "rotunda",
    "lombardic",
    "gotisch",
    "gothic type",
  ];
  if (hasAny(combined, blackletterTerms)) {
    return { category: "Display", subcategory: "Blackletter" };
  }

  const stencilTerms = ["stencil", "stencils", "stencil std"];
  if (hasAny(combined, stencilTerms)) {
    return { category: "Display", subcategory: "Stencil" };
  }

  const displayTerms = [
    "display",
    "decorative",
    "ornament",
    "poster",
    "fatface",
    "inline",
    "outline",
    "shadow",
    "retro",
    "vintage",
    "western",
    "woodblock",
    "banner",
    "impact",
  ];
  if (hasAny(combined, displayTerms)) {
    return { category: "Display", subcategory: "Decorative" };
  }

  // Serif
  if (family.includes("serif") && !family.includes("sans")) {
    if (family.includes("slab")) {
      return { category: "Serif", subcategory: "Slab Serif" };
    }
    if (
      hasAny(combined, ["old", "garamond", "caslon", "baskerville", "jenson"])
    ) {
      return { category: "Serif", subcategory: "Old Style" };
    }
    if (hasAny(combined, ["didot", "bodoni", "modern"])) {
      return { category: "Serif", subcategory: "Didone" };
    }
    return { category: "Serif", subcategory: "Transitional" };
  }

  // Sans Serif
  if (
    hasAny(combined, [
      "sans",
      "gothic",
      "grotesque",
      "helvetica",
      "arial",
      "futura",
      "univers",
      "franklin",
      "gill",
      "optima",
      "akzidenz",
      "din",
      "meta",
      "thesis",
    ])
  ) {
    if (
      hasAny(combined, ["geometric", "futura", "avant", "eurostile", "century gothic"])
    ) {
      return { category: "Sans Serif", subcategory: "Geometric" };
    }
    if (
      hasAny(combined, ["humanist", "gill", "optima", "frutiger", "verdana", "tahoma"])
    ) {
      return { category: "Sans Serif", subcategory: "Humanist" };
    }
    if (
      hasAny(combined, ["grotesque", "akzidenz", "franklin", "trade gothic"])
    ) {
      return { category: "Sans Serif", subcategory: "Grotesque" };
    }
    return { category: "Sans Serif", subcategory: "Neo-Grotesque" };
  }

  // Default: Neo-Grotesque for unclassified
  return { category: "Sans Serif", subcategory: "Neo-Grotesque" };
}
