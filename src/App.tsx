import { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { FontGrid } from "./components/FontGrid";
import { FontDetailView } from "./components/FontDetailView";

declare global {
  interface Window {
    api: {
      scanFonts: () => Promise<any[]>;
      getFonts: () => Promise<any[]>;
      toggleFavorite: (family: string, isFavorite: boolean) => Promise<void>;
      getFontVariants: (family: string) => Promise<any[]>;
      revealInFolder: (filePath: string) => Promise<void>;
      onScanProgress: (callback: (count: number) => void) => void;
      removeScanProgressListener: () => void;
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

  const [rebuildDoneAt, setRebuildDoneAt] = useState<number | null>(null);

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
          !searchQuery ||
          font.family.toLowerCase().includes(searchQuery.toLowerCase());

        const fontCategory = (font.category ?? "").trim().toLowerCase();
        const fontSubcategory = (font.subcategory ?? "").trim().toLowerCase();
        const selCat = (selectedCategory ?? "").toLowerCase();
        const selSub = (selectedSubcategory ?? "").toLowerCase();
        const matchesCategory = !selectedCategory || fontCategory === selCat;
        const matchesSubcategory =
          !selectedSubcategory || fontSubcategory === selSub;

        const matchesView =
          selectedView === "all" ||
          (selectedView === "favorites" && font.is_favorite === 1);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesSubcategory &&
          matchesView
        );
      }),
    [
      fonts,
      searchQuery,
      selectedCategory,
      selectedSubcategory,
      selectedView,
    ]
  );

  // Category counts for sidebar (Google Fonts style), based on current view
  const fontsInView =
    selectedView === "favorites"
      ? fonts.filter((f) => f.is_favorite === 1)
      : fonts;
  const categoryCounts = fontsInView.reduce<Record<string, number>>(
    (acc, font) => {
      const c = (font.category ?? "").trim() || "Sans Serif";
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const subcategoryCounts = fontsInView.reduce<
    Record<string, Record<string, number>>
  >((acc, font) => {
    const c = (font.category ?? "").trim() || "Sans Serif";
    const s = (font.subcategory ?? "").trim();
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
    <div className="bg-background text-foreground flex h-screen w-full overflow-hidden font-sans">
      <Sidebar
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onFilterSelect={handleFilterSelect}
        selectedView={selectedView}
        onViewSelect={setSelectedView}
        categoryCounts={categoryCounts}
        subcategoryCounts={subcategoryCounts}
      />

      <div className="bg-secondary/30 dark:bg-background relative flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
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

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden min-h-0">
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

          {loading && (
            <div className="bg-background/50 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                <p className="text-sm font-medium">Scanning fonts...</p>
              </div>
            </div>
          )}
        </main>

        {selectedFontData && (
          <div className="bg-background fixed inset-0 z-40 flex flex-col">
            <FontDetailView
              font={selectedFontData}
              onBack={() => setSelectedFont(null)}
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
