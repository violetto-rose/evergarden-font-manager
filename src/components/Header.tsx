import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Type,
  RotateCw,
  Settings,
  Info,
  Database,
  Palette,
  Loader2,
  Check,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface HeaderProps {
  onScan: () => void;
  isScanning?: boolean;
  rebuildDoneAt?: number | null;
  fontSize: number;
  setFontSize: (size: number) => void;
  previewText: string;
  setPreviewText: (text: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const DONE_SHOW_MS = 2500;

export function Header({
  onScan,
  isScanning = false,
  rebuildDoneAt = null,
  fontSize,
  setFontSize,
  previewText,
  setPreviewText,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (rebuildDoneAt == null) return;
    setShowDone(true);
    const t = setTimeout(() => setShowDone(false), DONE_SHOW_MS);
    return () => clearTimeout(t);
  }, [rebuildDoneAt]);

  const rebuildState =
    isScanning ? "scanning" : showDone ? "done" : "idle";

  return (
    <header className="bg-background draggable-region flex h-20 shrink-0 items-center justify-between gap-8 border-b pr-36 pl-8">
      {/* Search */}
      <div className="no-drag flex max-w-xs flex-1 items-center gap-4">
        <Search className="text-muted-foreground h-5 w-5" />
        <input
          type="search"
          placeholder="Search fonts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="placeholder:text-muted-foreground w-full border-none bg-transparent text-sm focus:outline-none"
        />
      </div>

      <div className="bg-border mx-2 h-8 w-px" />

      {/* Preview Text */}
      <div className="no-drag flex flex-1 items-center gap-4">
        <Type className="text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="Type something to preview..."
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="placeholder:text-muted-foreground w-full border-none bg-transparent text-sm focus:outline-none"
        />
      </div>

      {/* Controls */}
      <div className="no-drag flex items-center gap-6">
        <div className="flex w-48 items-center gap-3">
          <span className="text-muted-foreground w-8 text-right text-[10px] font-bold">
            {fontSize}px
          </span>
          <Slider
            value={[fontSize]}
            onValueChange={(val) => setFontSize(val[0])}
            max={128}
            min={12}
            step={1}
            className="flex-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFontSize(72)}
            title="Reset View"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Settings">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Configure the application preferences.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                {/* Appearance Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Palette className="text-muted-foreground h-4 w-4" />
                    <h3 className="text-sm font-medium">Appearance</h3>
                  </div>
                  <div className="bg-secondary/30 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium">Dark Mode</span>
                        <p className="text-muted-foreground text-xs">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <Switch
                        checked={theme === "dark"}
                        onCheckedChange={onToggleTheme}
                      />
                    </div>
                  </div>
                </div>

                {/* Database Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Database className="text-muted-foreground h-4 w-4" />
                    <h3 className="text-sm font-medium">Database</h3>
                  </div>
                  <div className="bg-secondary/30 rounded-lg border p-3">
                    <p className="text-muted-foreground mb-3 text-xs">
                      Rebuild the font database if you notice missing fonts or
                      inconsistent metadata. This may take a few moments.
                    </p>
                    <Button
                      onClick={onScan}
                      variant="secondary"
                      size="sm"
                      className="w-full justify-center"
                      disabled={isScanning}
                    >
                      {rebuildState === "scanning" && (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Rebuilding…
                        </>
                      )}
                      {rebuildState === "done" && (
                        <>
                          <Check className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                          Done
                        </>
                      )}
                      {rebuildState === "idle" && (
                        <>
                          <RotateCw className="mr-2 h-3.5 w-3.5" />
                          Rebuild Font Index
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Info className="text-muted-foreground h-4 w-4" />
                    <h3 className="text-sm font-medium">About</h3>
                  </div>
                  <div className="bg-card text-muted-foreground space-y-2 rounded-lg border p-4 text-xs">
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span className="font-mono">0.1.0-beta</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Electron</span>
                      <span className="font-mono">
                        {window.api?.versions?.electron || "Unknown"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col items-center gap-1 border-t pt-2">
                      <span className="opacity-50">
                        Evergarden Font Manager
                      </span>
                    </div>
                  </div>
                  <a
                    href="https://github.com/violetto-rose/evergarden-font-manager"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-muted-foreground hover:text-primary mt-1 block w-full text-center text-[10px] uppercase tracking-widest transition-colors"
                  >
                    Made with ❤️ by Violet
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
