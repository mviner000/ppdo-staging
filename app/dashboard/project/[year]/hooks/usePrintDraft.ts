// app/dashboard/project/[year]/hooks/usePrintDraft.ts

import { useState, useEffect, useCallback } from 'react';
import { PrintDraft } from '@/lib/print-canvas/types';
import {
  saveDraft as saveDraftToStorage,
  loadDraft as loadDraftFromStorage,
  deleteDraft as deleteDraftFromStorage,
  hasDraft as checkHasDraft,
  formatTimestamp,
} from '../utils/draftStorage';

interface UsePrintDraftReturn {
  draftState: PrintDraft | null;
  isDirty: boolean;
  hasDraft: boolean;
  lastSavedTime: number | null;
  saveDraft: (draft: PrintDraft) => boolean;
  loadDraft: () => PrintDraft | null;
  deleteDraft: () => boolean;
  setIsDirty: (dirty: boolean) => void;
  formattedLastSaved: string;
}

/**
 * Hook for managing print preview drafts
 */
export function usePrintDraft(
  year: number,
  particular?: string
): UsePrintDraftReturn {
  const [draftState, setDraftState] = useState<PrintDraft | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  // Check if draft exists on mount
  useEffect(() => {
    const exists = checkHasDraft(year, particular);
    setHasDraft(exists);
    
    if (exists) {
      const loaded = loadDraftFromStorage(year, particular);
      if (loaded) {
        setDraftState(loaded);
        setLastSavedTime(loaded.timestamp);
      }
    }
  }, [year, particular]);

  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback((draft: PrintDraft): boolean => {
    const success = saveDraftToStorage(draft);
    
    if (success) {
      setDraftState(draft);
      setLastSavedTime(draft.timestamp);
      setIsDirty(false);
      setHasDraft(true);
    }
    
    return success;
  }, []);

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback((): PrintDraft | null => {
    const loaded = loadDraftFromStorage(year, particular);
    
    if (loaded) {
      setDraftState(loaded);
      setLastSavedTime(loaded.timestamp);
      setIsDirty(false);
      setHasDraft(true);
    }
    
    return loaded;
  }, [year, particular]);

  /**
   * Delete draft from localStorage
   */
  const deleteDraft = useCallback((): boolean => {
    const success = deleteDraftFromStorage(year, particular);
    
    if (success) {
      setDraftState(null);
      setLastSavedTime(null);
      setIsDirty(false);
      setHasDraft(false);
    }
    
    return success;
  }, [year, particular]);

  /**
   * Get formatted last saved time
   */
  const formattedLastSaved = lastSavedTime
    ? formatTimestamp(lastSavedTime)
    : '';

  return {
    draftState,
    isDirty,
    hasDraft,
    lastSavedTime,
    saveDraft,
    loadDraft,
    deleteDraft,
    setIsDirty,
    formattedLastSaved,
  };
}