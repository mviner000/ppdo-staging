// app/dashboard/project/[year]/components/table-resize/ResizeLiveRegion.tsx

'use client';

import React from 'react';

interface ResizeLiveRegionProps {
  type: 'column' | 'row';
  dimension: number;
  visible: boolean;
}

/**
 * ResizeLiveRegion Component
 *
 * Provides screen reader announcements during resize operations
 * Updates aria-live region with current dimension
 */
export function ResizeLiveRegion({
  type,
  dimension,
  visible,
}: ResizeLiveRegionProps) {
  if (!visible) return null;

  const label = type === 'column' ? 'Column width' : 'Row height';
  const roundedDimension = Math.round(dimension);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {label}: {roundedDimension} pixels
    </div>
  );
}
