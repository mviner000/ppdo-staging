// app/components/Spreadsheet/hooks/useSpreadsheetShortcuts.ts

import { useEffect } from "react";

interface UseSpreadsheetShortcutsProps {
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
}

/**
 * Hook to handle spreadsheet keyboard shortcuts
 * Prevents browser default shortcuts when spreadsheet is active
 */
export function useSpreadsheetShortcuts({
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
}: UseSpreadsheetShortcutsProps) {
  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      
      // Don't trigger if user is editing a cell or in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Prevent browser shortcuts that conflict with spreadsheet functionality
      // Like Google Sheets does
      
      // Ctrl/Cmd + R (Reload) - prevent and do nothing (or could implement custom action)
      if (isMod && e.key.toLowerCase() === 'r' && !e.shiftKey) {
        e.preventDefault();
        return;
      }
      
      // Ctrl/Cmd + P (Print) - prevent
      if (isMod && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        return;
      }
      
      // Ctrl/Cmd + F (Find) - prevent (you could implement custom find later)
      if (isMod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        return;
      }
      
      // Ctrl/Cmd + H (History/Replace) - prevent
      if (isMod && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        return;
      }
      
      // Ctrl/Cmd + S (Save) - prevent
      if (isMod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return;
      }
      
      // Ctrl/Cmd + O (Open) - prevent
      if (isMod && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        return;
      }
      
      // Ctrl/Cmd + N (New Window) - prevent
      if (isMod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        return;
      }
      
      // Ctrl/Cmd + W (Close Tab) - prevent
      if (isMod && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        return;
      }

      // Spreadsheet-specific shortcuts
      
      // Ctrl/Cmd + Shift + L - Align Left
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        onAlignLeft();
        return;
      }
      
      // Ctrl/Cmd + Shift + E - Align Center
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        onAlignCenter();
        return;
      }
      
      // Ctrl/Cmd + Shift + R - Align Right
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        onAlignRight();
        return;
      }
    };

    // Add listener to window
    window.addEventListener("keydown", handleKeyboardShortcut);
    
    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, [onAlignLeft, onAlignCenter, onAlignRight]);
}