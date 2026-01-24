// app/(extra)/canvas/_components/editor/bottom-page-controls.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Copy, Trash2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import LayerPanel from './layer-panel';
import TableStylePanel from './table-style-panel';
import { CanvasElement } from './types';
import { applyTableStyle } from './utils/applyTableStyle';
import { TABLE_STYLES_MAP } from './constants/table-styles';
import { toast } from 'sonner';

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
  isEditorMode?: boolean;
  selectedGroupId?: string | null;
  onSelectGroup?: (groupId: string | null) => void;
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
  isEditorMode = true,
  selectedGroupId: externalSelectedGroupId,
  onSelectGroup: externalOnSelectGroup,
}: BottomPageControlsProps) {
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [internalSelectedGroupId, setInternalSelectedGroupId] = useState<string | null>(null);
  const [isTableStylePanelOpen, setIsTableStylePanelOpen] = useState(false);
  const [appliedTableStyles, setAppliedTableStyles] = useState<Map<string, string>>(new Map());

  const selectedGroupId = externalSelectedGroupId ?? internalSelectedGroupId;
  const setSelectedGroupId = externalOnSelectGroup ?? setInternalSelectedGroupId;

  const isFirst = currentPageIndex === 0;
  const isLast = currentPageIndex === totalPages - 1;

  // Auto-show/hide table style panel based on group selection
  useEffect(() => {
    if (selectedGroupId && isEditorMode) {
      // Check if the selected group is actually a table group (starts with "table-group-")
      const isTableGroup = selectedGroupId.startsWith('table-group-');
      setIsTableStylePanelOpen(isTableGroup);
    } else {
      setIsTableStylePanelOpen(false);
    }
  }, [selectedGroupId, isEditorMode]);

  // Handle table style application
  const handleApplyTableStyle = (styleId: string) => {
    if (!selectedGroupId) return;

    const style = TABLE_STYLES_MAP.get(styleId);
    if (!style) {
      toast.error('Style not found');
      return;
    }

    try {
      // Apply the style to all elements in the group
      applyTableStyle(elements, selectedGroupId, style, onUpdateElement);

      // Track which style was applied to this group
      setAppliedTableStyles(prev => new Map(prev).set(selectedGroupId, styleId));

      toast.success(`Applied "${style.name}" style`);
    } catch (error) {
      console.error('Failed to apply table style:', error);
      toast.error('Failed to apply table style. Please try again.');
    }
  };

  return (
    <>
      <div className="z-40 fixed ml-18 bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-sm">
        <div className={`flex items-center px-6 py-3 ${isEditorMode ? 'justify-between' : 'justify-center'}`}>
          {isEditorMode && (
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
          )}

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

      {isEditorMode && (
        <>
          <LayerPanel
            isOpen={isLayerPanelOpen}
            onClose={() => setIsLayerPanelOpen(false)}
            elements={elements}
            selectedElementId={selectedElementId}
            onSelectElement={(id) => {
              onSelectElement(id);
              setSelectedGroupId(null);
            }}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onUpdateElement={onUpdateElement}
            onReorderElements={onReorderElements}
          />

          <TableStylePanel
            isOpen={isTableStylePanelOpen}
            selectedGroupId={selectedGroupId}
            appliedStyleId={selectedGroupId ? appliedTableStyles.get(selectedGroupId) : undefined}
            onApplyStyle={handleApplyTableStyle}
            onClose={() => setIsTableStylePanelOpen(false)}
          />
        </>
      )}
    </>
  );
}