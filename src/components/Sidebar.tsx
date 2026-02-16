import { Button } from "@/components/ui/button";
import { Grid, Clock, Heart, Type, List, Monitor, PenTool, Code, Sun, Moon } from "lucide-react";

interface SidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  selectedView: string;
  onViewSelect: (view: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Sidebar({ selectedCategory, onCategorySelect, selectedView, onViewSelect, theme, onToggleTheme }: SidebarProps) {
  return (
    <aside className="w-64 flex-col border-r bg-background hidden md:flex h-full">
      <div className="p-6">
        <h1 className="mb-8 text-2xl font-bold tracking-tighter">Evergarden</h1>

        <nav className="space-y-6">
          <div>
            <p className="mb-4 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Library
            </p>
            <ul className="space-y-1">
              <li>
                <Button
                  variant={selectedView === "all" && selectedCategory === null ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-9 px-3 font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => {
                    onViewSelect("all");
                    onCategorySelect(null);
                  }}
                >
                  <Grid className="w-4 h-4" />
                  All Typefaces
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-9 px-3 font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  disabled
                >
                  <Clock className="w-4 h-4" />
                  Recently Added
                </Button>
              </li>
              <li>
                <Button
                  variant={selectedView === "favorites" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-9 px-3 font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => {
                    onViewSelect("favorites");
                    onCategorySelect(null);
                  }}
                >
                  <Heart className="w-4 h-4" />
                  Favorites
                </Button>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Categories
            </p>
            <ul className="space-y-1">
              <li>
                <Button
                  variant={selectedCategory === "Serif" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-9 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => onCategorySelect("Serif")}
                >
                  <Type className="w-4 h-4" />
                  Serif
                </Button>
              </li>
              <li>
                <Button
                  variant={selectedCategory === "Sans Serif" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-9 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => onCategorySelect("Sans Serif")}
                >
                  <Monitor className="w-4 h-4" />
                  Sans Serif
                </Button>
              </li>
              <li>
                <Button
                  variant={selectedCategory === "Display" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-9 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => onCategorySelect("Display")}
                >
                  <List className="w-4 h-4" />
                  Display
                </Button>
              </li>
              <li>
                <Button
                  variant={selectedCategory === "Monospace" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-9 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => onCategorySelect("Monospace")}
                >
                  <Code className="w-4 h-4" />
                  Monospace
                </Button>
              </li>
              <li>
                <Button
                  variant={selectedCategory === "Cursive" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-9 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => onCategorySelect("Cursive")}
                >
                  <PenTool className="w-4 h-4" />
                  Cursive
                </Button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-3"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-4 h-4" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              Light Mode
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
