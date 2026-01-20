// app/components/Spreadsheet/hooks/useSpreadsheetState.ts

import { useState, useCallback } from "react";
import { CellPosition, CellData } from "../types";
import { getCellKey } from "../utils/formatting";

/**
 * Hook to manage spreadsheet state
 * Supports both viewer and editor modes
 */
export function useSpreadsheetState(columns: string[], totalRowNumber: number) {
  const [selectedCell, setSelectedCell] = useState<CellPosition>({ row: 1, col: 0 });
  const [cellData, setCellData] = useState<CellData>({});
  const [formulaBarValue, setFormulaBarValue] = useState("");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleCellClick = useCallback((row: number, col: number) => {
    // Don't allow selecting total row for editing
    setSelectedCell({ row, col });
    const cellKey = getCellKey(row, col, columns);
    setFormulaBarValue(cellData[cellKey] || "");
    setEditingCell(null);
  }, [cellData, columns]);

  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    // Don't allow editing total row
    if (row === totalRowNumber) return;
    
    const cellKey = getCellKey(row, col, columns);
    setEditingCell(cellKey);
  }, [columns, totalRowNumber]);

  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    const cellKey = getCellKey(row, col, columns);
    setCellData(prev => ({ ...prev, [cellKey]: value }));
    setFormulaBarValue(value);
  }, [columns]);

  const handleFormulaBarChange = useCallback((value: string) => {
    setFormulaBarValue(value);
    const cellKey = getCellKey(selectedCell.row, selectedCell.col, columns);
    setCellData(prev => ({ ...prev, [cellKey]: value }));
  }, [selectedCell.row, selectedCell.col, columns]);

  const handleEditingCellChange = useCallback((cell: string | null) => {
    setEditingCell(cell);
  }, []);

  return {
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
  };
}