// app/(extra)/canvas/_components/editor/hooks/useRulerState.ts

import { useState, useCallback, useEffect } from 'react';
import { RulerState, RulerUnit, MarginSettings, IndentSettings, TabStop, TabStopType } from '../types';
import { RULER_STORAGE_KEY, DEFAULT_MARGINS } from '../constants';

const DEFAULT_RULER_STATE: RulerState = {
  visible: false,
  showVertical: true,
  unit: 'inches',
  margins: { ...DEFAULT_MARGINS },
  indents: {
    firstLine: 0,
    hanging: 0,
    left: 0,
    right: 0,
  },
  tabStops: [],
  zoom: 1,
};

export const useRulerState = () => {
  const [rulerState, setRulerState] = useState<RulerState>(DEFAULT_RULER_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(RULER_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as Partial<RulerState>;
        setRulerState(prev => ({
          ...prev,
          ...parsed,
          margins: { ...DEFAULT_MARGINS, ...parsed.margins },
          indents: { ...prev.indents, ...parsed.indents },
        }));
      } catch (error) {
        console.error('Failed to load ruler state:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(RULER_STORAGE_KEY, JSON.stringify(rulerState));
    }
  }, [rulerState, isHydrated]);

  const toggleRulerVisibility = useCallback(() => {
    setRulerState(prev => ({
      ...prev,
      visible: !prev.visible,
    }));
  }, []);

  const toggleVerticalRuler = useCallback(() => {
    setRulerState(prev => ({
      ...prev,
      showVertical: !prev.showVertical,
    }));
  }, []);

  const setRulerUnit = useCallback((unit: RulerUnit) => {
    setRulerState(prev => ({
      ...prev,
      unit,
    }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setRulerState(prev => ({
      ...prev,
      zoom: Math.max(0.25, Math.min(4, zoom)),
    }));
  }, []);

  const updateMargin = useCallback((side: keyof MarginSettings, value: number) => {
    setRulerState(prev => ({
      ...prev,
      margins: {
        ...prev.margins,
        [side]: Math.max(0, value),
      },
    }));
  }, []);

  const updateMargins = useCallback((margins: Partial<MarginSettings>) => {
    setRulerState(prev => ({
      ...prev,
      margins: {
        ...prev.margins,
        ...margins,
      },
    }));
  }, []);

  const updateIndent = useCallback((type: keyof IndentSettings, value: number) => {
    setRulerState(prev => ({
      ...prev,
      indents: {
        ...prev.indents,
        [type]: Math.max(0, value),
      },
    }));
  }, []);

  const updateIndents = useCallback((indents: Partial<IndentSettings>) => {
    setRulerState(prev => ({
      ...prev,
      indents: {
        ...prev.indents,
        ...indents,
      },
    }));
  }, []);

  const addTabStop = useCallback((position: number, type: TabStopType = 'left') => {
    const newTabStop: TabStop = {
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position,
      type,
    };
    setRulerState(prev => ({
      ...prev,
      tabStops: [...prev.tabStops, newTabStop].sort((a, b) => a.position - b.position),
    }));
    return newTabStop.id;
  }, []);

  const updateTabStop = useCallback((id: string, updates: Partial<Omit<TabStop, 'id'>>) => {
    setRulerState(prev => ({
      ...prev,
      tabStops: prev.tabStops
        .map(tab => tab.id === id ? { ...tab, ...updates } : tab)
        .sort((a, b) => a.position - b.position),
    }));
  }, []);

  const removeTabStop = useCallback((id: string) => {
    setRulerState(prev => ({
      ...prev,
      tabStops: prev.tabStops.filter(tab => tab.id !== id),
    }));
  }, []);

  const clearAllTabStops = useCallback(() => {
    setRulerState(prev => ({
      ...prev,
      tabStops: [],
    }));
  }, []);

  const resetRulerState = useCallback(() => {
    setRulerState({
      ...DEFAULT_RULER_STATE,
      visible: rulerState.visible, // Keep visibility state
      showVertical: rulerState.showVertical,
    });
  }, [rulerState.visible, rulerState.showVertical]);

  return {
    rulerState,
    isHydrated,
    toggleRulerVisibility,
    toggleVerticalRuler,
    setRulerUnit,
    setZoom,
    updateMargin,
    updateMargins,
    updateIndent,
    updateIndents,
    addTabStop,
    updateTabStop,
    removeTabStop,
    clearAllTabStops,
    resetRulerState,
  };
};
