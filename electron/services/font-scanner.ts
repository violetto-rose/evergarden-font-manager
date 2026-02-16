import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import fontkit from "fontkit";
import { saveFont } from "./database";
import { categorizeFontFamily } from "./categorization";

const FONT_EXTENSIONS = new Set([".ttf", ".otf", ".woff", ".woff2"]);

export function getSystemFontDirectories(): string[] {
  const platform = os.platform();
  const dirs: string[] = [];

  if (platform === "win32") {
    const winDir = process.env.SystemRoot || "C:\\Windows";
    dirs.push(path.join(winDir, "Fonts"));
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      dirs.push(path.join(localAppData, "Microsoft", "Windows", "Fonts"));
    }
  } else if (platform === "darwin") {
    dirs.push("/System/Library/Fonts");
    dirs.push("/Library/Fonts");
    const home = os.homedir();
    dirs.push(path.join(home, "Library/Fonts"));
  } else if (platform === "linux") {
    dirs.push("/usr/share/fonts");
    dirs.push(path.join(os.homedir(), ".fonts"));
  }
  return dirs;
}

async function getFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("error", (err) => reject(err));
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

interface FontMetadata {
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

// Extract OpenType features from font
function extractOpenTypeFeatures(font: any): string[] {
  const features: Set<string> = new Set();

  try {
    // 1. Check font.availableFeatures (fontkit getter)
    if (font.availableFeatures) {
      font.availableFeatures.forEach((feature: string) => features.add(feature.trim()));
    }

    // 2. Fallback: Parse GSUB if not already found
    if (font.GSUB && font.GSUB.featureList) {
      font.GSUB.featureList.forEach((feature: any) => {
        if (feature.tag) features.add(feature.tag.trim());
      });
    }

    // 3. Fallback: Parse GPOS
    if (font.GPOS && font.GPOS.featureList) {
      font.GPOS.featureList.forEach((feature: any) => {
        if (feature.tag) features.add(feature.tag.trim());
      });
    }
  } catch (e) {
    console.error("Error extracting OpenType features:", e);
  }

  return Array.from(features).filter(f => f && f.length > 0);
}

// Exported for Watcher
export async function processFontFile(
  filePath: string
): Promise<FontMetadata | null> {
  const ext = path.extname(filePath).toLowerCase();
  if (!FONT_EXTENSIONS.has(ext)) return null;

  try {
    const hash = await getFileHash(filePath);
    const font = fontkit.openSync(filePath);
    let fontObj: any = font;
    if ("fonts" in font) {
      fontObj = font.fonts[0];
    }

    const isMonospace = fontObj.post?.isFixedPitch || 0;

    const cleanStr = (s: any) => (typeof s === "string" ? s.replace(/\0/g, "").trim() : "");

    let familyName = cleanStr(fontObj.preferredFamily || fontObj.familyName);
    const subfamilyName = cleanStr(fontObj.preferredSubfamily || fontObj.subfamilyName);

    // Heuristic 1: If family name ends with subfamily name (e.g. "Arial Bold" and "Bold"), strip it
    if (subfamilyName && familyName.toLowerCase().endsWith(" " + subfamilyName.toLowerCase())) {
      familyName = familyName.slice(0, -subfamilyName.length - 1).trim();
    }

    // Heuristic 2: Strip common style suffixes from family name
    // This handles cases where family name equals "FontName Medium" but subfamily is "Regular"
    const styleSuffixes = [
      "ExtraLight", "Extra Light", "Thin", "Light",
      "Medium", "SemiBold", "Semi Bold", "Semibold", "DemiBold", "Demi Bold",
      "Bold", "ExtraBold", "Extra Bold", "UltraBold", "Ultra Bold",
      "Black", "Heavy",
      "Italic", "Oblique",
      "Regular",
      "Condensed", "Expanded"
    ];

    // Sort by length to match longest suffixes first
    styleSuffixes.sort((a, b) => b.length - a.length);

    let stripped = true;
    while (stripped) {
      stripped = false;
      for (const suffix of styleSuffixes) {
        const regex = new RegExp(`\\s+${suffix}$`, "i");
        if (regex.test(familyName)) {
          familyName = familyName.replace(regex, "").trim();
          stripped = true;
          break;
        }
      }
    }

    const { category, subcategory } = categorizeFontFamily(
      familyName,
      subfamilyName,
      isMonospace
    );

    const metadata: FontMetadata = {
      file_path: filePath,
      file_hash: hash,
      family: familyName,
      subfamily: subfamilyName,
      full_name: (fontObj.fullName || "").trim(),
      postscript_name: fontObj.postscriptName,
      weight: 400,
      width: 5,
      italic: fontObj.italicAngle !== 0 ? 1 : 0,
      monospace: isMonospace,
      category,
      subcategory,
      version: fontObj.version ? fontObj.version.toString() : "",
      copyright: fontObj.copyright,
      metadata_json: JSON.stringify({
        upm: fontObj.unitsPerEm,
        glyphs: fontObj.numGlyphs,
        features: extractOpenTypeFeatures(fontObj),
        characterSet: fontObj.characterSet,
      }),
      last_seen: Date.now(),
    };

    saveFont(metadata);
    return metadata;
  } catch (e: any) {
    if (e.message === "Unknown font format") {
      console.warn(`Skipping unsupported font format: ${filePath}`);
    } else {
      console.error(`Failed to process ${filePath}`, e);
    }
    return null;
  }
}

export async function scanFonts(onProgress?: (count: number) => void): Promise<FontMetadata[]> {
  const dirs = getSystemFontDirectories();
  const foundFonts: FontMetadata[] = [];

  const scanDir = async (directory: string) => {
    try {
      if (!fs.existsSync(directory)) return;

      const entries = await fs.promises.readdir(directory, {
        withFileTypes: true,
      });
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (entry.isFile()) {
          const res = await processFontFile(fullPath);
          if (res) {
            foundFonts.push(res);
            // Send progress update
            if (onProgress) {
              onProgress(foundFonts.length);
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error scanning ${directory}`, e);
    }
  };

  await Promise.all(dirs.map((dir) => scanDir(dir)));
  return foundFonts;
}
