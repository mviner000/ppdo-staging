// components/ppdo/table/print-preview/TemplateSelector.tsx

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ResizableModal,
  ResizableModalContent,
  ResizableModalHeader,
  ResizableModalFooter,
  ResizableModalTitle,
  ResizableModalDescription,
  ResizableModalBody,
} from '@/components/ui/resizable-modal';
import { Check, X, Trash2, Copy, FileText, SquarePen } from 'lucide-react';
import { CanvasTemplate } from '@/app/(extra)/canvas/_components/editor/types/template';
import { useTemplateStorage } from '@/app/(extra)/canvas/_components/editor/hooks/useTemplateStorage';
import { toast } from 'sonner';
import { PageOrientationTab } from './PageOrientationTab';

// Updated interface to handle the full result
interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: { template: CanvasTemplate | null; orientation: 'portrait' | 'landscape' }) => void;
}

type SetupStep = 'template' | 'orientation';

export function TemplateSelector({ isOpen, onClose, onComplete }: TemplateSelectorProps) {
  const { templates, deleteTemplate, duplicateTemplate, refreshTemplates } = useTemplateStorage();
  
  // Setup State
  const [step, setStep] = useState<SetupStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate | null>(null);
  
  // UI State for Template Grid
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      refreshTemplates();
      setStep('template');
      setSelectedTemplate(null);
      setSelectedId(null);
    }
  }, [isOpen, refreshTemplates]);

  // --- Handlers ---

  const handleTemplateContinue = () => {
    const template = templates.find(t => t.id === selectedId);
    if (!template) {
      toast.error('Please select a template first');
      return;
    }
    console.log('✅ Template selected, moving to orientation:', template.name);
    setSelectedTemplate(template);
    setStep('orientation');
  };

  const handleSkipTemplate = () => {
    console.log('⭐️ Skipping template, moving to orientation');
    setSelectedTemplate(null);
    setStep('orientation');
  };

  const handleFinalize = (orientation: 'portrait' | 'landscape') => {
    console.log('🎉 Setup complete:', { template: selectedTemplate?.name, orientation });
    onComplete({ template: selectedTemplate, orientation });
  };

  // --- Template Grid Actions ---

  const handleDelete = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      deleteTemplate(templateId);
      if (selectedId === templateId) setSelectedId(null);
      toast.success('Template deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleDuplicate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const duplicated = duplicateTemplate(templateId);
      toast.success(`Template duplicated: ${duplicated.name}`);
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const handleCreateNew = () => {
    window.open('/canvas', '_blank');
  };

  return (
    <ResizableModal 
      open={isOpen} 
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <ResizableModalContent
        width={step === 'template' ? "1200px" : "800px"} // Adjust width based on step
        height="800px"
        maxWidth="95vw"
        maxHeight="90vh"
        onCloseClick={onClose}
        preventOutsideClick={false}
      >
        {step === 'template' ? (
          <>
            {/* Header */}
            <ResizableModalHeader>
              <ResizableModalTitle className="text-xl">
                Choose a Template
              </ResizableModalTitle>
              <ResizableModalDescription>
                Select a template to apply headers, footers, and styling to all pages
              </ResizableModalDescription>
            </ResizableModalHeader>

            {/* Template Grid Body */}
            <ResizableModalBody className="px-6 py-6">
              {templates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Create New Template Card */}
                  <button
                    onClick={handleCreateNew}
                    type="button"
                    className="relative border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-lg overflow-hidden hover:border-[#15803D] hover:bg-[#15803D]/5 transition-all group w-full"
                  >
                    <div className="aspect-[8.5/11] flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#15803D]/10 flex items-center justify-center mb-3 group-hover:bg-[#15803D]/20 transition-colors">
                        <SquarePen className="w-8 h-8 text-[#15803D]" />
                      </div>
                      <h4 className="font-semibold text-base text-stone-900 dark:text-stone-100 mb-2">Create New Template</h4>
                      <p className="text-sm text-stone-500 dark:text-stone-400 leading-tight">Open canvas editor to design a custom template</p>
                    </div>
                  </button>

                  {/* Template Cards */}
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedId(template.id)}
                      onMouseEnter={() => setHoveredId(template.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`relative border-2 rounded-lg overflow-hidden transition-all cursor-pointer w-full group ${
                        selectedId === template.id
                          ? 'border-[#15803D] ring-2 ring-[#15803D]/20 shadow-lg'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 hover:shadow-md hover:-translate-y-1'
                      }`}
                    >
                      <div className="aspect-[8.5/11] bg-stone-100 dark:bg-stone-800 relative">
                        {template.thumbnail ? (
                          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-contain" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 dark:text-stone-600"><FileText className="w-12 h-12" /></div>
                        )}
                        {hoveredId === template.id && !template.isDefault && (
                          <div className="absolute top-3 right-3 flex gap-2 z-10">
                            <button type="button" onClick={(e) => handleDuplicate(template.id, e)} className="p-2 bg-white dark:bg-stone-800 rounded-md shadow-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"><Copy className="w-4 h-4 text-stone-600 dark:text-stone-400" /></button>
                            <button type="button" onClick={(e) => handleDelete(template.id, e)} className="p-2 bg-white dark:bg-stone-800 rounded-md shadow-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"><Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" /></button>
                          </div>
                        )}
                      </div>
                      {selectedId === template.id && <div className="absolute top-3 left-3 bg-[#15803D] text-white rounded-full p-1 shadow-lg z-10"><Check className="w-4 h-4" /></div>}
                      {template.isDefault && <div className="absolute top-3 left-3 px-2 py-1 bg-[#15803D] text-white text-xs font-medium rounded z-10">Default</div>}
                      <div className="p-4 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700">
                        <h4 className="font-semibold text-base truncate text-stone-900 dark:text-stone-100 mb-1">{template.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                          <span className="capitalize">{template.page.orientation}</span>
                          {template.page.size && <><span className="text-stone-300 dark:text-stone-600">•</span><span>{template.page.size}</span></>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-[#15803D]/10 flex items-center justify-center mx-auto mb-4"><FileText className="w-10 h-10 text-[#15803D]" /></div>
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">No templates available</h3>
                  <p className="text-stone-500 dark:text-stone-400 mb-6">Create your first template to get started with custom designs</p>
                  <Button onClick={handleCreateNew} className="bg-[#15803D] hover:bg-[#15803D]/90"><SquarePen className="w-4 h-4 mr-2" />Create Your First Template</Button>
                </div>
              )}
            </ResizableModalBody>

            {/* Footer */}
            <ResizableModalFooter className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 flex-row justify-between items-center">
              <Button variant="ghost" onClick={handleSkipTemplate} type="button" className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">
                <X className="w-4 h-4 mr-2" />Skip - Start Blank
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-500 dark:text-stone-400">{selectedId ? templates.find(t => t.id === selectedId)?.name : 'No template selected'}</span>
                <Button onClick={handleTemplateContinue} disabled={!selectedId} type="button" className="bg-[#15803D] hover:bg-[#15803D]/90 disabled:bg-stone-300 disabled:text-stone-500">
                  <Check className="w-4 h-4 mr-2" />Continue to Orientation
                </Button>
              </div>
            </ResizableModalFooter>
          </>
        ) : (
          /* Step 2: Page Orientation */
          <PageOrientationTab
            onBack={() => setStep('template')}
            onSelectOrientation={handleFinalize}
            defaultOrientation={selectedTemplate?.page.orientation || 'portrait'}
          />
        )}
      </ResizableModalContent>
    </ResizableModal>
  );
}