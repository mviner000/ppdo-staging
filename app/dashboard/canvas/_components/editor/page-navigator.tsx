// app/dashboard/canvas/_components/editor/page-navigator.tsx

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageNavigatorProps {
  currentPageIndex: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export default function PageNavigator({
  currentPageIndex,
  totalPages,
  onPreviousPage,
  onNextPage,
}: PageNavigatorProps) {
  const isFirst = currentPageIndex === 0;
  const isLast = currentPageIndex === totalPages - 1;

  return (
    <div className="flex bg-red-500 items-center justify-center gap-4 px-6 py-2">
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

      <div className="text-sm text-stone-600 font-medium w-20 text-center">
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
  );
}
