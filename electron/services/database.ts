import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

const dbPath = path.join(app.getPath("userData"), "fonts.db");
const db = new Database(dbPath);

// Initialize database
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS fonts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT UNIQUE,
        file_hash TEXT,
        family TEXT,
        subfamily TEXT,
        full_name TEXT,
        postscript_name TEXT,
        weight INTEGER,
        width INTEGER,
        italic INTEGER,
        monospace INTEGER,
        category TEXT,
        subcategory TEXT,
        version TEXT,
        copyright TEXT,
        metadata_json TEXT,
        last_seen INTEGER,
        is_favorite INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_family ON fonts(family);
    CREATE INDEX IF NOT EXISTS idx_hash ON fonts(file_hash);
    CREATE INDEX IF NOT EXISTS idx_favorite ON fonts(is_favorite);
  `);

  // Add is_favorite column if it doesn't exist (for existing databases)
  try {
    db.exec(`
      ALTER TABLE fonts ADD COLUMN is_favorite INTEGER DEFAULT 0;
    `);
  } catch (e) {
    // Column already exists, ignore
  }

  // Add index for is_favorite if it doesn't exist
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_favorite ON fonts(is_favorite);
    `);
  } catch (e) {
    // Index already exists, ignore
  }
}

interface FontData {
  file_path: string;
  file_hash: string;
  family: string;
  subfamily: string;
  full_name: string;
  postscript_name: string;
  weight: number;
  width: number;
  italic: number;
  monospace: number;
  category: string;
  subcategory: string;
  version: string;
  copyright: string;
  metadata_json: string;
  last_seen: number;
}

export function saveFont(fontData: FontData) {
  const stmt = db.prepare(`
    INSERT INTO fonts (
        file_path, file_hash, family, subfamily, full_name, postscript_name,
        weight, width, italic, monospace, category, subcategory, version, copyright, metadata_json, last_seen
    ) VALUES (
        @file_path, @file_hash, @family, @subfamily, @full_name, @postscript_name,
        @weight, @width, @italic, @monospace, @category, @subcategory, @version, @copyright, @metadata_json, @last_seen
    )
    ON CONFLICT(file_path) DO UPDATE SET
        last_seen = @last_seen,
        file_hash = @file_hash,
        metadata_json = @metadata_json,
        family = @family,
        subfamily = @subfamily,
        full_name = @full_name,
        postscript_name = @postscript_name,
        weight = @weight,
        width = @width,
        italic = @italic,
        monospace = @monospace,
        category = @category,
        subcategory = @subcategory,
        version = @version,
        copyright = @copyright
  `);
  stmt.run(fontData);
}

export function getAllFonts() {
  // Group fonts by family and aggregate variants
  return db
    .prepare(
      `
    SELECT
      MIN(id) as id,
      family,
      GROUP_CONCAT(subfamily, ', ') as subfamily,
      MIN(file_path) as file_path,
      GROUP_CONCAT(DISTINCT file_path) as all_file_paths,
      MIN(metadata_json) as metadata_json,
      MIN(category) as category,
      MIN(subcategory) as subcategory,
      MAX(is_favorite) as is_favorite,
      COUNT(*) as variant_count
    FROM fonts
    GROUP BY family
    ORDER BY family ASC
  `
    )
    .all();
}

export function getFontByPath(filePath: string) {
  return db.prepare("SELECT * FROM fonts WHERE file_path = ?").get(filePath);
}

export function toggleFavorite(family: string, isFavorite: boolean) {
  // Update all variants of the font family
  const stmt = db.prepare(`
    UPDATE fonts
    SET is_favorite = ?
    WHERE family = ?
  `);
  stmt.run(isFavorite ? 1 : 0, family);
}

export function getFavorites() {
  return db
    .prepare(
      `
    SELECT
      MIN(id) as id,
      family,
      GROUP_CONCAT(subfamily, ', ') as subfamily,
      MIN(file_path) as file_path,
      MIN(metadata_json) as metadata_json,
      MIN(category) as category,
      MIN(subcategory) as subcategory,
      COUNT(*) as variant_count
    FROM fonts
    WHERE is_favorite = 1
    GROUP BY family
    ORDER BY family ASC
  `
    )
    .all();
}

export function getFontVariants(family: string) {
  return db
    .prepare(
      `
    SELECT *
    FROM fonts
    WHERE family = ?
    ORDER BY
      CASE
        WHEN subfamily LIKE '%Regular%' THEN 1
        WHEN subfamily LIKE '%Normal%' THEN 2
        WHEN subfamily LIKE '%Medium%' THEN 3
        WHEN subfamily LIKE '%Bold%' THEN 4
        WHEN subfamily LIKE '%Italic%' THEN 5
        ELSE 6
      END,
      subfamily ASC
  `
    )
    .all(family);
}
