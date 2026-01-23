// app/dashboard/canvas/_components/editor/hooks/useClipboard.ts

import { useEffect } from 'react';
import { CanvasElement, Page, HeaderFooter } from '../types';

type ActiveSection = 'header' | 'page' | 'footer';

interface UseClipboardProps {
  currentPage: Page;
  selectedElementId: string | null;
  isEditingElementId: string | null;
  onAddImage: (src: string, section?: ActiveSection) => void;
  activeSection: ActiveSection;
  header: HeaderFooter;
  footer: HeaderFooter;
}

export const useClipboard = ({
  currentPage,
  selectedElementId,
  isEditingElementId,
  onAddImage,
  activeSection,
  header,
  footer,
}: UseClipboardProps) => {
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (isEditingElementId) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const src = event.target?.result as string;
              if (src) {
                // Add image to the currently active section
                onAddImage(src, activeSection);
              }
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (isEditingElementId || !selectedElementId) return;
      
      e.preventDefault();
      
      // Find element in the appropriate section
      let element: CanvasElement | undefined;
      
      element = currentPage.elements.find(el => el.id === selectedElementId);
      if (!element) {
        element = header.elements.find(el => el.id === selectedElementId);
      }
      if (!element) {
        element = footer.elements.find(el => el.id === selectedElementId);
      }
      
      if (element) {
        localStorage.setItem('canvas-clipboard', JSON.stringify(element));
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('copy', handleCopy);
    
    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('copy', handleCopy);
    };
  }, [isEditingElementId, selectedElementId, currentPage, onAddImage, activeSection, header, footer]);
};