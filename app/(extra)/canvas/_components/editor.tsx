// app/(extra)/canvas/_components/editor.tsx (UPDATED - GOOGLE DOCS STYLE RULERS)

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { printAllPages } from '@/lib/print';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Toolbar from './editor/toolbar';
import Canvas from './editor/canvas';
import PagePanel from './editor/page-panel';
import BottomPageControls from './editor/bottom-page-controls';
import LeftSidebar from './editor/left-sidebar/LeftSidebar';
import { HorizontalRuler, VerticalRuler } from './editor/ruler';
import { useEditorState } from './editor/hooks/useEditorState';
import { useClipboard } from './editor/hooks/useClipboard';
import { useKeyboard } from './editor/hooks/useKeyboard';
import { useStorage, useSaveStorage } from './editor/hooks/useStorage';
import { useRulerState } from './editor/hooks/useRulerState';
import { createNewPage } from './editor/utils';
import { getPageDimensions, RULER_WIDTH, RULER_HEIGHT, HEADER_HEIGHT, FOOTER_HEIGHT } from './editor/constants';
import type { UploadedImage } from './editor/types/upload';
export type { TextElement, ImageElement, CanvasElement, Page } from './editor/types';

export type ActiveSection = 'header' | 'page' | 'footer';

export interface EditorProps {
  enableUploadPanel?: boolean;
  showPagePanel?: boolean;
  variant?: 'default' | 'modal';
  onClose?: () => void; // NEW PROP
}

export default function Editor({ 
  enableUploadPanel = true, 
  showPagePanel = true, 
  variant = 'default',
  onClose 
}: EditorProps = {}) {
  const { isHydrated, savedPages, savedIndex, savedHeader, savedFooter } = useStorage();
  
  const initialPages = savedPages || [createNewPage()];
  const initialIndex = savedIndex ?? 0;
  const initialHeader = savedHeader || { elements: [] };
  const initialFooter = savedFooter || { elements: [] };

  const [activeSection, setActiveSection] = useState<ActiveSection>('page');
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [canvasOffsetLeft, setCanvasOffsetLeft] = useState(0);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const {
    rulerState,
    toggleRulerVisibility,
    updateMargin,
    updateIndent,
    addTabStop,
    updateTabStop,
    removeTabStop,
  } = useRulerState();

  const {
    pages,
    currentPageIndex,
    currentPage,
    selectedElementId,
    selectedElement,
    isEditingElementId,
    header,
    footer,
    setSelectedElementId,
    setIsEditingElementId,
    addPage,
    duplicatePage,
    deletePage,
    reorderPages,
    changePageSize,
    changeOrientation,
    goToPreviousPage,
    goToNextPage,
    selectPage,
    addText,
    addImage,
    updateElement,
    deleteElement,
    reorderElements,
    updateHeaderBackground,
    updateFooterBackground,
    updatePageBackground,
  } = useEditorState(initialPages, initialIndex, initialHeader, initialFooter);

  useSaveStorage(pages, currentPageIndex, header, footer, isHydrated);

  useClipboard({
    currentPage,
    selectedElementId,
    isEditingElementId,
    onAddImage: (src) => addImage(src, activeSection),
    activeSection,
    header,
    footer,
  });

  useKeyboard({
    selectedElementId,
    isEditingElementId,
    onDeleteElement: deleteElement,
    onToggleRuler: toggleRulerVisibility,
  });

  // Calculate canvas offset for ruler positioning (Google Docs style)
  const updateCanvasOffset = useCallback(() => {
    if (canvasContainerRef.current && canvasScrollRef.current) {
      const scrollContainer = canvasScrollRef.current;
      const pageDimensions = getPageDimensions(currentPage.size, currentPage.orientation);
      const containerWidth = scrollContainer.clientWidth;
      const canvasWidth = pageDimensions.width;

      // Calculate where the canvas is positioned (centered in scroll area)
      // Account for the scroll position and padding
      const padding = 32; // px-8 = 32px padding
      const availableWidth = containerWidth - (padding * 2);
      const canvasStartOffset = Math.max(padding, (containerWidth - canvasWidth) / 2);

      setCanvasOffsetLeft(canvasStartOffset - scrollLeft);
    }
  }, [currentPage.size, currentPage.orientation, scrollLeft]);

  // Update canvas offset on scroll, resize, or page changes
  useEffect(() => {
    updateCanvasOffset();

    const handleResize = () => updateCanvasOffset();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [updateCanvasOffset]);

  const allElements = [
    ...header.elements.map(el => ({ ...el, section: 'header' as const })),
    ...currentPage.elements.map(el => ({ ...el, section: 'page' as const })),
    ...footer.elements.map(el => ({ ...el, section: 'footer' as const })),
  ];

  const handleImageSelect = (image: UploadedImage) => {
    addImage(image.dataUrl, activeSection);
  };

  const pageDimensions = getPageDimensions(currentPage.size, currentPage.orientation);
  const totalCanvasHeight = HEADER_HEIGHT + pageDimensions.height + FOOTER_HEIGHT;

  return (
    <div className="h-screen bg-stone-50 flex flex-col">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 h-auto bg-stone-100 border-b border-stone-300 shadow-md z-40 no-print">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Toolbar
              selectedElement={selectedElement}
              onUpdateElement={selectedElement ? (updates) => updateElement(selectedElement.id, updates) : undefined}
              onAddText={() => addText(activeSection)}
              pageSize={currentPage.size}
              orientation={currentPage.orientation}
              onPageSizeChange={changePageSize}
              onOrientationChange={changeOrientation}
              onPrint={() => printAllPages(pages, header, footer)}
              activeSection={activeSection}
              headerBackgroundColor={header.backgroundColor || '#ffffff'}
              footerBackgroundColor={footer.backgroundColor || '#ffffff'}
              pageBackgroundColor={currentPage.backgroundColor || '#ffffff'}
              onHeaderBackgroundChange={updateHeaderBackground}
              onFooterBackgroundChange={updateFooterBackground}
              onPageBackgroundChange={updatePageBackground}
              pages={pages}
              header={header}
              footer={footer}
              rulerVisible={rulerState.visible}
              onToggleRuler={toggleRulerVisibility}
            />
          </div>
          {onClose && (
            <div className="px-4 border-l border-stone-300">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-stone-600 hover:text-stone-900"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Ruler - Fixed below toolbar, spanning full width */}
      {rulerState.visible && (
        <div className="sticky top-0 z-30 bg-stone-200 border-b border-stone-300 no-print flex">
          {/* Vertical ruler corner space (when vertical ruler is visible) */}
          {rulerState.showVertical && (
            <div
              className="flex-shrink-0 bg-stone-200 border-r border-stone-300"
              style={{ width: RULER_WIDTH, height: RULER_HEIGHT }}
            />
          )}
          {/* Left sidebar placeholder space */}
          {enableUploadPanel && variant === 'default' && (
            <div className="w-64 flex-shrink-0 bg-stone-200" style={{ height: RULER_HEIGHT }} />
          )}
          {/* Horizontal ruler - centered with canvas */}
          <div
            ref={canvasContainerRef}
            className="flex-1 overflow-hidden flex justify-center"
            style={{ height: RULER_HEIGHT }}
          >
            <div
              style={{
                marginLeft: Math.max(0, canvasOffsetLeft - (enableUploadPanel && variant === 'default' ? 0 : 0)),
                transform: `translateX(${-scrollLeft}px)`,
              }}
            >
              <HorizontalRuler
                width={pageDimensions.width}
                rulerState={rulerState}
                onMarginChange={updateMargin}
                onIndentChange={updateIndent}
                onTabStopAdd={addTabStop}
                onTabStopUpdate={updateTabStop}
                onTabStopRemove={removeTabStop}
                scrollLeft={0}
              />
            </div>
          </div>
          {/* Right sidebar placeholder space */}
          {showPagePanel && variant === 'default' && (
            <div className="w-64 flex-shrink-0 bg-stone-200" style={{ height: RULER_HEIGHT }} />
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Vertical Ruler - Fixed on far left, outside sidebar */}
        {rulerState.visible && rulerState.showVertical && (
          <div
            className="flex-shrink-0 bg-stone-100 border-r border-stone-300 overflow-hidden no-print"
            style={{ width: RULER_WIDTH }}
          >
            <div
              style={{
                transform: `translateY(${-scrollTop}px)`,
                marginTop: 16, // Match pt-4 padding
              }}
            >
              <VerticalRuler
                height={pageDimensions.height}
                rulerState={rulerState}
                onMarginChange={updateMargin}
                scrollTop={0}
                showHeaderFooter={true}
              />
            </div>
          </div>
        )}

        {/* Left Sidebar */}
        {enableUploadPanel && variant === 'default' && (
          <div className="w-64 border-r border-stone-200 bg-zinc-50 overflow-hidden z-30 flex-shrink-0">
            <LeftSidebar
              enableUploadFeature={enableUploadPanel}
              onImageSelect={handleImageSelect}
            />
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-row overflow-hidden bg-stone-50 min-w-0">
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div
              ref={canvasScrollRef}
              className="flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8 bg-stone-50"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                setScrollLeft(target.scrollLeft);
                setScrollTop(target.scrollTop);
              }}
            >
              {/* Canvas */}
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
                onImageDropped={handleImageSelect}
              />
            </div>

            {/* Bottom Page Controls */}
            <div className="no-print border-t border-stone-200 bg-white flex-shrink-0">
              <BottomPageControls
                currentPageIndex={currentPageIndex}
                totalPages={pages.length}
                onAddPage={addPage}
                onDuplicatePage={duplicatePage}
                onDeletePage={deletePage}
                elements={allElements}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={updateElement}
                onReorderElements={reorderElements}
                onPreviousPage={goToPreviousPage}
                onNextPage={goToNextPage}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          {showPagePanel && variant === 'default' && (
            <div className="w-64 border-l border-stone-200 bg-zinc-50 flex-shrink-0 overflow-y-auto no-print">
              <PagePanel
                pages={pages}
                currentPageIndex={currentPageIndex}
                onPageSelect={selectPage}
                onAddPage={addPage}
                onReorderPages={reorderPages}
                onDuplicatePage={(index) => {
                  selectPage(index);
                  duplicatePage();
                }}
                onDeletePage={(index) => {
                  selectPage(index);
                  deletePage();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}