# Evergarden Font Manager

Evergarden Font Manager is a local‑first font intelligence and preview tool. It scans system fonts, extracts metadata, categorizes families, and provides fast previews with OpenType feature controls. All data stays on device.

## Product

**Pipeline**
```
Detect → Normalize → Enrich → Store → Watch → Preview → Customize
```

**MVP scope**
- Scan system fonts
- Extract metadata
- Categorize fonts (family/type/subtype)
- Store locally for offline use
- Detect newly added fonts
- Clean preview screen
- OpenType feature toggles

**Out of scope**
- Cloud sync
- Font downloads/marketplace
- AI tagging
- Collaboration

## Development

**Requirements**
- Node.js 20+
- npm

**Run**
```bash
npm install
npm run dev
```

**Icons (Packaging)**
- Source: `assets/icon-1024.png` (1024x1024)
- Auto‑generated before build:
```bash
npm run icons
```

**Build**
```bash
# Windows installer (NSIS)
npm run dist

# Windows portable
npm run dist:portable
```

Outputs:
- Installer: `release/installer/`
- Portable: `release/portable/`

**Scripts**
- `npm run build` rebuilds native deps, builds Electron main/preload, then builds the renderer
- `npm run lint` runs ESLint
- `npm run format` runs Prettier

**CI Release (Windows)**
Tag and push:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## License

MIT
