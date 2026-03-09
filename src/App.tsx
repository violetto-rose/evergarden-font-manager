import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useDeferredValue,
  useRef,
} from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { FontGrid } from "./components/FontGrid";
import { FontDetailView } from "./components/FontDetailView";
import { FontPairingView } from "./components/FontPairingView";

declare global {
  interface Window {
    api: {
      // Drop import callbacks — registered once on mount
      onDropPaths: (cb: (paths: string[]) => void) => void;
      onImportProgress: (cb: (processed: number) => void) => void;
      onImportDone: (
        cb: (
          result: { imported: number; failed: number; errors: string[] },
          fonts: any[]
        ) => void
      ) => void;
      // IPC
      scanFonts: () => Promise<any[]>;
      getFonts: () => Promise<any[]>;
      toggleFavorite: (family: string, isFavorite: boolean) => Promise<void>;
      getFontVariants: (family: string) => Promise<any[]>;
      revealInFolder: (filePath: string) => Promise<void>;
      getRecentFonts: () => Promise<any[]>;
      getAppVersion: () => Promise<string>;
      importDroppedFonts: (paths: string[]) => Promise<{
        imported: number;
        failed: number;
        errors: string[];
      }>;
      onScanProgress: (callback: (count: number) => void) => void;
      removeScanProgressListener: () => void;
      removeImportProgressListener: () => void;
      uninstallFont: (
        family: string
      ) => Promise<{ success: boolean; error?: string }>;
      versions: {
        electron: string;
        chrome: string;
        node: string;
      };
    };
  }
}

function App() {
  const [fonts, setFonts] = useState<any[]>([]);
  const [selectedFont, setSelectedFont] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanningCount, setScanningCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  // Deferred: input is always responsive; grid re-filters only after typing settles
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [categoryFilter, setCategoryFilter] = useState<{
    category: string | null;
    subcategory: string | null;
  }>({ category: null, subcategory: null });
  const [selectedView, setSelectedView] = useState("all");

  const selectedCategory = categoryFilter.category;
  const selectedSubcategory = categoryFilter.subcategory;

  // UI State
  const [fontSize, setFontSize] = useState(72);
  const [previewText, setPreviewText] = useState("");

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as "light" | "dark") || "dark";
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const loadFonts = useCallback(async () => {
    if (window.api) {
      const loaded = await window.api.getFonts();
      setFonts(loaded);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadFonts();
    };
    init();
  }, [loadFonts]);

  useEffect(() => {
    // Set up scan progress listener
    if (window.api) {
      window.api.onScanProgress((count) => {
        setScanningCount(count);
      });
    }

    // Cleanup
    return () => {
      if (window.api) {
        window.api.removeScanProgressListener();
      }
    };
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      dragCounterRef.current += 1;
      setIsDragOver(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  }, []);

  // Register drop callbacks on the preload bridge once on mount.
  // The preload's window listener reads File.path (available there despite
  // contextIsolation) and calls these callbacks directly.
  useEffect(() => {
    if (!window.api?.onDropPaths) return;
    window.api.onDropPaths((paths) => {
      console.log("[app] onDropPaths:", paths);
      setIsDragOver(false);
      dragCounterRef.current = 0;
      setIsImporting(true);
      setImportProgress(0);
      setImportMessage(null);
    });
    window.api.onImportProgress((processed) => {
      setImportProgress(processed);
    });
    window.api.onImportDone((result, fonts) => {
      console.log("[app] onImportDone:", result, "fonts:", fonts?.length);
      if (fonts.length > 0) setFonts(fonts);
      setIsImporting(false);
      setIsDragOver(false);
      dragCounterRef.current = 0;
      setImportProgress(0);
      if (result.imported > 0) {
        setImportMessage(
          result.failed > 0
            ? `Imported ${result.imported} font(s); ${result.failed} failed.`
            : `Imported ${result.imported} font(s).`
        );
      } else if (result.failed > 0 && result.errors.length > 0) {
        setImportMessage(result.errors[0] || "Import failed.");
      } else {
        setImportMessage(
          "No font files recognised. Use .ttf, .otf, .woff, or .woff2."
        );
      }
      setTimeout(() => setImportMessage(null), 4000);
    });
  }, []);

  // Drop handler: only manages drag counter + isDragOver visual state.
  // Actual import is handled by the preload capture listener above.
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    console.log(
      "[app:handleDrop] fired, files:",
      e.dataTransfer?.files?.length ?? 0
    );
  }, []);

  const [rebuildDoneAt, setRebuildDoneAt] = useState<number | null>(null);

  useEffect(() => {
    if (rebuildDoneAt == null) return;

    const timeoutId = window.setTimeout(() => {
      setRebuildDoneAt(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [rebuildDoneAt]);

  const [nowSeconds, setNowSeconds] = useState(() =>
    Math.floor(Date.now() / 1000)
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000));
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const recentCutoff = nowSeconds - 30 * 86400;

  const handleScan = async () => {
    setLoading(true);
    setScanningCount(0);
    if (window.api) {
      await window.api.scanFonts();
      loadFonts();
      setRebuildDoneAt(Date.now());
    }
    setLoading(false);
  };

  // Filter fonts based on search and category (normalize null/empty, case-insensitive)
  const filteredFonts = useMemo(
    () =>
      fonts.filter((font) => {
        const matchesSearch =
          !deferredSearchQuery ||
          font.family.toLowerCase().includes(deferredSearchQuery.toLowerCase());

        const fontCategory = (font.category ?? "").trim().toLowerCase();
        const fontSubcategory = (font.subcategory ?? "").trim().toLowerCase();
        const selCat = (selectedCategory ?? "").toLowerCase();
        const selSub = (selectedSubcategory ?? "").toLowerCase();
        const matchesCategory = !selectedCategory || fontCategory === selCat;
        const matchesSubcategory =
          !selectedSubcategory || fontSubcategory === selSub;

        const matchesView =
          selectedView === "all" ||
          selectedView === "pairing" ||
          (selectedView === "favorites" && font.is_favorite === 1) ||
          (selectedView === "recently-added" && font.last_seen >= recentCutoff);

        return (
          matchesSearch && matchesCategory && matchesSubcategory && matchesView
        );
      }),
    [
      fonts,
      deferredSearchQuery,
      recentCutoff,
      selectedCategory,
      selectedSubcategory,
      selectedView,
    ]
  );

  // Category counts for sidebar (Google Fonts style), based on current view
  const fontsInView =
    selectedView === "favorites"
      ? fonts.filter((f) => f.is_favorite === 1)
      : selectedView === "recently-added"
        ? fonts.filter((f) => f.last_seen >= recentCutoff)
        : fonts;
  const categoryCounts = fontsInView.reduce<Record<string, number>>(
    (acc, font) => {
      const c = (font.category ?? "").trim() || "Basic";
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const subcategoryCounts = fontsInView.reduce<
    Record<string, Record<string, number>>
  >((acc, font) => {
    const c = (font.category ?? "").trim() || "Basic";
    const s = (font.subcategory ?? "").trim() || "Various";
    if (!acc[c]) acc[c] = {};
    acc[c][s] = (acc[c][s] ?? 0) + 1;
    return acc;
  }, {});

  const handleFilterSelect = useCallback(
    (category: string | null, subcategory: string | null) => {
      setCategoryFilter({ category, subcategory });
    },
    []
  );

  // Find selected font data
  const selectedFontData =
    selectedFont !== null ? fonts.find((f) => f.id === selectedFont) : null;

  const handleSelectFont = useCallback((id: number) => {
    setSelectedFont(id);
  }, []);

  return (
    <div
      className="bg-background text-foreground relative flex h-screen w-full overflow-hidden font-sans"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Full-window drag/import overlay — covers sidebar + main, blocks all clicks */}
      {(isDragOver || isImporting) && (
        <div className="border-primary/60 bg-primary/5 fixed inset-0 z-100 flex items-center justify-center border-2 border-dashed backdrop-blur-sm">
          <div className="bg-background/90 flex flex-col items-center gap-3 rounded-xl px-8 py-6 shadow-lg">
            <p className="text-foreground text-sm font-medium">
              {isImporting
                ? `Importing… ${importProgress} file(s) processed`
                : "Drop font files to import"}
            </p>
            <p className="text-muted-foreground text-xs">
              .ttf, .otf, .woff, .woff2 — metadata + online lookup applied
            </p>
          </div>
        </div>
      )}

      <Sidebar
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onFilterSelect={handleFilterSelect}
        selectedView={selectedView}
        onViewSelect={setSelectedView}
        categoryCounts={categoryCounts}
        subcategoryCounts={subcategoryCounts}
      />

      <div className="bg-secondary/30 dark:bg-background relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          onScan={handleScan}
          isScanning={loading}
          rebuildDoneAt={rebuildDoneAt}
          fontSize={fontSize}
          setFontSize={setFontSize}
          previewText={previewText}
          setPreviewText={setPreviewText}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {selectedView === "pairing" ? (
            <FontPairingView fonts={fonts} />
          ) : (
            <FontGrid
              key={`cat-${selectedCategory ?? "all"}-sub-${selectedSubcategory ?? "all"}`}
              fonts={filteredFonts}
              selectedId={selectedFont}
              onSelect={handleSelectFont}
              fontSize={fontSize}
              previewText={previewText}
              onFontsChange={loadFonts}
              features={{}}
            />
          )}

          {loading && (
            <div className="bg-background/50 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                <p className="text-sm font-medium">Scanning fonts...</p>
              </div>
            </div>
          )}

          {importMessage && (
            <div className="bg-primary text-primary-foreground absolute bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg">
              {importMessage}
            </div>
          )}
        </main>

        {selectedFontData && (
          <div className="bg-background fixed inset-0 z-40 flex flex-col">
            <FontDetailView
              font={selectedFontData}
              onBack={() => setSelectedFont(null)}
              onUninstall={async (family: string) => {
                if (!window.api?.uninstallFont) return;
                await window.api.uninstallFont(family);
                setSelectedFont(null);
                await loadFonts();
              }}
            />
          </div>
        )}

        <footer className="bg-background text-muted-foreground flex h-10 items-center justify-between border-t px-6 text-[10px] font-medium tracking-widest uppercase">
          <div className="flex gap-6">
            <span>
              {loading
                ? `${scanningCount} files processed`
                : filteredFonts.length !== fonts.length
                  ? `${filteredFonts.length} / ${fonts.length} Font Families`
                  : `${fonts.length} Font Families`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>System Connected</span>
            </div>
            <span>v0.1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
