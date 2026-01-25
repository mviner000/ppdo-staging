// app/dashboard/components/print/GenericPrintPreviewModal.tsx
/**
 * Generic Print Preview Modal - Reusable across domains
 * Works with any PrintDataAdapter to convert domain-specific data to print format
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { PrintPreviewToolbar } from '@/components/ppdo/table/print-preview/PrintPreviewToolbar';
import { ConfirmationModal } from '@/app/dashboard/project/[year]/components/BudgetConfirmationModal';
import { convertTableToCanvas } from '@/lib/print-canvas/tableToCanvas';
import { printAllPages } from '@/lib/print';
import { PrintDraft, ColumnDefinition, BudgetTotals, RowMarker } from '@/lib/print-canvas/types';
import { Page, HeaderFooter, ImageElement, CanvasElement } from '@/app/(extra)/canvas/_components/editor/types';
import { PrintDataAdapter } from '@/lib/print/adapters/types';
import { usePrintClipboard } from '@/app/(extra)/canvas/_components/editor/hooks/usePrintClipboard';
import { getPageDimensions } from '@/app/(extra)/canvas/_components/editor/constants';

// ✅ Import the actual canvas components we need
import Toolbar from '@/app/(extra)/canvas/_components/editor/toolbar';
import Canvas from '@/app/(extra)/canvas/_components/editor/canvas';
import PagePanel from '@/app/(extra)/canvas/_components/editor/page-panel';
import BottomPageControls from '@/app/(extra)/canvas/_components/editor/bottom-page-controls';

interface GenericPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  adapter: PrintDataAdapter;
  existingDraft?: PrintDraft | null;
  onDraftSaved?: (draft: PrintDraft) => void;
  hiddenColumns?: Set<string>;
  filterState?: {
    searchQuery: string;
    statusFilter: string[];
    yearFilter: number[];
    sortField: string | null;
    sortDirection: string | null;
  };
}

type ActiveSection = 'header' | 'page' | 'footer';

export function GenericPrintPreviewModal({
  isOpen,
  onClose,
  adapter,
  existingDraft,
  onDraftSaved,
  hiddenColumns = new Set(),
  filterState = {
    searchQuery: '',
    statusFilter: [],
    yearFilter: [],
    sortField: null,
    sortDirection: null,
  },
}: GenericPrintPreviewModalProps) {

  // ✅ Canvas state - initialized in useEffect
  const [pages, setPages] = useState<Page[]>([]);
  const [header, setHeader] = useState<HeaderFooter>({ elements: [] });
  const [footer, setFooter] = useState<HeaderFooter>({ elements: [] });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isEditingElementId, setIsEditingElementId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('page');

  // Draft state
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(true);

  // Document metadata
  const [documentTitle, setDocumentTitle] = useState<string>('');

  // 🔧 Initialize canvas from adapter data or existing draft
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (existingDraft) {
      setPages(existingDraft.canvasState.pages);
      setHeader(existingDraft.canvasState.header);
      setFooter(existingDraft.canvasState.footer);
      setCurrentPageIndex(existingDraft.canvasState.currentPageIndex);
      setLastSavedTime(existingDraft.timestamp);
      setDocumentTitle(existingDraft.documentTitle || 'Untitled Document');
      setIsDirty(false);
    } else {
      try {
        const printableData = adapter.toPrintableData();
        const columns = adapter.getColumnDefinitions();
        const rowMarkers = adapter.getRowMarkers?.();

        // Convert column definitions to the format expected by convertTableToCanvas
        const convertedColumns: ColumnDefinition[] = columns.map(col => ({
          key: col.key,
          label: col.label,
          align: col.align,
          sortable: col.sortable,
          filterable: col.filterable,
        }));

        const result = convertTableToCanvas({
          items: printableData.items as any,
          totals: (printableData.totals || {}) as unknown as BudgetTotals,
          columns: convertedColumns,
          hiddenColumns,
          pageSize: 'A4',
          orientation: 'portrait',
          includeHeaders: true,
          includeTotals: true,
          title: printableData.metadata?.title || 'Print Preview',
          subtitle: printableData.metadata?.subtitle,
          rowMarkers: (rowMarkers as RowMarker[] | undefined) || [],
        });

        // ✅ Set the converted pages to state
        setPages(result.pages);
        setHeader(result.header);
        setFooter(result.footer);
        setCurrentPageIndex(0);
        setDocumentTitle(printableData.metadata?.title || 'Untitled Document');
        setIsDirty(false);

        toast.success(`Generated ${result.metadata.totalPages} page(s) from ${result.metadata.totalRows} row(s)`);
      } catch (error) {
        console.error('Failed to convert adapter data to canvas:', error);
        toast.error('Failed to convert table to canvas');
      }
    }
  }, [isOpen, adapter, existingDraft, hiddenColumns]);

  // Save draft handler
  const handleSaveDraft = useCallback(() => {
    if (!onDraftSaved) return;

    setIsSaving(true);

    const dataIdentifier = adapter.getDataIdentifier?.() || 'print-draft';

    const draft: PrintDraft = {
      id: `draft-${dataIdentifier}-${Date.now()}`,
      timestamp: existingDraft?.timestamp || Date.now(),
      lastModified: Date.now(),
      documentTitle: documentTitle || 'Untitled Document',
      budgetYear: 0, // Generic - can be overridden by adapter if needed
      budgetParticular: undefined,
      filterState: {
        ...filterState,
        hiddenColumns: Array.from(hiddenColumns),
      },
      canvasState: {
        pages,
        currentPageIndex,
        header,
        footer,
      },
      tableSnapshot: {
        items: adapter.toPrintableData().items as any,
        totals: (adapter.toPrintableData().totals || {}) as unknown as BudgetTotals,
        columns: adapter.getColumnDefinitions().map(col => ({
          key: col.key,
          label: col.label,
          align: col.align,
          sortable: col.sortable,
          filterable: col.filterable,
        })),
      },
    };

    try {
      onDraftSaved(draft);
      setLastSavedTime(Date.now());
      setIsDirty(false);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [adapter, pages, header, footer, currentPageIndex, hiddenColumns, filterState, onDraftSaved, existingDraft, documentTitle]);

  // 🆕 Handler to add pasted image to canvas
  const handleAddImage = useCallback((
    element: ImageElement,
    section: 'header' | 'page' | 'footer'
  ) => {
    setIsDirty(true);

    if (section === 'header') {
      setHeader(prev => ({
        ...prev,
        elements: [...prev.elements, element],
      }));
    } else if (section === 'footer') {
      setFooter(prev => ({
        ...prev,
        elements: [...prev.elements, element],
      }));
    } else {
      // Add to current page
      setPages(prev => prev.map((page, idx) =>
        idx === currentPageIndex
          ? { ...page, elements: [...page.elements, element] }
          : page
      ));
    }

    // Select the newly added image
    setSelectedElementId(element.id);
  }, [currentPageIndex]);

  // 🆕 Integrate clipboard hook for image paste support
  const currentPage = pages[currentPageIndex] || { id: 'empty', size: 'A4', elements: [] };
  const pageSize = getPageDimensions(currentPage.size, currentPage.orientation);

  usePrintClipboard({
    isOpen,
    currentPage,
    selectedElementId,
    isEditingElementId,
    onAddImage: handleAddImage,
    activeSection,
    pageSize,
  });

  // Print handler (used by canvas toolbar)
  const handlePrint = useCallback(() => {
    try {
      printAllPages(pages, header, footer);
    } catch (error) {
      console.error('Failed to print:', error);
      toast.error('Failed to print');
    }
  }, [pages, header, footer]);

  // Close handler
  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Canvas handlers
  const updateElement = useCallback((id: string, updates: any) => {
    const isInHeader = header.elements.some(el => el.id === id);
    if (isInHeader) {
      setHeader(prev => ({
        ...prev,
        elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el)
      }));
      setIsDirty(true);
      return;
    }

    const isInFooter = footer.elements.some(el => el.id === id);
    if (isInFooter) {
      setFooter(prev => ({
        ...prev,
        elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el)
      }));
      setIsDirty(true);
      return;
    }

    setPages(prev => prev.map((page, idx) =>
      idx === currentPageIndex
        ? { ...page, elements: page.elements.map(el => el.id === id ? { ...el, ...updates } : el) }
        : page
    ));
    setIsDirty(true);
  }, [currentPageIndex, header, footer]);

  const deleteElement = useCallback((id: string) => {
    const isInHeader = header.elements.some(el => el.id === id);
    if (isInHeader) {
      setHeader(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== id)
      }));
      setSelectedElementId(null);
      setIsDirty(true);
      return;
    }

    const isInFooter = footer.elements.some(el => el.id === id);
    if (isInFooter) {
      setFooter(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== id)
      }));
      setSelectedElementId(null);
      setIsDirty(true);
      return;
    }

    setPages(prev => prev.map((page, idx) =>
      idx === currentPageIndex
        ? { ...page, elements: page.elements.filter(el => el.id !== id) }
        : page
    ));
    setSelectedElementId(null);
    setIsDirty(true);
  }, [currentPageIndex, header, footer]);

  // Element operations
  const changePageSize = useCallback((size: 'A4' | 'Short' | 'Long') => {
    setPages(prev => prev.map(page => ({ ...page, size })));
    setIsDirty(true);
  }, []);

  const changeOrientation = useCallback((orientation: 'portrait' | 'landscape') => {
    setPages(prev => prev.map(page => ({ ...page, orientation })));
    setIsDirty(true);
  }, []);

  // Format last saved time
  const formattedLastSaved = lastSavedTime
    ? formatTimestamp(lastSavedTime)
    : '';

  // Handle document title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setDocumentTitle(newTitle);
      setIsDirty(true);
    },
    []
  );

  if (!isOpen) return null;

  // Combine all elements for layer panel
  const allElements = [
    ...header.elements.map(el => ({ ...el, section: 'header' as const })),
    ...currentPage.elements.map(el => ({ ...el, section: 'page' as const })),
    ...footer.elements.map(el => ({ ...el, section: 'footer' as const })),
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col">
        {/* Toolbar */}
        <PrintPreviewToolbar
          documentTitle={documentTitle}
          onTitleChange={handleTitleChange}
          isDirty={isDirty}
          isSaving={isSaving}
          lastSavedTime={formattedLastSaved}
          onBack={handleClose}
          onClose={handleClose}
          onSaveDraft={handleSaveDraft}
          isEditorMode={isEditorMode}
          onEditorModeChange={setIsEditorMode}
        />

        {/* Canvas Editor Area */}
        <div className="flex-1 overflow-y-auto bg-stone-50" style={{ marginRight: '192px' }}>
          {/* Toolbar for canvas editing */}
          <div className="sticky top-0 z-10 bg-stone-100 border-b border-stone-300 shadow-sm">
            <Toolbar
              selectedElement={currentPage.elements.find(el => el.id === selectedElementId)}
              onUpdateElement={selectedElementId ? (updates) => updateElement(selectedElementId, updates) : undefined}
              onAddText={() => {/* Add text logic */ }}
              pageSize={currentPage.size}
              orientation={currentPage.orientation}
              onPageSizeChange={changePageSize}
              onOrientationChange={changeOrientation}
              onPrint={handlePrint}
              activeSection={activeSection}
              headerBackgroundColor={header.backgroundColor || '#ffffff'}
              footerBackgroundColor={footer.backgroundColor || '#ffffff'}
              pageBackgroundColor={currentPage.backgroundColor || '#ffffff'}
              onHeaderBackgroundChange={(color) => setHeader(prev => ({ ...prev, backgroundColor: color }))}
              onFooterBackgroundChange={(color) => setFooter(prev => ({ ...prev, backgroundColor: color }))}
              onPageBackgroundChange={(color) => setPages(prev => prev.map((p, i) => i === currentPageIndex ? { ...p, backgroundColor: color } : p))}
              pages={pages}
              header={header}
              footer={footer}
            />
          </div>

          {/* Canvas */}
          <div className="flex items-center justify-center pt-4 pb-16 px-8 min-h-full">
            <Canvas
              page={currentPage}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
              isEditingElementId={isEditingElementId}
              onEditingChange={setIsEditingElementId}
              header={header}
              footer={footer}
              pageNumber={currentPageIndex + 1}
              totalPages={pages.length}
              activeSection={activeSection}
              onActiveSectionChange={setActiveSection}
            />
          </div>
        </div>

        {/* Page Panel (right side) */}
        <div className="fixed right-0 top-0 bottom-0 w-48">
          <PagePanel
            pages={pages}
            currentPageIndex={currentPageIndex}
            onPageSelect={setCurrentPageIndex}
            onAddPage={() => {/* Add page logic */ }}
            onReorderPages={(from, to) => {/* Reorder logic */ }}
          />
        </div>

        {/* Bottom Controls */}
        <BottomPageControls
          currentPageIndex={currentPageIndex}
          totalPages={pages.length}
          onAddPage={() => {/* Add page logic */ }}
          onDuplicatePage={() => {/* Duplicate logic */ }}
          onDeletePage={() => {/* Delete logic */ }}
          elements={allElements}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={updateElement}
          onReorderElements={(from, to) => {/* Reorder elements */ }}
          onPreviousPage={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
          onNextPage={() => setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1))}
        />
      </div>

      {/* Close Confirmation */}
      <ConfirmationModal
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={() => {
          handleSaveDraft();
          setTimeout(() => onClose(), 100);
        }}
        title="Save Print Preview as Draft?"
        message="You have unsaved changes. Save them for later?"
        confirmText="Save & Close"
        cancelText="Discard & Close"
        variant="default"
      />
    </>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
