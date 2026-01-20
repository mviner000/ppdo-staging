// app/components/Spreadsheet/SpreadsheetContainer.tsx

"use client";

import { useMemo, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { SpreadsheetHeader } from "./SpreadsheetHeader";
import { SpreadsheetMenuBar } from "./SpreadsheetMenuBar";
import { SpreadsheetFormulaBar } from "./SpreadsheetFormulaBar";
import { SpreadsheetGrid } from "./SpreadsheetGrid";
import { SpreadsheetSheetTabs } from "./SpreadsheetSheetTabs";
import { ExportModal } from "./ExportModal";
import { useSpreadsheetData } from "./hooks/useSpreadsheetData";
import { useSpreadsheetState } from "./hooks/useSpreadsheetState";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { useColumnResize } from "./hooks/useColumnResize";
import { useSpreadsheetShortcuts } from "./hooks/useSpreadsheetShortcuts";
import { SpreadsheetContainerProps } from "./types";
import { 
  generateColumnLetters, 
  getCellKey, 
  formatValue,
  formatCurrency 
} from "./utils/formatting";
import { 
  calculateTotals, 
  calculateRowTotal, 
  calculateGrandTotal 
} from "./utils/cellCalculations";
import { exportToCSV } from "./utils/exportUtils";
import { transformText } from "./utils/textTransform";

export function SpreadsheetContainer({ config, filters }: SpreadsheetContainerProps) {
  const params = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get year from URL params
  const selectedYear = useMemo(() => {
    const yearParam = params?.year as string;
    return yearParam ? parseInt(yearParam) : undefined;
  }, [params]);

  // Fetch ALL data (no limit, infinite scroll)
  const { data: rawData, isLoading } = useSpreadsheetData(config, {
    ...filters,
    ...(selectedYear ? { year: selectedYear } : {})
  });

  // Filter by year if specified in URL
  const data = useMemo(() => {
    if (!rawData) return [];
    if (selectedYear && !filters?.year) {
      return rawData.filter((item: any) => item.year === selectedYear);
    }
    return rawData;
  }, [rawData, selectedYear, filters]);

  // Calculate totals
  const totals = useMemo(() => calculateTotals(data, config.columns), [data, config.columns]);

  // Dynamic column count
  const totalColumns = config.features.showTotalsColumn 
    ? config.columns.length + 1 
    : config.columns.length;

  const COLUMNS = useMemo(() => generateColumnLetters(totalColumns), [totalColumns]);

  // Row calculations
  const dataRows = data.length;
  const totalRowNumber = config.features.showTotalsRow ? dataRows + 1 : dataRows;
  const rows = useMemo(() => 
    Array.from({ length: totalRowNumber }, (_, i) => i + 1), 
    [totalRowNumber]
  );

  // Column headers
  const columnHeaders = useMemo(() => {
    const headers = config.columns.map(c => c.label);
    if (config.features.showTotalsColumn) {
      headers.push("TOTAL");
    }
    return headers;
  }, [config.columns, config.features.showTotalsColumn]);

  // Column resize hook
  const {
    columnWidths,
    columnAlignments,
    handleResizeStart,
    handleDoubleClickResize,
    updateColumnAlignment,
  } = useColumnResize(COLUMNS, data, config.columns);

  // State management
  const {
    selectedCell,
    cellData,
    formulaBarValue,
    editingCell,
    showExportModal,
    setCellData,
    setShowExportModal,
    handleCellClick,
    handleCellDoubleClick,
    handleCellChange,
    handleFormulaBarChange,
    handleEditingCellChange,
  } = useSpreadsheetState(COLUMNS, totalRowNumber);

  // Keyboard navigation (respects viewMode)
  useKeyboardNavigation({
    selectedCell,
    editingCell: config.features.viewMode === "editor" ? editingCell : null,
    totalColumns,
    dataRows,
    totalRowNumber,
    columns: COLUMNS,
    onCellClick: handleCellClick,
    onCellChange: config.features.viewMode === "editor" ? handleCellChange : () => {},
    onEditingCellChange: config.features.viewMode === "editor" ? handleEditingCellChange : () => {},
  });

  // Spreadsheet shortcuts (prevents browser shortcuts like Ctrl+R)
  useSpreadsheetShortcuts({
    onAlignLeft: () => updateColumnAlignment(selectedCell.col, "left"),
    onAlignCenter: () => updateColumnAlignment(selectedCell.col, "center"),
    onAlignRight: () => updateColumnAlignment(selectedCell.col, "right"),
  });

  // Initialize cell data from fetched data
  useEffect(() => {
    const newCellData: Record<string, string> = {};
    
    // Populate data rows
    data.forEach((item: any, index: number) => {
      const row = index + 1;
      
      config.columns.forEach((col, colIndex) => {
        const cellKey = getCellKey(row, colIndex, COLUMNS);
        const value = item[col.key];
        newCellData[cellKey] = formatValue(value, col.type);
      });
      
      // Add row total if enabled
      if (config.features.showTotalsColumn) {
        const rowTotal = calculateRowTotal(item, config.columns);
        const totalColIndex = config.columns.length;
        const totalCellKey = getCellKey(row, totalColIndex, COLUMNS);
        newCellData[totalCellKey] = formatCurrency(rowTotal);
      }
    });
    
    // Populate TOTALS row if enabled
    if (config.features.showTotalsRow) {
      config.columns.forEach((col, colIndex) => {
        const cellKey = getCellKey(totalRowNumber, colIndex, COLUMNS);
        
        if (colIndex === 0) {
          newCellData[cellKey] = "TOTAL";
        } else if (col.key === "year" || col.key === "status") {
          newCellData[cellKey] = "";
        } else if (col.type === "currency" || col.type === "number" || col.type === "percentage") {
          newCellData[cellKey] = formatValue(totals[col.key] || 0, col.type);
        } else {
          newCellData[cellKey] = "";
        }
      });
      
      // Grand total if both row and column totals are enabled
      if (config.features.showTotalsColumn) {
        const grandTotal = calculateGrandTotal(totals, config.columns);
        const grandTotalKey = getCellKey(totalRowNumber, config.columns.length, COLUMNS);
        newCellData[grandTotalKey] = formatCurrency(grandTotal);
      }
    }
    
    setCellData(newCellData);
  }, [data, config.columns, COLUMNS, totalRowNumber, totals, config.features, setCellData]);

  // Export handler
  const handleExportCSV = () => {
    const filename = `${config.tableName}_${selectedYear || "all"}_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(data, config.columns, totals, filename);
    setShowExportModal(false);
  };

  // Text transform handler - ONLY for text columns
  const handleTextTransform = (transform: "uppercase" | "lowercase" | "camelCase" | "reset") => {
    const colIndex = selectedCell.col;
    
    // Check if the selected column is a text column
    const columnDef = config.columns[colIndex];
    if (!columnDef || columnDef.type !== "text") {
      return; // Don't transform non-text columns
    }
    
    setCellData((prevData) => {
      const newData = { ...prevData };
      
      // Transform all cells in the selected column (except total row)
      rows.forEach((row) => {
        if (row === totalRowNumber) return; // Skip total row
        
        const cellKey = getCellKey(row, colIndex, COLUMNS);
        const currentValue = newData[cellKey];
        
        if (currentValue) {
          newData[cellKey] = transformText(currentValue, transform);
        }
      });
      
      return newData;
    });
  };

  // Get selected column type
  const selectedColumnType = useMemo(() => {
    if (selectedCell.col >= config.columns.length) {
      return "currency"; // Total column
    }
    return config.columns[selectedCell.col]?.type || "text";
  }, [selectedCell.col, config.columns]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9fbfd]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading spreadsheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f9fbfd]" ref={containerRef}>
      <SpreadsheetHeader
        title={config.title}
        selectedYear={selectedYear}
        dataRows={dataRows}
        columns={COLUMNS}
        detectedColumns={config.columns}
      />

      <SpreadsheetMenuBar
        onExport={config.features.enableExport ? () => setShowExportModal(true) : undefined}
        selectedColumn={selectedCell.col}
        selectedColumnType={selectedColumnType}
        columnAlignment={columnAlignments[selectedCell.col]}
        onAlignmentChange={(alignment) => updateColumnAlignment(selectedCell.col, alignment)}
        onTextTransform={handleTextTransform}
      />

      <SpreadsheetFormulaBar
        selectedCell={selectedCell}
        formulaBarValue={formulaBarValue}
        columns={COLUMNS}
        onFormulaBarChange={handleFormulaBarChange}
        viewMode={config.features.viewMode}
      />

      <SpreadsheetGrid
        columns={COLUMNS}
        rows={rows}
        columnHeaders={columnHeaders}
        selectedCell={selectedCell}
        cellData={cellData}
        editingCell={config.features.viewMode === "editor" ? editingCell : null}
        totalRowNumber={totalRowNumber}
        columnWidths={columnWidths}
        columnAlignments={columnAlignments}
        onCellClick={handleCellClick}
        onCellDoubleClick={config.features.viewMode === "editor" ? handleCellDoubleClick : () => {}}
        onCellChange={config.features.viewMode === "editor" ? handleCellChange : () => {}}
        onEditingCellChange={config.features.viewMode === "editor" ? handleEditingCellChange : () => {}}
        onResizeStart={handleResizeStart}
        onDoubleClickResize={handleDoubleClickResize}
        containerRef={containerRef}
      />

      <SpreadsheetSheetTabs />

      {config.features.enableExport && showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExportCSV}
          selectedYear={selectedYear}
          dataRows={dataRows}
          detectedColumns={config.columns}
          totals={totals}
        />
      )}
    </div>
  );
}