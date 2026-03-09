/**
 * Font category taxonomy (Fancy, Foreign look, Techno, Gothic, Basic, Script)
 * and their subcategories for sidebar filtering.
 */

import type { IconName } from "@/components/ui/managed-icon";

export interface FontCategoryConfig {
  value: string;
  label: string;
  icon: IconName;
  subcategories: string[];
}

export const FONT_CATEGORIES: FontCategoryConfig[] = [
  {
    value: "Fancy",
    label: "Fancy",
    icon: "Sparkles",
    subcategories: [
      "Cartoon",
      "Comic",
      "Groovy",
      "Old School",
      "Curly",
      "Western",
      "Eroded",
      "Distorted",
      "Destroy",
      "Horror",
      "Fire, Ice",
      "Decorative",
      "Typewriter",
      "Stencil, Army",
      "Retro",
      "Initials",
      "Grid",
      "Various",
    ],
  },
  {
    value: "Foreign look",
    label: "Foreign look",
    icon: "Globe",
    subcategories: [
      "Chinese, Jpn",
      "Arabic",
      "Mexican",
      "Roman, Greek",
      "Russian",
      "Various",
    ],
  },
  {
    value: "Techno",
    label: "Techno",
    icon: "Cpu",
    subcategories: ["Square", "LCD", "Sci-fi", "Pixel", "Bitmap", "Various"],
  },
  {
    value: "Gothic",
    label: "Gothic",
    icon: "ScrollText",
    subcategories: ["Medieval", "Modern", "Celtic", "Initials", "Various"],
  },
  {
    value: "Basic",
    label: "Basic",
    icon: "Type",
    subcategories: ["Sans serif", "Serif", "Fixed width", "Various"],
  },
  {
    value: "Script",
    label: "Script",
    icon: "PenTool",
    subcategories: [
      "Calligraphy",
      "School",
      "Handwritten",
      "Brush",
      "Trash",
      "Graffiti",
      "Old School",
      "Various",
    ],
  },
];

/** Default category/subcategory when a font cannot be classified. */
export const DEFAULT_CATEGORY = "Basic";
export const DEFAULT_SUBCATEGORY = "Various";
