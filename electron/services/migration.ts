import { categorizeFontFamily } from "./categorization";

/**
 * Migrates existing fonts in the database to add category information
 */
export async function migrateFontsWithCategories() {
  console.log("Starting category migration...");

  // Get all fonts (this will get individual font files, not grouped)
  const path = await import("path");
  const { app } = await import("electron");
  const Database = (await import("better-sqlite3")).default;

  const db = new Database(path.join(app.getPath("userData"), "fonts.db"));

  const allFonts: any[] = db.prepare("SELECT * FROM fonts").all();

  let updated = 0;
  for (const font of allFonts) {
    // Skip if already has category
    if (font.category) continue;

    const { category, subcategory } = categorizeFontFamily(
      font.family,
      font.subfamily,
      font.monospace
    );

    // Update the font with category info
    db.prepare(
      `
      UPDATE fonts
      SET category = ?, subcategory = ?
      WHERE id = ?
    `
    ).run(category, subcategory, font.id);

    updated++;
  }

  console.log(`Category migration complete: ${updated} fonts updated`);
  return updated;
}
