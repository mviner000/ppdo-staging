// app/(extra)/canvas/_components/editor/hooks/useKeyboard.ts

import { useEffect } from 'react';

interface UseKeyboardProps {
  selectedElementId: string | null;
  isEditingElementId: string | null;
  onDeleteElement: (id: string) => void;
  onToggleRuler?: () => void;
}

export const useKeyboard = ({
  selectedElementId,
  isEditingElementId,
  onDeleteElement,
  onToggleRuler,
}: UseKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle ruler with Ctrl+Shift+R
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        onToggleRuler?.();
        return;
      }

      if (isEditingElementId) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        onDeleteElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingElementId, selectedElementId, onDeleteElement, onToggleRuler]);
};