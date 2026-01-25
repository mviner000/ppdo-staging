// components/ppdo/table/print-preview/PageOrientationTab.tsx

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, FileText, ArrowLeft } from 'lucide-react';
import { ResizableModalHeader, ResizableModalTitle, ResizableModalDescription, ResizableModalBody, ResizableModalFooter } from '@/components/ui/resizable-modal';

interface PageOrientationTabProps {
  onSelectOrientation: (orientation: 'portrait' | 'landscape') => void;
  onBack: () => void;
  defaultOrientation?: 'portrait' | 'landscape';
}

export function PageOrientationTab({
  onSelectOrientation,
  onBack,
  defaultOrientation = 'portrait',
}: PageOrientationTabProps) {
  const [selectedOrientation, setSelectedOrientation] = useState<'portrait' | 'landscape'>(defaultOrientation);

  const handleConfirm = () => {
    onSelectOrientation(selectedOrientation);
  };

  return (
    <>
      {/* Header */}
      <ResizableModalHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <ResizableModalTitle className="text-2xl">
              Page Orientation
            </ResizableModalTitle>
            <ResizableModalDescription>
              Select the orientation for your print preview pages
            </ResizableModalDescription>
          </div>
        </div>
      </ResizableModalHeader>

      {/* Orientation Cards */}
      <ResizableModalBody className="px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {/* Portrait Card */}
            <button
              onClick={() => setSelectedOrientation('portrait')}
              className={`relative group transition-all duration-200 ${
                selectedOrientation === 'portrait' ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              <div
                className={`relative border-2 rounded-xl overflow-hidden transition-all ${
                  selectedOrientation === 'portrait'
                    ? 'border-[#15803D] ring-4 ring-[#15803D]/20 shadow-xl'
                    : 'border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500 hover:shadow-lg'
                }`}
              >
                {/* Visual Representation */}
                <div className="aspect-[3/4] bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 p-8 flex items-center justify-center">
                  <div className="relative w-full h-full max-w-[140px] max-h-[200px]">
                    {/* Page mockup */}
                    <div className="absolute inset-0 bg-white dark:bg-stone-950 rounded-lg shadow-2xl border border-stone-200 dark:border-stone-700 flex flex-col p-3">
                      <div className="space-y-1.5 mb-3">
                        <div className="h-2 bg-[#15803D]/20 rounded w-3/4"></div>
                        <div className="h-1.5 bg-stone-300 dark:bg-stone-600 rounded w-1/2"></div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded w-full"></div>
                        <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded w-full"></div>
                        <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Label Section */}
                <div className={`px-6 py-4 transition-colors ${selectedOrientation === 'portrait' ? 'bg-[#15803D] text-white' : 'bg-white dark:bg-stone-800'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-7 border-2 rounded-sm transition-colors ${selectedOrientation === 'portrait' ? 'border-white' : 'border-stone-400 dark:border-stone-500'}`} />
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">Portrait</h3>
                        <p className={`text-sm ${selectedOrientation === 'portrait' ? 'text-white/90' : 'text-stone-500 dark:text-stone-400'}`}>Vertical layout</p>
                      </div>
                    </div>
                    {selectedOrientation === 'portrait' && (
                      <div className="bg-white text-[#15803D] rounded-full p-1 shadow-lg"><Check className="w-5 h-5" /></div>
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Landscape Card */}
            <button
              onClick={() => setSelectedOrientation('landscape')}
              className={`relative group transition-all duration-200 ${
                selectedOrientation === 'landscape' ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              <div
                className={`relative border-2 rounded-xl overflow-hidden transition-all ${
                  selectedOrientation === 'landscape'
                    ? 'border-[#15803D] ring-4 ring-[#15803D]/20 shadow-xl'
                    : 'border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500 hover:shadow-lg'
                }`}
              >
                {/* Visual Representation */}
                <div className="aspect-[3/4] bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 p-8 flex items-center justify-center">
                  <div className="relative w-full h-full max-w-[200px] max-h-[140px]">
                    {/* Page mockup */}
                    <div className="absolute inset-0 bg-white dark:bg-stone-950 rounded-lg shadow-2xl border border-stone-200 dark:border-stone-700 flex flex-col p-3">
                      <div className="space-y-1.5 mb-2">
                        <div className="h-2 bg-[#15803D]/20 rounded w-2/3"></div>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded w-full"></div>
                          <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded w-4/5"></div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Label Section */}
                <div className={`px-6 py-4 transition-colors ${selectedOrientation === 'landscape' ? 'bg-[#15803D] text-white' : 'bg-white dark:bg-stone-800'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-5 border-2 rounded-sm transition-colors ${selectedOrientation === 'landscape' ? 'border-white' : 'border-stone-400 dark:border-stone-500'}`} />
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">Landscape</h3>
                        <p className={`text-sm ${selectedOrientation === 'landscape' ? 'text-white/90' : 'text-stone-500 dark:text-stone-400'}`}>Horizontal layout</p>
                      </div>
                    </div>
                    {selectedOrientation === 'landscape' && (
                      <div className="bg-white text-[#15803D] rounded-full p-1 shadow-lg"><Check className="w-5 h-5" /></div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">Quick Tip</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Portrait orientation is ideal for documents with more rows, while landscape works better for wider tables with many columns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ResizableModalBody>

      {/* Footer */}
      <ResizableModalFooter className="px-8 py-4 bg-stone-50 dark:bg-stone-800/50">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-stone-500 dark:text-stone-400">
            Selected: <span className="font-medium text-stone-700 dark:text-stone-300 capitalize">{selectedOrientation}</span>
          </span>
          <Button onClick={handleConfirm} className="bg-[#15803D] hover:bg-[#15803D]/90 text-white px-6">
            <Check className="w-4 h-4 mr-2" />
            Finish & Create Preview
          </Button>
        </div>
      </ResizableModalFooter>
    </>
  );
}