import React from "react";
import * as Icons from "@remixicon/react";

export type IconName =
  | "Search"
  | "Type"
  | "RotateCw"
  | "Settings"
  | "Info"
  | "Database"
  | "Palette"
  | "Loader2"
  | "Check"
  | "X"
  | "Grid"
  | "Clock"
  | "Heart"
  | "Link"
  | "ChevronDown"
  | "ChevronRight"
  | "ArrowLeft"
  | "FolderOpen"
  | "RotateCcw"
  | "Trash2"
  | "Sparkles"
  | "Globe"
  | "Cpu"
  | "ScrollText"
  | "PenTool"
  | "Shuffle"
  | "Reset"
  | "ShuffleLine"
  | "RefreshLine";

interface IconProps extends React.ComponentProps<typeof Icons.RiHeartLine> {
  name: IconName;
  filled?: boolean;
}

const iconMap: Record<
  IconName,
  { line: React.ComponentType<any>; fill: React.ComponentType<any> }
> = {
  Search: { line: Icons.RiSearch2Line, fill: Icons.RiSearch2Fill },
  Type: { line: Icons.RiFontSize, fill: Icons.RiFontSize },
  RotateCw: { line: Icons.RiRefreshLine, fill: Icons.RiRefreshFill },
  Settings: { line: Icons.RiSettings4Line, fill: Icons.RiSettings4Fill },
  Info: { line: Icons.RiInformationLine, fill: Icons.RiInformationFill },
  Database: { line: Icons.RiDatabase2Line, fill: Icons.RiDatabase2Fill },
  Palette: { line: Icons.RiPaletteLine, fill: Icons.RiPaletteFill },
  Loader2: { line: Icons.RiLoader4Line, fill: Icons.RiLoader4Fill },
  Check: { line: Icons.RiCheckLine, fill: Icons.RiCheckFill },
  X: { line: Icons.RiCloseLine, fill: Icons.RiCloseFill },
  Grid: { line: Icons.RiLayoutGridLine, fill: Icons.RiLayoutGridFill },
  Clock: { line: Icons.RiTimeLine, fill: Icons.RiTimeFill },
  Heart: { line: Icons.RiHeartLine, fill: Icons.RiHeartFill },
  Link: { line: Icons.RiLink, fill: Icons.RiLink },
  ChevronDown: { line: Icons.RiArrowDownSLine, fill: Icons.RiArrowDownSFill },
  ChevronRight: {
    line: Icons.RiArrowRightSLine,
    fill: Icons.RiArrowRightSFill,
  },
  ArrowLeft: { line: Icons.RiArrowLeftLine, fill: Icons.RiArrowLeftFill },
  FolderOpen: { line: Icons.RiFolderOpenLine, fill: Icons.RiFolderOpenFill },
  RotateCcw: { line: Icons.RiRestartLine, fill: Icons.RiRestartFill },
  Trash2: { line: Icons.RiDeleteBin7Line, fill: Icons.RiDeleteBin7Fill },
  Sparkles: { line: Icons.RiSparkling2Line, fill: Icons.RiSparkling2Fill },
  Globe: { line: Icons.RiGlobalLine, fill: Icons.RiGlobalFill },
  Cpu: { line: Icons.RiCpuLine, fill: Icons.RiCpuFill },
  ScrollText: { line: Icons.RiFileTextLine, fill: Icons.RiFileTextFill },
  PenTool: { line: Icons.RiPenNibLine, fill: Icons.RiPenNibFill },
  Shuffle: { line: Icons.RiShuffleLine, fill: Icons.RiShuffleFill },
  Reset: { line: Icons.RiRestartLine, fill: Icons.RiRestartFill },
  ShuffleLine: { line: Icons.RiShuffleLine, fill: Icons.RiShuffleLine },
  RefreshLine: { line: Icons.RiRefreshLine, fill: Icons.RiRefreshLine },
};

export function ManagedIcon({ name, filled, ...props }: IconProps) {
  const meta = iconMap[name];
  if (!meta) return null;
  const IconComponent = filled ? meta.fill : meta.line;
  return <IconComponent {...props} />;
}
