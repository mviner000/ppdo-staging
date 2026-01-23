// app/dashboard/canvas/_components/editor.tsx

'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { printAllPages } from '@/lib/print';
import Toolbar from './editor/toolbar';
import Canvas from './editor/canvas';
import PagePanel from './editor/page-panel';
import BottomPageControls from './editor/bottom-page-controls';
import { useEditorState } from './editor/hooks/useEditorState';
import { useClipboard } from './editor/hooks/useClipboard';
import { useKeyboard } from './editor/hooks/useKeyboard';
import { useStorage, useSaveStorage } from './editor/hooks/useStorage';
import { createNewPage } from './editor/utils';
export type { TextElement, ImageElement, CanvasElement, Page } from './editor/types';

export type ActiveSection = 'header' | 'page' | 'footer';

export default function Editor() {
  console.group('📋 STEP 6: Canvas Editor - Initialization');
  
  const { isHydrated, savedPages, savedIndex, savedHeader, savedFooter } = useStorage();
  
  console.log('💾 Storage state:');
  console.log('  - isHydrated:', isHydrated);
  console.log('  - savedPages:', savedPages?.length || 0, 'pages');
  console.log('  - savedIndex:', savedIndex);
  console.log('  - savedHeader elements:', savedHeader?.elements.length || 0);
  console.log('  - savedFooter elements:', savedFooter?.elements.length || 0);
  
  if (savedPages && savedPages.length > 0) {
    console.log('  - First page elements:', savedPages[0].elements.length);
    console.log('  - First page sample:', savedPages[0].elements[0]);
  }
  
  console.groupEnd();
  const initialPages = savedPages || [createNewPage()];
  const initialIndex = savedIndex ?? 0;
  const initialHeader = savedHeader || { elements: [] };
  const initialFooter = savedFooter || { elements: [] };

  const [activeSection, setActiveSection] = useState<ActiveSection>('page');

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
  });

  const allElements = [
    ...header.elements.map(el => ({ ...el, section: 'header' as const })),
    ...currentPage.elements.map(el => ({ ...el, section: 'page' as const })),
    ...footer.elements.map(el => ({ ...el, section: 'footer' as const })),
  ];

  return (
    <div className="flex flex-col h-screen bg-stone-50">
      <div className="no-print">
        <PagePanel
          pages={pages}
          currentPageIndex={currentPageIndex}
          onPageSelect={selectPage}
          onAddPage={addPage}
          onReorderPages={reorderPages}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-print" style={{ marginRight: '192px' }}>
        <div className="sticky top-0 z-1 bg-stone-100 border-b border-stone-300 shadow-sm">
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
          />
        </div>
        
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

      <div className="no-print">
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

      <Toaster position="bottom-center" />
    </div>
  );
}