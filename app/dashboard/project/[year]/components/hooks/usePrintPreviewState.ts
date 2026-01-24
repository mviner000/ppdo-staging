// app/dashboard/project/[year]/components/hooks/usePrintPreviewState.ts (NEW FILE)

import { useState, useCallback } from 'react';
import { Page, HeaderFooter } from '@/app/(extra)/canvas/_components/editor/types';
import { CanvasTemplate } from '@/app/(extra)/canvas/_components/editor/types/template';

type ActiveSection = 'header' | 'page' | 'footer';

export function usePrintPreviewState() {
  // Canvas state
  const [pages, setPages] = useState<Page[]>([]);
  const [header, setHeader] = useState<HeaderFooter>({ elements: [] });
  const [footer, setFooter] = useState<HeaderFooter>({ elements: [] });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isEditingElementId, setIsEditingElementId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('page');

  // Template state
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState<CanvasTemplate | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Draft state
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const currentPage = pages[currentPageIndex] || {
    id: 'empty',
    size: 'A4' as const,
    orientation: 'portrait' as const,
    elements: [],
    backgroundColor: '#ffffff',
  };

  const selectedElement =
    currentPage.elements.find((el) => el.id === selectedElementId) ||
    header.elements.find((el) => el.id === selectedElementId) ||
    footer.elements.find((el) => el.id === selectedElementId);

  const allElements = [
    ...header.elements.map((el) => ({ ...el, section: 'header' as const })),
    ...currentPage.elements.map((el) => ({ ...el, section: 'page' as const })),
    ...footer.elements.map((el) => ({ ...el, section: 'footer' as const })),
  ];

  return {
    // Canvas state
    pages,
    setPages,
    header,
    setHeader,
    footer,
    setFooter,
    currentPageIndex,
    setCurrentPageIndex,
    selectedElementId,
    setSelectedElementId,
    selectedGroupId,
    setSelectedGroupId,
    isEditingElementId,
    setIsEditingElementId,
    activeSection,
    setActiveSection,
    
    // Template state
    showTemplateSelector,
    setShowTemplateSelector,
    appliedTemplate,
    setAppliedTemplate,
    hasInitialized,
    setHasInitialized,
    
    // Draft state
    isDirty,
    setIsDirty,
    isSaving,
    setIsSaving,
    lastSavedTime,
    setLastSavedTime,
    showCloseConfirm,
    setShowCloseConfirm,
    
    // Computed values
    currentPage,
    selectedElement,
    allElements,
  };
}