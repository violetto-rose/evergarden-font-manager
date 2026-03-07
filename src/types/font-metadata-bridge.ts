/**
 * Universal Font Metadata Bridge — typographic taxonomy.
 * Categories: Fancy, Foreign look, Techno, Gothic, Basic, Script.
 * Keys are normalized lowercase family names for lookup.
 */

export type FontCategory =
  | "Fancy"
  | "Foreign look"
  | "Techno"
  | "Gothic"
  | "Basic"
  | "Script";

export type FontSubcategory = string; // Subcategories vary by category; see FONT_CATEGORIES in @/lib/font-categories

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
