// Font categorization logic based on metadata
export function categorizeFontFamily(
  familyName: string,
  subfamily: string,
  monospace: number
): { category: string; subcategory: string } {
  const family = familyName.toLowerCase();
  const sub = subfamily.toLowerCase();

  // Monospace check
  if (
    monospace === 1 ||
    family.includes("mono") ||
    family.includes("code") ||
    family.includes("console")
  ) {
    return { category: "Monospace", subcategory: "Code" };
  }

  // Cursive/Script
  if (
    family.includes("script") ||
    family.includes("cursive") ||
    family.includes("brush") ||
    family.includes("handwriting") ||
    family.includes("calligraph")
  ) {
    return { category: "Cursive", subcategory: "Script" };
  }

  // Display fonts
  if (
    family.includes("display") ||
    family.includes("decorative") ||
    family.includes("ornament") ||
    family.includes("stencil") ||
    family.includes("blackletter")
  ) {
    return { category: "Display", subcategory: "Decorative" };
  }

  // Serif detection
  if (family.includes("serif") && !family.includes("sans")) {
    // Sub-categorize serifs
    if (family.includes("slab")) {
      return { category: "Serif", subcategory: "Slab Serif" };
    } else if (
      family.includes("old") ||
      family.includes("garamond") ||
      family.includes("caslon")
    ) {
      return { category: "Serif", subcategory: "Old Style" };
    } else if (family.includes("didot") || family.includes("bodoni")) {
      return { category: "Serif", subcategory: "Didone" };
    }
    return { category: "Serif", subcategory: "Transitional" };
  }

  // Sans Serif (default for most modern fonts)
  if (
    family.includes("sans") ||
    family.includes("gothic") ||
    family.includes("grotesque") ||
    family.includes("helvetica") ||
    family.includes("arial") ||
    family.includes("futura")
  ) {
    // Sub-categorize sans serifs
    if (
      family.includes("geometric") ||
      family.includes("futura") ||
      family.includes("avant")
    ) {
      return { category: "Sans Serif", subcategory: "Geometric" };
    } else if (
      family.includes("humanist") ||
      family.includes("gill") ||
      family.includes("optima")
    ) {
      return { category: "Sans Serif", subcategory: "Humanist" };
    } else if (
      family.includes("grotesque") ||
      family.includes("akzidenz") ||
      family.includes("franklin")
    ) {
      return { category: "Sans Serif", subcategory: "Grotesque" };
    }
    return { category: "Sans Serif", subcategory: "Neo-Grotesque" };
  }

  // Default: assume sans serif for unclassified modern fonts
  return { category: "Sans Serif", subcategory: "Neo-Grotesque" };
}
