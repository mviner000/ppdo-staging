// app/dashboard/project/[year]/components/PrintPreviewModal.tsx (ROBUST FIX)

'use client';

import { useCallback, useState, useEffect } from 'react';
import { PrintPreviewToolbar } from './PrintPreviewToolbar';
import { ConfirmationModal } from './ConfirmationModal';
import { TemplateSelector } from './TemplateSelector';
import { TemplateApplicationModal } from './TemplateApplicationModal';
import { PrintDraft, ColumnDefinition, BudgetTotals, RowMarker } from '@/lib/print-canvas/types';
import { BudgetItem } from '@/app/dashboard/project/[year]/types';
import { CanvasTemplate } from '@/app/(extra)/canvas/_components/editor/types/template';

// Canvas components
import Toolbar from '@/app/(extra)/canvas/_components/editor/toolbar';
import Canvas from '@/app/(extra)/canvas/_components/editor/canvas';
import PagePanel from '@/app/(extra)/canvas/_components/editor/page-panel';
import BottomPageControls from '@/app/(extra)/canvas/_components/editor/bottom-page-controls';

// Custom hooks
import { usePrintPreviewState } from './hooks/usePrintPreviewState';
import { usePrintPreviewActions } from './hooks/usePrintPreviewActions';
import { usePrintPreviewDraft } from './hooks/usePrintPreviewDraft';
import { convertTableToCanvas } from '@/lib/print-canvas/tableToCanvas';
import { mergeTemplateWithCanvas } from '@/lib/canvas-utils/mergeTemplate';
import { toast } from 'sonner';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetItems: BudgetItem[];
  totals: BudgetTotals;
  columns: ColumnDefinition[];
  hiddenColumns: Set<string>;
  filterState: {
    searchQuery: string;
    statusFilter: string[];
    yearFilter: number[];
    sortField: string | null;
    sortDirection: string | null;
  };
  year: number;
  particular?: string;
  existingDraft?: PrintDraft | null;
  onDraftSaved?: (draft: PrintDraft) => void;
  rowMarkers?: RowMarker[];
}

export function PrintPreviewModal({
  isOpen,
  onClose,
  budgetItems,
  totals,
  columns,
  hiddenColumns,
  filterState,
  year,
  particular,
  existingDraft,
  onDraftSaved,
  rowMarkers,
}: PrintPreviewModalProps) {
  // State management
  const state = usePrintPreviewState();

  // Viewer/Editor mode state (default to viewer mode)
  const [isEditorMode, setIsEditorMode] = useState(false);

  // Loading state for template application
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [templateToApply, setTemplateToApply] = useState<CanvasTemplate | null | undefined>(null);

  // Template application confirmation state
  const [showTemplateApplicationModal, setShowTemplateApplicationModal] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState<CanvasTemplate | null>(null);

  // Live template application state (for "Apply Template" button)
  const [showLiveTemplateSelector, setShowLiveTemplateSelector] = useState(false);

  // Initialize from table data with optional template
  const initializeFromTableData = useCallback(
    (template?: CanvasTemplate) => {
      console.group('🎨 INITIALIZING PRINT PREVIEW');
      console.log('Template:', template);
      console.log('Template Page Background:', template?.page?.backgroundColor);

      try {
        // Convert table to canvas pages using template's page settings
        const result = convertTableToCanvas({
          items: budgetItems,
          totals,
          columns,
          hiddenColumns,
          pageSize: template?.page.size || 'A4',
          orientation: template?.page.orientation || 'portrait',
          includeHeaders: true,
          includeTotals: true,
          title: `Budget Tracking ${year}`,
          subtitle: particular ? `Particular: ${particular}` : undefined,
          rowMarkers,
        });

        console.log('📄 Generated pages:', result.pages.length);
        console.log('📄 First page background BEFORE template:', result.pages[0]?.backgroundColor);

        // Apply template if selected
        let finalPages = result.pages;
        let finalHeader = result.header;
        let finalFooter = result.footer;

        if (template) {
          console.log('🎨 Merging template with generated canvas...');

          // Use smart merge logic to combine template with generated content
          const merged = mergeTemplateWithCanvas(
            result.pages,
            result.header,
            result.footer,
            template
          );

          finalPages = merged.pages;
          finalHeader = merged.header;
          finalFooter = merged.footer;

          console.log('✅ Template merged');
          console.log('📄 First page background AFTER merge:', finalPages[0]?.backgroundColor);
          console.log('📄 Header background:', finalHeader.backgroundColor);
          console.log('📄 Footer background:', finalFooter.backgroundColor);
          console.log('📄 Header elements:', finalHeader.elements.length);
          console.log('📄 Footer elements:', finalFooter.elements.length);

          state.setAppliedTemplate(template);

          toast.success(
            `Applied template "${template.name}" to ${finalPages.length} page(s)`
          );
        } else {
          console.log('📄 No template - using default styling');
          toast.success(
            `Generated ${result.metadata.totalPages} page(s) from ${result.metadata.totalRows} row(s)`
          );
        }

        // Set final state
        console.log('💾 Setting final state...');
        state.setPages(finalPages);
        state.setHeader(finalHeader);
        state.setFooter(finalFooter);
        state.setCurrentPageIndex(0);
        state.setIsDirty(false);
        state.setHasInitialized(true);

        console.log('✅ Initialization complete');
        console.groupEnd();
      } catch (error) {
        console.error('❌ Failed to convert table to canvas:', error);
        console.groupEnd();
        toast.error('Failed to convert table to canvas');
      }
    },
    [
      budgetItems,
      totals,
      columns,
      hiddenColumns,
      year,
      particular,
      rowMarkers,
      state,
    ]
  );

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (template: CanvasTemplate | null) => {
      console.log('✅ Template selected:', template?.name || 'none');
      setTemplateToApply(template);
      // CRITICAL: Close the selector immediately after selection
      state.setShowTemplateSelector(false);
    },
    [state]
  );

  // Handle applying saved template to fresh data
  const handleApplySavedTemplate = useCallback(() => {
    if (!savedTemplate) return;

    console.log('🎯 Applying saved template to fresh data:', savedTemplate.name);
    setIsLoadingTemplate(true);

    // Small delay for smooth UI transition
    setTimeout(() => {
      // Regenerate canvas with fresh data + saved template
      initializeFromTableData(savedTemplate);

      // Store timestamp from existing draft if available
      if (existingDraft) {
        state.setLastSavedTime(existingDraft.timestamp);
      }

      setIsLoadingTemplate(false);
      setSavedTemplate(null);
    }, 500);
  }, [savedTemplate, initializeFromTableData, existingDraft, state]);

  // Handle skipping template application (load old canvas state)
  const handleSkipTemplate = useCallback(() => {
    if (!existingDraft) return;

    console.log('📄 Skipping template - loading saved canvas state...');
    state.setPages(existingDraft.canvasState.pages);
    state.setHeader(existingDraft.canvasState.header);
    state.setFooter(existingDraft.canvasState.footer);
    state.setCurrentPageIndex(existingDraft.canvasState.currentPageIndex);
    state.setLastSavedTime(existingDraft.timestamp);

    // Still restore the template reference for future saves
    if (existingDraft.appliedTemplate) {
      state.setAppliedTemplate(existingDraft.appliedTemplate);
    }

    state.setIsDirty(false);
    setSavedTemplate(null);
  }, [existingDraft, state]);

  // Handle applying template to live canvas (from toolbar button)
  const handleApplyLiveTemplate = useCallback(
    (template: CanvasTemplate | null) => {
      if (!template) {
        console.log('❌ No template selected');
        return;
      }

      console.log('🎨 Applying template to live canvas:', template.name);

      // Merge template with existing canvas content
      const merged = mergeTemplateWithCanvas(
        state.pages,
        state.header,
        state.footer,
        template
      );

      // Update state with merged content
      state.setPages(merged.pages);
      state.setHeader(merged.header);
      state.setFooter(merged.footer);
      state.setAppliedTemplate(template);
      state.setIsDirty(true);

      toast.success(`Applied template "${template.name}" to canvas`);
      setShowLiveTemplateSelector(false);
    },
    [state]
  );

  // Initialize when modal opens or template is selected
  useEffect(() => {
    if (!isOpen) {
      state.setHasInitialized(false);
      setTemplateToApply(null);
      setSavedTemplate(null);
      setShowTemplateApplicationModal(false);
      setShowLiveTemplateSelector(false);
      return;
    }

    console.log('🔄 Initialization useEffect triggered');
    console.log('  - isOpen:', isOpen);
    console.log('  - hasInitialized:', state.hasInitialized);
    console.log('  - existingDraft:', !!existingDraft);

    // Initialize from existing draft
    if (existingDraft && !state.hasInitialized) {
      console.log('📂 Loading from existing draft...');

      // Check if draft has a saved template
      if (existingDraft.appliedTemplate) {
        console.log('🎨 Draft has saved template:', existingDraft.appliedTemplate.name);
        // Show template application modal
        setSavedTemplate(existingDraft.appliedTemplate);
        setShowTemplateApplicationModal(true);
        state.setHasInitialized(true);
        return;
      }

      // No template - just load the saved canvas state
      console.log('📄 Loading saved canvas state without template...');
      state.setPages(existingDraft.canvasState.pages);
      state.setHeader(existingDraft.canvasState.header);
      state.setFooter(existingDraft.canvasState.footer);
      state.setCurrentPageIndex(existingDraft.canvasState.currentPageIndex);
      state.setLastSavedTime(existingDraft.timestamp);
      state.setIsDirty(false);
      state.setHasInitialized(true);
      return;
    }

    // Initialize from table data (NEW FLOW: Load data first, then show template selector)
    if (!existingDraft && !state.hasInitialized) {
      console.log('📊 Loading table data...');

      // Load table data immediately without template
      initializeFromTableData(undefined);

      // After data loads, show template selector modal
      setTimeout(() => {
        console.log('📋 Showing template selector after data load...');
        setShowLiveTemplateSelector(true);
      }, 600);
    }
  }, [
    isOpen,
    existingDraft,
    state.hasInitialized,
    initializeFromTableData,
    state,
  ]);

  // Canvas actions
  const actions = usePrintPreviewActions({
    currentPageIndex: state.currentPageIndex,
    header: state.header,
    footer: state.footer,
    setPages: state.setPages,
    setHeader: state.setHeader,
    setFooter: state.setFooter,
    setSelectedElementId: state.setSelectedElementId,
    setIsDirty: state.setIsDirty,
  });

  // Draft management
  const { handleSaveDraft, handlePrint, handleClose } = usePrintPreviewDraft({
    pages: state.pages,
    header: state.header,
    footer: state.footer,
    currentPageIndex: state.currentPageIndex,
    budgetItems,
    totals,
    columns,
    hiddenColumns,
    filterState,
    year,
    particular,
    existingDraft,
    onDraftSaved,
    isDirty: state.isDirty,
    setIsDirty: state.setIsDirty,
    setIsSaving: state.setIsSaving,
    setLastSavedTime: state.setLastSavedTime,
    setShowCloseConfirm: state.setShowCloseConfirm,
    onClose,
    appliedTemplate: state.appliedTemplate,
  });

  const formattedLastSaved = state.lastSavedTime ? formatTimestamp(state.lastSavedTime) : '';

  if (!isOpen) return null;

  // Show loading screen while template is being applied
  if (isLoadingTemplate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-900">
        <div className="text-center">
          <div className="mb-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-stone-200 dark:border-stone-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-3 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <p className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
            {templateToApply ? 'Applying Template' : 'Generating Print Preview'}
          </p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {templateToApply ? `Applying "${templateToApply.name}"...` : 'Preparing your pages...'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col">
        {/* Custom Toolbar */}
        <PrintPreviewToolbar
          isDirty={state.isDirty}
          isSaving={state.isSaving}
          lastSavedTime={formattedLastSaved}
          onBack={handleClose}
          onClose={handleClose}
          onSaveDraft={handleSaveDraft}
          onApplyTemplate={() => setShowLiveTemplateSelector(true)}
          isEditorMode={isEditorMode}
          onEditorModeChange={setIsEditorMode}
        />

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 min-w-0">
            {/* Canvas Toolbar - Always visible but content changes based on mode */}
            <div className="sticky top-0 z-10 bg-stone-100 border-b border-stone-300 shadow-sm">
              <Toolbar
                selectedElement={state.selectedElement}
                onUpdateElement={
                  state.selectedElementId
                    ? (updates) => actions.updateElement(state.selectedElementId!, updates)
                    : undefined
                }
                onAddText={() => {}}
                pageSize={state.currentPage.size}
                orientation={state.currentPage.orientation}
                onPageSizeChange={actions.changePageSize}
                onOrientationChange={actions.changeOrientation}
                onPrint={handlePrint}
                activeSection={state.activeSection}
                headerBackgroundColor={state.header.backgroundColor || '#ffffff'}
                footerBackgroundColor={state.footer.backgroundColor || '#ffffff'}
                pageBackgroundColor={state.currentPage.backgroundColor || '#ffffff'}
                onHeaderBackgroundChange={actions.updateHeaderBackground}
                onFooterBackgroundChange={actions.updateFooterBackground}
                onPageBackgroundChange={actions.updatePageBackground}
                pages={state.pages}
                header={state.header}
                footer={state.footer}
                isEditorMode={isEditorMode}
              />
            </div>

            {/* Canvas Scroll Area */}
            <div className="flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8">
              <Canvas
                page={state.currentPage}
                selectedElementId={isEditorMode ? state.selectedElementId : null}
                onSelectElement={isEditorMode ? state.setSelectedElementId : () => {}}
                onUpdateElement={isEditorMode ? actions.updateElement : () => {}}
                onDeleteElement={isEditorMode ? actions.deleteElement : () => {}}
                isEditingElementId={isEditorMode ? state.isEditingElementId : null}
                onEditingChange={isEditorMode ? state.setIsEditingElementId : () => {}}
                header={state.header}
                footer={state.footer}
                pageNumber={state.currentPageIndex + 1}
                totalPages={state.pages.length}
                activeSection={state.activeSection}
                onActiveSectionChange={isEditorMode ? state.setActiveSection : () => {}}
                selectedGroupId={state.selectedGroupId}
              />
            </div>

            {/* Bottom Controls */}
            <div className="border-t border-stone-200 bg-white flex-shrink-0">
              <BottomPageControls
                currentPageIndex={state.currentPageIndex}
                totalPages={state.pages.length}
                onAddPage={() => {}}
                onDuplicatePage={() => {}}
                onDeletePage={() => {}}
                elements={state.allElements}
                selectedElementId={state.selectedElementId}
                onSelectElement={state.setSelectedElementId}
                onUpdateElement={actions.updateElement}
                onReorderElements={actions.reorderElements}
                onPreviousPage={() =>
                  state.setCurrentPageIndex((prev) => Math.max(0, prev - 1))
                }
                onNextPage={() =>
                  state.setCurrentPageIndex((prev) =>
                    Math.min(state.pages.length - 1, prev + 1)
                  )
                }
                isEditorMode={isEditorMode}
                selectedGroupId={state.selectedGroupId}
                onSelectGroup={state.setSelectedGroupId}
              />
            </div>
          </div>

          {/* Right Sidebar - Always visible */}
          <div className="w-64 border-l border-stone-200 bg-zinc-50 flex-shrink-0 overflow-y-auto">
            <PagePanel
              pages={state.pages}
              currentPageIndex={state.currentPageIndex}
              onPageSelect={state.setCurrentPageIndex}
              onAddPage={() => {}}
              onReorderPages={() => {}}
              header={state.header}
              footer={state.footer}
            />
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <TemplateSelector
        isOpen={state.showTemplateSelector}
        onClose={() => {
          // CRITICAL: Only call handleTemplateSelect if user hasn't already selected
          // Check if we're closing without any template selection
          if (!state.hasInitialized && templateToApply === null) {
            // User closed without selecting - start blank
            console.log('❌ User closed template selector without choosing - starting blank');
            handleTemplateSelect(undefined as any);
          }
          state.setShowTemplateSelector(false);
        }}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* Close Confirmation */}
      <ConfirmationModal
        isOpen={state.showCloseConfirm}
        onClose={() => state.setShowCloseConfirm(false)}
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

      {/* Template Application Confirmation */}
      <TemplateApplicationModal
        isOpen={showTemplateApplicationModal}
        onClose={() => {
          setShowTemplateApplicationModal(false);
          handleSkipTemplate();
        }}
        onProceed={handleApplySavedTemplate}
        template={savedTemplate}
      />

      {/* Live Template Selector (from toolbar button) */}
      <TemplateSelector
        isOpen={showLiveTemplateSelector}
        onClose={() => setShowLiveTemplateSelector(false)}
        onSelectTemplate={handleApplyLiveTemplate}
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