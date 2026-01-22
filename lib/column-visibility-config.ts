// lib/column-visibility-config.ts

/**
 * Centralized configuration for column visibility menu styling
 * Change these values to update the appearance across all tables
 */
export const COLUMN_VISIBILITY_CONFIG = {
  // Dropdown content
  contentWidth: "w-56",
  maxHeight: "300px",
  
  // Labels
  defaultLabel: "Toggle Columns",
  
  // Visibility
  showCount: true,
  
  // Button text
  showAllText: "Show All",
  hideAllText: "Hide All",
  
  // Colors (can be extended)
  hideAllButtonClass: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950",
  
  // Icon sizes
  iconSize: {
    width: 14,
    height: 14,
  },
} as const;