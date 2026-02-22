/**
 * Universal Font Metadata Bridge — typographic taxonomy aligned with
 * Google Fonts / Adobe Fonts and internet-standard classifications.
 * Keys are normalized lowercase family names for lookup.
 */

export type FontCategory =
  | "Serif"
  | "Sans Serif"
  | "Monospace"
  | "Cursive"
  | "Display";

export type SerifSubcategory =
  | "Slab Serif"
  | "Old Style"
  | "Transitional"
  | "Didone";

export type SansSerifSubcategory =
  | "Geometric"
  | "Humanist"
  | "Grotesque"
  | "Neo-Grotesque";

export type CursiveSubcategory = "Script" | "Handwriting";

export type DisplaySubcategory =
  | "Decorative"
  | "Blackletter"
  | "Stencil";

export type MonospaceSubcategory = "Code";

export type FontSubcategory =
  | SerifSubcategory
  | SansSerifSubcategory
  | CursiveSubcategory
  | DisplaySubcategory
  | MonospaceSubcategory;

export interface FontMetadataEntry {
  category: FontCategory;
  subcategory: FontSubcategory;
  tags: string[];
}

/**
 * Bridge map: normalized lowercase family name -> metadata.
 * Use: bridge[familyName.toLowerCase().trim()]
 */
export type FontMetadataBridge = Record<string, FontMetadataEntry>;

/** Normalize a font family name for bridge lookup (lowercase, trim, collapse spaces). */
export function normalizeFamilyKey(family: string): string {
  return family
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
