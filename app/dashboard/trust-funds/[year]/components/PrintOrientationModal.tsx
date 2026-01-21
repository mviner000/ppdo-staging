// app/dashboard/trust-funds/[year]/components/PrintOrientationModal.tsx

"use client";

import { useState } from "react";
import { Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccentColor } from "@/contexts/AccentColorContext";

interface PrintOrientationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orientation: 'portrait' | 'landscape') => void;
}

export function PrintOrientationModal({
  isOpen,
  onClose,
  onConfirm,
}: PrintOrientationModalProps) {
  const { accentColorValue } = useAccentColor();
  const [selectedOrientation, setSelectedOrientation] = useState<'portrait' | 'landscape'>('portrait');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedOrientation);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accentColorValue}20` }}
            >
              <Printer className="w-5 h-5" style={{ color: accentColorValue }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Print Options
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choose page orientation
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Select which page orientation you want for printing:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Portrait Option */}
            <button
              onClick={() => setSelectedOrientation('portrait')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${selectedOrientation === 'portrait'
                  ? 'border-current shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }
              `}
              style={{
                borderColor: selectedOrientation === 'portrait' ? accentColorValue : undefined,
                backgroundColor: selectedOrientation === 'portrait' ? `${accentColorValue}10` : undefined,
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-16 border-2 border-current rounded-sm" style={{
                  borderColor: selectedOrientation === 'portrait' ? accentColorValue : undefined,
                }} />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Portrait
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  A4 (Default)
                </span>
              </div>
            </button>

            {/* Landscape Option */}
            <button
              onClick={() => setSelectedOrientation('landscape')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${selectedOrientation === 'landscape'
                  ? 'border-current shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }
              `}
              style={{
                borderColor: selectedOrientation === 'landscape' ? accentColorValue : undefined,
                backgroundColor: selectedOrientation === 'landscape' ? `${accentColorValue}10` : undefined,
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-12 border-2 border-current rounded-sm" style={{
                  borderColor: selectedOrientation === 'landscape' ? accentColorValue : undefined,
                }} />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Landscape
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  A4
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="text-white"
            style={{ backgroundColor: accentColorValue }}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}