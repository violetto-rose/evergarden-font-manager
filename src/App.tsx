import { useState, useEffect } from "react";
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
    };
  }
}

function App() {
  const [fonts, setFonts] = useState<any[]>([]);
  const [selectedFont, setSelectedFont] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanningCount, setScanningCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState("all");

  // UI State
  const [fontSize, setFontSize] = useState(72);
  const [previewText, setPreviewText] = useState("");

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };


  useEffect(() => {
    loadFonts();

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

  const loadFonts = async () => {
    if (window.api) {
      const loaded = await window.api.getFonts();
      setFonts(loaded);
    }
  };

  const handleScan = async () => {
    setLoading(true);
    setScanningCount(0);
    if (window.api) {
      await window.api.scanFonts();
      loadFonts();
    }
    setLoading(false);
  };

  // Filter fonts based on search and category
  const filteredFonts = fonts.filter((font) => {
    const matchesSearch = !searchQuery ||
      font.family.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory ||
      font.category === selectedCategory;

    const matchesView = selectedView === "all" ||
      (selectedView === "favorites" && font.is_favorite === 1);

    return matchesSearch && matchesCategory && matchesView;
  });

  // Find selected font data
  const selectedFontData = selectedFont !== null
    ? fonts.find(f => f.id === selectedFont)
    : null;

  // Show detail view if font is selected
  if (selectedFontData) {
    return (
      <FontDetailView
        font={selectedFontData}
        onBack={() => setSelectedFont(null)}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        selectedView={selectedView}
        onViewSelect={setSelectedView}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0 bg-secondary/30 dark:bg-background">
        <Header
          onScan={handleScan}
          fontSize={fontSize}
          setFontSize={setFontSize}
          previewText={previewText}
          setPreviewText={setPreviewText}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
          <FontGrid
            fonts={filteredFonts}
            selectedId={selectedFont}
            onSelect={setSelectedFont}
            fontSize={fontSize}
            previewText={previewText}
            onFontsChange={loadFonts}
            features={{}}
          />

          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm font-medium">Scanning fonts...</p>
              </div>
            </div>
          )}
        </main>

        <footer className="h-10 border-t bg-background flex items-center justify-between px-6 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          <div className="flex gap-6">
            <span>
              {loading
                ? `${scanningCount} files processed`
                : filteredFonts.length !== fonts.length
                  ? `${filteredFonts.length} / ${fonts.length} Font Families`
                  : `${fonts.length} Font Families`
              }
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
