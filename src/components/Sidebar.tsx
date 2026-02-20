import { Button } from "@/components/ui/button";
import logo from "../../assets/logo.svg";
import {
  Grid,
  Clock,
  Heart,
  Type,
  List,
  Monitor,
  PenTool,
  Code,
} from "lucide-react";

interface SidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  selectedView: string;
  onViewSelect: (view: string) => void;
}

export function Sidebar({
  selectedCategory,
  onCategorySelect,
  selectedView,
  onViewSelect,
}: SidebarProps) {
  return (
    <aside className="bg-background hidden h-full w-64 flex-col border-r md:flex">
      <div className="p-6">
        <div className="mb-8 flex items-center">
          <img src={logo} alt="Evergarden" className="h-12 w-auto" />
        </div>

        <nav className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-4 text-[10px] font-semibold tracking-widest uppercase">
              Library
            </p>
            <ul className="space-y-1">
              <li>
                <Button
                  variant={
                    selectedView === "all" && selectedCategory === null
                      ? "secondary"
                      : "ghost"
                  }
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 w-full justify-start gap-3 px-3 font-medium"
                  onClick={() => {
                    onViewSelect("all");
                    onCategorySelect(null);
                  }}
                >
                  <Grid className="h-4 w-4" />
                  All Typefaces
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 w-full justify-start gap-3 px-3 font-medium"
                  disabled
                >
                  <Clock className="h-4 w-4" />
                  Recently Added
                </Button>
              </li>
              <li>
                <Button
                  variant={selectedView === "favorites" ? "secondary" : "ghost"}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 w-full justify-start gap-3 px-3 font-medium"
                  onClick={() => {
                    onViewSelect("favorites");
                    onCategorySelect(null);
                  }}
                >
                  <Heart className="h-4 w-4" />
                  Favorites
                </Button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-muted-foreground mb-4 text-[10px] font-semibold tracking-widest uppercase">
              Categories
            </p>
            <ul className="space-y-1">
              <li>
                <Button
                  variant={selectedCategory === "Serif" ? "secondary" : "ghost"}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 w-full justify-start gap-3 px-3"
                  onClick={() => onCategorySelect("Serif")}
                >
                  <Type className="h-4 w-4" />
                  Serif
                </Button>
              </li>
              <li>
                <Button
                  variant={
                    selectedCategory === "Sans Serif" ? "secondary" : "ghost"
                  }
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 w-full justify-start gap-3 px-3"
                  onClick={() => onCategorySelect("Sans Serif")}
                >
                  <Monitor className="h-4 w-4" />
                  Sans Serif
                </Button>
              </li>
              <li>
                <Button
                  variant={
                    selectedCategory === "Display" ? "secondary" : "ghost"
                  }
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 w-full justify-start gap-3 px-3"
                  onClick={() => onCategorySelect("Display")}
                >
                  <List className="h-4 w-4" />
                  Display
                </Button>
              </li>
              <li>
                <Button
                  variant={
                    selectedCategory === "Monospace" ? "secondary" : "ghost"
                  }
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 w-full justify-start gap-3 px-3"
                  onClick={() => onCategorySelect("Monospace")}
                >
                  <Code className="h-4 w-4" />
                  Monospace
                </Button>
              </li>
              <li>
                <Button
                  variant={
                    selectedCategory === "Cursive" ? "secondary" : "ghost"
                  }
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 w-full justify-start gap-3 px-3"
                  onClick={() => onCategorySelect("Cursive")}
                >
                  <PenTool className="h-4 w-4" />
                  Cursive
                </Button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
