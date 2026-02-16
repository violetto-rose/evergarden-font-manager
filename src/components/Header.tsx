import { Button } from "@/components/ui/button";
import { Search, Type, RotateCw, Settings, Info, Database, Palette } from "lucide-react";
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
  fontSize: number;
  setFontSize: (size: number) => void;
  previewText: string;
  setPreviewText: (text: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({
  onScan,
  fontSize,
  setFontSize,
  previewText,
  setPreviewText,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme
}: HeaderProps) {
  return (
    <header className="bg-background draggable-region flex h-20 items-center justify-between border-b pl-8 pr-36 gap-8 shrink-0">

      {/* Search */}
      <div className="no-drag flex flex-1 items-center gap-4 max-w-xs">
        <Search className="text-muted-foreground w-5 h-5" />
        <input
          type="search"
          placeholder="Search fonts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-muted-foreground"
        />
      </div>

      <div className="h-8 w-px bg-border mx-2" />

      {/* Preview Text */}
      <div className="no-drag flex flex-1 items-center gap-4">
        <Type className="text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Type something to preview..."
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-muted-foreground"
        />
      </div>

      {/* Controls */}
      <div className="no-drag flex items-center gap-6">
        <div className="flex items-center gap-3 w-48">
          <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{fontSize}px</span>
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
          <Button variant="ghost" size="icon" onClick={() => setFontSize(72)} title="Reset View">
            <RotateCw className="w-5 h-5" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Settings">
                <Settings className="w-5 h-5" />
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
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Appearance</h3>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium">Dark Mode</span>
                        <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                      </div>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={onToggleTheme}
                      />
                    </div>
                  </div>
                </div>

                {/* Database Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Database</h3>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3 border">
                    <p className="text-xs text-muted-foreground mb-3">
                      Rebuild the font database if you notice missing fonts or inconsistent metadata. This may take a few moments.
                    </p>
                    <Button onClick={onScan} variant="secondary" size="sm" className="w-full justify-center">
                      <RotateCw className="mr-2 h-3.5 w-3.5" />
                      Rebuild Font Index
                    </Button>
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">About</h3>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-xs text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span className="font-mono">0.1.0-beta</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Electron</span>
                      <span className="font-mono">{process.versions?.electron || 'Unknown'}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t flex justify-center">
                      <span className="opacity-50">Evergarden Font Manager</span>
                    </div>
                  </div>
                </div>

              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
