// app/dashboard/canvas/_components/editor/hooks/useKeyboard.ts

import { useEffect } from 'react';

interface UseKeyboardProps {
  selectedElementId: string | null;
  isEditingElementId: string | null;
  onDeleteElement: (id: string) => void;
}

export const useKeyboard = ({
  selectedElementId,
  isEditingElementId,
  onDeleteElement,
}: UseKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingElementId) return;
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        onDeleteElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingElementId, selectedElementId, onDeleteElement]);
};