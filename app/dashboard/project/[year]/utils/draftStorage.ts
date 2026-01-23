// app/dashboard/project/[year]/utils/draftStorage.ts

import { PrintDraft, DraftMetadata, DraftInfo } from '@/lib/print-canvas/types';

const DRAFT_KEY_PREFIX = 'budget_print_draft_';
const METADATA_KEY = 'budget_print_draft_metadata';
const MAX_DRAFTS = 10;

/**
 * Sanitize string for use in storage keys
 */
function sanitize(str: string): string {
  return str
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
}

/**
 * Generate storage key for a draft
 */
export function getDraftKey(year: number, particular?: string): string {
  const base = `${DRAFT_KEY_PREFIX}${year}`;
  return particular ? `${base}_${sanitize(particular)}` : base;
}

/**
 * Save a draft to localStorage
 */
export function saveDraft(draft: PrintDraft): boolean {
  try {
    const key = getDraftKey(draft.budgetYear, draft.budgetParticular);
    const serialized = JSON.stringify(draft);
    
    // Try to save
    try {
      localStorage.setItem(key, serialized);
    } catch (e) {
      // If quota exceeded, clean up old drafts
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        cleanupOldDrafts(5);
        // Try again
        localStorage.setItem(key, serialized);
      } else {
        throw e;
      }
    }
    
    // Update metadata
    updateMetadata(draft);
    
    return true;
  } catch (error) {
    console.error('Failed to save draft:', error);
    return false;
  }
}

/**
 * Load a draft from localStorage
 */
export function loadDraft(year: number, particular?: string): PrintDraft | null {
  try {
    const key = getDraftKey(year, particular);
    const saved = localStorage.getItem(key);
    
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    
    // Validate structure
    if (!validateDraft(parsed)) {
      console.error('Invalid draft format');
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Delete a draft from localStorage
 */
export function deleteDraft(year: number, particular?: string): boolean {
  try {
    const key = getDraftKey(year, particular);
    localStorage.removeItem(key);
    
    // Update metadata
    removeFromMetadata(key);
    
    return true;
  } catch (error) {
    console.error('Failed to delete draft:', error);
    return false;
  }
}

/**
 * Check if a draft exists
 */
export function hasDraft(year: number, particular?: string): boolean {
  const key = getDraftKey(year, particular);
  return localStorage.getItem(key) !== null;
}

/**
 * Validate draft structure
 */
function validateDraft(draft: unknown): draft is PrintDraft {
  if (!draft || typeof draft !== 'object') return false;
  
  const d = draft as any;
  
  return (
    typeof d.id === 'string' &&
    typeof d.timestamp === 'number' &&
    typeof d.budgetYear === 'number' &&
    d.filterState &&
    typeof d.filterState === 'object' &&
    d.canvasState &&
    typeof d.canvasState === 'object' &&
    Array.isArray(d.canvasState.pages) &&
    d.tableSnapshot &&
    typeof d.tableSnapshot === 'object'
  );
}

/**
 * Update metadata with new draft info
 */
function updateMetadata(draft: PrintDraft): void {
  try {
    const metadata = getMetadata();
    const key = getDraftKey(draft.budgetYear, draft.budgetParticular);
    
    // Remove existing entry for this key
    const filtered = metadata.drafts.filter(d => d.key !== key);
    
    // Add new entry
    const newEntry: DraftInfo = {
      key,
      year: draft.budgetYear,
      particular: draft.budgetParticular,
      timestamp: draft.timestamp,
      pageCount: draft.canvasState.pages.length,
    };
    
    filtered.push(newEntry);
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    // Save updated metadata
    localStorage.setItem(METADATA_KEY, JSON.stringify({ drafts: filtered }));
  } catch (error) {
    console.error('Failed to update metadata:', error);
  }
}

/**
 * Remove entry from metadata
 */
function removeFromMetadata(key: string): void {
  try {
    const metadata = getMetadata();
    const filtered = metadata.drafts.filter(d => d.key !== key);
    localStorage.setItem(METADATA_KEY, JSON.stringify({ drafts: filtered }));
  } catch (error) {
    console.error('Failed to remove from metadata:', error);
  }
}

/**
 * Get draft metadata
 */
function getMetadata(): DraftMetadata {
  try {
    const saved = localStorage.getItem(METADATA_KEY);
    if (!saved) return { drafts: [] };
    
    const parsed = JSON.parse(saved);
    if (!parsed.drafts || !Array.isArray(parsed.drafts)) {
      return { drafts: [] };
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to get metadata:', error);
    return { drafts: [] };
  }
}

/**
 * List all drafts
 */
export function listAllDrafts(): DraftInfo[] {
  return getMetadata().drafts;
}

/**
 * Clean up old drafts, keeping only the most recent ones
 */
export function cleanupOldDrafts(keepCount: number = MAX_DRAFTS): void {
  try {
    const metadata = getMetadata();
    
    // Sort by timestamp (newest first)
    metadata.drafts.sort((a, b) => b.timestamp - a.timestamp);
    
    // Get drafts to delete
    const toDelete = metadata.drafts.slice(keepCount);
    
    // Delete old drafts
    toDelete.forEach(draft => {
      try {
        localStorage.removeItem(draft.key);
      } catch (error) {
        console.error(`Failed to delete draft ${draft.key}:`, error);
      }
    });
    
    // Update metadata
    const remaining = metadata.drafts.slice(0, keepCount);
    localStorage.setItem(METADATA_KEY, JSON.stringify({ drafts: remaining }));
    
    console.log(`Cleaned up ${toDelete.length} old drafts`);
  } catch (error) {
    console.error('Failed to cleanup old drafts:', error);
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  used: number;
  total: number;
  percentage: number;
  draftCount: number;
} {
  try {
    // Estimate localStorage usage
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        used += key.length + (value?.length || 0);
      }
    }
    
    // Most browsers allow 5-10MB per origin
    const total = 5 * 1024 * 1024; // 5MB estimate
    const percentage = (used / total) * 100;
    const draftCount = listAllDrafts().length;
    
    return {
      used,
      total,
      percentage,
      draftCount,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      used: 0,
      total: 0,
      percentage: 0,
      draftCount: 0,
    };
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}