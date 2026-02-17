import { useCallback, useMemo } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { AutoSizer, type AutoSizerChildProps } from "react-virtualized-auto-sizer";
import { FontCard } from "./FontCard";

interface Font {
  id: number;
  family: string;
  subfamily: string;
  file_path: string;
  metadata_json: string;
}

interface FontGridProps {
  fonts: Font[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  fontSize: number;
  previewText: string;
  features?: Record<string, boolean>;
  onFontsChange?: () => void;
}

export function FontGrid({
  fonts,
  selectedId,
  onSelect,
  fontSize,
  previewText,
  features = {},
  onFontsChange,
}: FontGridProps) {
  const itemData = useMemo(
    () => ({
      fonts,
      selectedId,
      onSelect,
      fontSize,
      previewText,
      features,
      onFontsChange,
    }),
    [
      fonts,
      selectedId,
      onSelect,
      fontSize,
      previewText,
      features,
      onFontsChange,
    ]
  );

  const itemKey = useCallback(
    ({
      rowIndex,
      columnIndex,
      data,
    }: {
      rowIndex: number;
      columnIndex: number;
      data: typeof itemData & { columnCount: number };
    }) => {
      const index = rowIndex * data.columnCount + columnIndex;
      const font = data.fonts[index];
      return font ? font.id : `empty-${rowIndex}-${columnIndex}`;
    },
    []
  );

  const renderGrid = useCallback(
    ({ height, width }: AutoSizerChildProps) => {
      if (!height || !width) return null;

      // Account for scrollbar width (typically 15-17px on Windows)
      const scrollbarWidth = 17;
      const availableWidth = width - scrollbarWidth;

      const minColumnWidth = 300;
      const columnCount = Math.floor(availableWidth / minColumnWidth) || 1;
      const columnWidth = Math.floor(availableWidth / columnCount);
      const rowCount = Math.ceil(fonts.length / columnCount);
      const rowHeight = 320;

      const gridData = {
        ...itemData,
        columnCount,
      };

      return (
        <Grid
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowCount={rowCount}
          rowHeight={rowHeight}
          height={height}
          width={width}
          itemData={gridData}
          itemKey={itemKey}
          overscanRowCount={2}
          overscanColumnCount={1}
        >
          {Cell}
        </Grid>
      );
    },
    [fonts.length, itemData, itemKey]
  );

  if (fonts.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        <div className="text-center">
          <p>No fonts found.</p>
          <p className="text-sm">Click "Scan" to index your system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 min-w-0">
      <AutoSizer
        style={{ height: "100%", width: "100%" }}
        ChildComponent={renderGrid}
      />
    </div>
  );
}

const Cell = ({ columnIndex, rowIndex, style, data }: any) => {
  const {
    fonts,
    columnCount,
    selectedId,
    onSelect,
    fontSize,
    previewText,
    features,
    onFontsChange,
  } = data;
  const index = rowIndex * columnCount + columnIndex;

  if (index >= fonts.length) {
    return null;
  }

  const font = fonts[index];

  return (
    <div style={style} className="px-3 py-3">
      <FontCard
        font={font}
        isSelected={selectedId === font.id}
        onClick={() => onSelect(font.id)}
        previewText={previewText}
        fontSize={fontSize}
        features={features}
        onFontsChange={onFontsChange}
      />
    </div>
  );
};
