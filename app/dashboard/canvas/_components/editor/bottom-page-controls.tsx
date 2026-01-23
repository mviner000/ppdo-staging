// app/dashboard/canvas/_components/editor/bottom-page-controls.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Copy, Trash2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import LayerPanel from './layer-panel';
import { CanvasElement } from './types';

interface BottomPageControlsProps {
  currentPageIndex: number;
  totalPages: number;
  onAddPage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;
  // UPDATED TYPE: explicitly include the section property to satisfy LayerPanel requirements
  elements: (CanvasElement & { section: 'header' | 'page' | 'footer' })[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onReorderElements: (fromIndex: number, toIndex: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export default function BottomPageControls({
  currentPageIndex,
  totalPages,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onReorderElements,
  onPreviousPage,
  onNextPage,
}: BottomPageControlsProps) {
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);

  const isFirst = currentPageIndex === 0;
  const isLast = currentPageIndex === totalPages - 1;

  return (
    <>
      <div className="fixed ml-18 bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsLayerPanelOpen(true)}
              size="sm"
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <Layers className="w-4 h-4" />
              Layers
            </Button>
            <Button 
              onClick={onAddPage} 
              size="sm" 
              variant="outline" 
              className="gap-2 bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Add Page
            </Button>
            <Button 
              onClick={onDuplicatePage} 
              size="sm" 
              variant="outline" 
              className="gap-2 bg-transparent"
            >
              <Copy className="w-4 h-4" />
              Duplicate Page
            </Button>
            <Button 
              onClick={onDeletePage} 
              size="sm" 
              variant="outline" 
              className="gap-2 bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
              Delete Page
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={onPreviousPage}
              size="sm"
              variant="outline"
              disabled={isFirst}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-sm text-stone-600 font-medium">
              Page {currentPageIndex + 1} of {totalPages}
            </div>

            <Button
              onClick={onNextPage}
              size="sm"
              variant="outline"
              disabled={isLast}
              className="gap-2 bg-transparent"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <LayerPanel
        isOpen={isLayerPanelOpen}
        onClose={() => setIsLayerPanelOpen(false)}
        elements={elements}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
        onUpdateElement={onUpdateElement}
        onReorderElements={onReorderElements}
      />
    </>
  );
}