// app/dashboard/project/[year]/components/TemplateApplicationModal.tsx

"use client";

import { useAccentColor } from "@/contexts/AccentColorContext";
import { CanvasTemplate } from "@/app/(extra)/canvas/_components/editor/types/template";

interface TemplateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  template: CanvasTemplate | null;
}

export function TemplateApplicationModal({
  isOpen,
  onClose,
  onProceed,
  template,
}: TemplateApplicationModalProps) {
  const { accentColorValue } = useAccentColor();

  if (!isOpen || !template) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accentColorValue}20` }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: accentColorValue }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Apply Saved Template?
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                This draft was created with the template <span className="font-medium text-zinc-900 dark:text-zinc-100">"{template.name}"</span>.
                Would you like to apply this template to your current data?
              </p>
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Applying the template will regenerate your pages with fresh data and the saved styling
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                This includes headers, footers, colors, page backgrounds, and any custom elements from the template
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            Skip Template
          </button>

          <button
            onClick={() => {
              onProceed();
              onClose();
            }}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md text-white"
            style={{ backgroundColor: accentColorValue }}
          >
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
}
