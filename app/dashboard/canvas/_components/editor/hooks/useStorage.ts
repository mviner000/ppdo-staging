// app/dashboard/canvas/_components/editor/hooks/useStorage.ts

import { useEffect, useState } from 'react';
import { loadGoogleFonts } from '@/lib/fonts';
import { Page, CanvasElement, HeaderFooter } from '../types';
import { STORAGE_KEY } from '../constants';

interface StorageData {
  pages: Page[];
  currentPageIndex: number;
  header?: HeaderFooter;
  footer?: HeaderFooter;
}

interface UseStorageReturn {
  isHydrated: boolean;
  savedPages: Page[] | null;
  savedIndex: number | null;
  savedHeader: HeaderFooter | null;
  savedFooter: HeaderFooter | null;
}

export const useStorage = (): UseStorageReturn => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [savedPages, setSavedPages] = useState<Page[] | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [savedHeader, setSavedHeader] = useState<HeaderFooter | null>(null);
  const [savedFooter, setSavedFooter] = useState<HeaderFooter | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { 
          pages: loadedPages, 
          currentPageIndex: loadedIndex,
          header: loadedHeader,
          footer: loadedFooter
        } = JSON.parse(savedState) as StorageData;
        
        setSavedPages(loadedPages);
        setSavedIndex(loadedIndex);
        setSavedHeader(loadedHeader || { elements: [] });
        setSavedFooter(loadedFooter || { elements: [] });

        const usedFonts = new Set<string>();
        loadedPages.forEach((page: Page) => {
          page.elements.forEach((element: CanvasElement) => {
            if (element.type === 'text') {
              usedFonts.add(element.fontFamily);
            }
          });
        });

        // Load fonts from header and footer
        if (loadedHeader) {
          loadedHeader.elements.forEach((element: CanvasElement) => {
            if (element.type === 'text') {
              usedFonts.add(element.fontFamily);
            }
          });
        }
        if (loadedFooter) {
          loadedFooter.elements.forEach((element: CanvasElement) => {
            if (element.type === 'text') {
              usedFonts.add(element.fontFamily);
            }
          });
        }

        loadGoogleFonts(Array.from(usedFonts));
      } catch (error) {
        console.error('[v0] Failed to load editor state:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  return { isHydrated, savedPages, savedIndex, savedHeader, savedFooter };
};

export const useSaveStorage = (
  pages: Page[], 
  currentPageIndex: number, 
  header: HeaderFooter,
  footer: HeaderFooter,
  isHydrated: boolean
) => {
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        pages, 
        currentPageIndex,
        header,
        footer
      }));
    }
  }, [pages, currentPageIndex, header, footer, isHydrated]);
};