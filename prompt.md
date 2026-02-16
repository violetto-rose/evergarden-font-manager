## Electron Font Manager — Practical Build Roadmap

You’re describing a **local font intelligence + preview system**, not just a viewer. Treat it as a pipeline product:

> **Detect → Normalize → Enrich → Store → Watch → Preview → Customize**

Below is a phased roadmap you can actually execute without overengineering the MVP.

---

# Phase 0 — Scope Control (Do This First)

Lock the MVP features:

**MVP must include:**

- Scan system fonts
- Extract metadata
- Categorize fonts (family/type/subtype)
- Store locally for offline use
- Detect newly added fonts
- Clean font preview screen
- OpenType feature toggles (ligatures, stylistic sets, etc.)

**Do NOT include yet:**

- Cloud sync
- Font downloads
- Marketplace
- AI tagging
- Collaboration

Ship a working desktop tool first.

---

# Phase 1 — Tech Stack Decisions

## Core

- Electron
- React (UI)
- Node APIs (font scanning + parsing)

## Suggested Libraries

### Font discovery

- `font-manager` (Node native module) — best cross-platform
- fallback: OS directory scan + parsing

### Font parsing

- `fontkit` — strong OpenType support
- `opentype.js` — useful for feature inspection

### Database

Use one:

**Best fit:** SQLite

- simple
- offline
- structured queries
- good for metadata search

Options:

- better-sqlite3
- sqlite3

Avoid Mongo/NeDB for this — unnecessary.

---

# Phase 2 — Local Font Discovery Engine

## Tasks

### OS Font Directories

Scan:

**Windows**

```
C:\Windows\Fonts
```

**macOS**

```
/System/Library/Fonts
/Library/Fonts
~/Library/Fonts
```

**Linux**

```
/usr/share/fonts
~/.fonts
```

### Implementation Steps

1. Recursively scan directories
2. Filter extensions:
   - `.ttf`
   - `.otf`
   - `.woff`
   - `.woff2`

3. Generate file hash → avoid duplicates
4. Store file path + hash

---

# Phase 3 — Metadata Extraction Layer

Use `fontkit`.

Extract:

```
familyName
subfamilyName
fullName
postscriptName
weight
width
style
version
copyright
supported features
glyph count
```

Also extract:

```
OpenType features list
GSUB/GPOS tables
axes (for variable fonts)
```

Store raw metadata JSON in DB.

---

# Phase 4 — Categorization Engine (Internet + Rules)

You want **type + subtype classification**.

Examples:

```
Serif
  ├─ Old Style
  ├─ Transitional
  ├─ Didone
Sans Serif
  ├─ Humanist
  ├─ Grotesque
  ├─ Geometric
Display
Script
Monospace
Handwritten
```

## Strategy (Realistic)

Do NOT rely fully on internet lookup at runtime.

### Step A — Build a classification dataset

Prebuild a JSON map:

```
fontFamily → category/subcategory
```

Sources:

- Google Fonts metadata
- Font classification datasets
- Manual curation for top families

Bundle this with app.

### Step B — Online enrichment (optional pass)

If font not found:

- Query public font APIs
- scrape font sites (later phase)
- cache results locally

### Step C — Heuristic fallback

Rules:

- monospace flag → Monospace
- presence of serif glyph features → Serif
- script-like curves → Script
- extreme stroke contrast → Didone-like

Don’t chase perfection — allow “Unknown”.

---

# Phase 5 — Database Schema

## Tables

### fonts

```
id
file_path
file_hash
family
subfamily
full_name
postscript_name
weight
style
is_variable
category
subcategory
metadata_json
last_seen
```

### opentype_features

```
font_id
feature_tag
description
```

### font_axes (variable fonts)

```
font_id
axis_tag
min
max
default
```

Index:

- family
- category
- hash

---

# Phase 6 — Font Watcher (Auto Refresh)

Use:

```
chokidar
```

Watch font directories.

On change:

```
add → parse → store
remove → mark inactive
modify → re-hash → update
```

Debounce events — font installs often trigger bursts.

---

# Phase 7 — Font Preview Screen (Core UX)

## Layout

Left:

- Category filter
- Search
- Weight/style filters

Center:

- Font preview panel

Right:

- OpenType controls
- Axes sliders (variable fonts)

---

## Typography Preview Blocks

Render:

```
Headline sample
Paragraph sample
Numbers
Symbols
Mixed language sample
```

User-editable sample text.

---

# Phase 8 — OpenType Feature Controls

Use CSS + font feature settings.

## Controls UI

Toggle switches:

```
liga — ligatures
dlig — discretionary ligatures
ss01–ss20 — stylistic sets
smcp — small caps
onum — oldstyle numbers
tnum — tabular numbers
```

Apply live:

```
font-feature-settings:
  "liga" 1,
  "ss01" 1;
```

For variable fonts:

```
font-variation-settings:
  "wght" 650,
  "wdth" 110;
```

Sliders for axes.

---

# Phase 9 — Performance Safeguards

Fonts can be heavy.

Do:

- lazy preview rendering
- cache parsed metadata
- virtualize font lists
- load preview only when visible
- preload subset glyphs

Avoid rendering 1000 font previews at once.

---

# Phase 10 — Packaging Strategy

Native modules (font-manager) complicate packaging.

Test early:

```
electron-builder
```

Build for:

- win
- mac
- linux

Solve native rebuild issues early — not at the end.

---

# Phase 11 — MVP Milestone Checklist

You’re done when:

- [ ] Fonts detected
- [ ] Metadata extracted
- [ ] Categorized offline
- [ ] Stored in SQLite
- [ ] Auto-refresh works
- [ ] Preview UI clean
- [ ] OpenType toggles live
- [ ] Variable font sliders work

---

If you want, next step I can give you:

- folder structure
- DB schema SQL
- scanning service code skeleton
- React preview component design
- OpenType control component spec

Say which phase you want to implement first.
