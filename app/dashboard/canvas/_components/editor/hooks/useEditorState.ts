// app/dashboard/canvas/_components/editor/hooks/useEditorState.ts

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { loadGoogleFont } from '@/lib/fonts';
import { Page, CanvasElement, TextElement, ImageElement, HeaderFooter } from '../types';
import { createNewPage, generateId } from '../utils';
import { getPageDimensions, HEADER_HEIGHT, FOOTER_HEIGHT } from '../constants';

type SectionType = 'header' | 'page' | 'footer';

export const useEditorState = (
  initialPages: Page[], 
  initialIndex: number,
  initialHeader?: HeaderFooter,
  initialFooter?: HeaderFooter
) => {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [currentPageIndex, setCurrentPageIndex] = useState(initialIndex);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isEditingElementId, setIsEditingElementId] = useState<string | null>(null);
  const [header, setHeader] = useState<HeaderFooter>(initialHeader || { elements: [] });
  const [footer, setFooter] = useState<HeaderFooter>(initialFooter || { elements: [] });

  const currentPage = pages[currentPageIndex];
  
  const selectedElement = currentPage?.elements.find((el) => el.id === selectedElementId) ||
                          header.elements.find((el) => el.id === selectedElementId) ||
                          footer.elements.find((el) => el.id === selectedElementId);

  const updateCurrentPage = useCallback((updater: (page: Page) => Page) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = updater(newPages[currentPageIndex]);
      return newPages;
    });
  }, [currentPageIndex]);

  // Page operations
  const addPage = useCallback(() => {
    const newPage = createNewPage(currentPage.size, currentPage.orientation);
    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    setSelectedElementId(null);
    setIsEditingElementId(null);
    toast.success('Page added');
  }, [pages, currentPage]);

  const duplicatePage = useCallback(() => {
    const newPage: Page = {
      id: generateId(),
      size: currentPage.size,
      orientation: currentPage.orientation,
      elements: currentPage.elements.map((el) => ({
        ...el,
        id: generateId(),
      })),
      backgroundColor: currentPage.backgroundColor,
    };
    const newPages = [...pages.slice(0, currentPageIndex + 1), newPage, ...pages.slice(currentPageIndex + 1)];
    setPages(newPages);
    setCurrentPageIndex(currentPageIndex + 1);
    setSelectedElementId(null);
    setIsEditingElementId(null);
    toast.success('Page duplicated');
  }, [pages, currentPage, currentPageIndex]);

  const deletePage = useCallback(() => {
    if (pages.length === 1) {
      const newPage = createNewPage(currentPage.size, currentPage.orientation);
      setPages([newPage]);
      setCurrentPageIndex(0);
      setSelectedElementId(null);
      setIsEditingElementId(null);
      toast.success('Page deleted');
      return;
    }

    const newPages = pages.filter((_, i) => i !== currentPageIndex);
    const newIndex = currentPageIndex > 0 ? currentPageIndex - 1 : 0;
    
    setPages(newPages);
    setCurrentPageIndex(newIndex);
    setSelectedElementId(null);
    setIsEditingElementId(null);
    toast.success('Page deleted');
  }, [pages, currentPageIndex, currentPage]);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    const newPages = [...pages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);
    setPages(newPages);

    if (currentPageIndex === fromIndex) {
      setCurrentPageIndex(toIndex);
    } else if (currentPageIndex > fromIndex && currentPageIndex <= toIndex) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (currentPageIndex < fromIndex && currentPageIndex >= toIndex) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  }, [pages, currentPageIndex]);

  const changePageSize = useCallback((size: 'A4' | 'Short' | 'Long') => {
    updateCurrentPage((page) => ({ ...page, size }));
  }, [updateCurrentPage]);

  const changeOrientation = useCallback((orientation: 'portrait' | 'landscape') => {
    updateCurrentPage((page) => ({ ...page, orientation }));
  }, [updateCurrentPage]);

  const goToPreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setSelectedElementId(null);
      setIsEditingElementId(null);
    }
  }, [currentPageIndex]);

  const goToNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setSelectedElementId(null);
      setIsEditingElementId(null);
    }
  }, [currentPageIndex, pages.length]);

  // Element operations - now with section support
  const addText = useCallback((section: SectionType = 'page') => {
    const size = getPageDimensions(currentPage.size, currentPage.orientation);
    const elementWidth = 200;
    const elementHeight = section === 'footer' ? 20 : section === 'header' ? 24 : 30;
    const fontSize = section === 'footer' ? 12 : section === 'header' ? 14 : 16;
    const color = section === 'footer' ? '#666666' : '#000000';
    
    let centerX: number;
    let centerY: number;
    let sectionHeight: number;

    if (section === 'header') {
      sectionHeight = HEADER_HEIGHT;
      centerX = Math.max(0, (size.width - elementWidth) / 2);
      centerY = Math.max(0, (sectionHeight - elementHeight) / 2);
    } else if (section === 'footer') {
      sectionHeight = FOOTER_HEIGHT;
      centerX = Math.max(0, (size.width - elementWidth) / 2);
      centerY = Math.max(0, (sectionHeight - elementHeight) / 2);
    } else {
      sectionHeight = size.height - HEADER_HEIGHT - FOOTER_HEIGHT;
      centerX = Math.max(0, (size.width - elementWidth) / 2);
      centerY = Math.max(0, (sectionHeight - elementHeight) / 2);
    }

    const defaultText = section === 'header' ? 'Header Text' : section === 'footer' ? 'Footer Text' : 'Edit text';

    const newElement: TextElement = {
      id: generateId(),
      type: 'text',
      text: defaultText,
      x: centerX,
      y: centerY,
      fontSize: fontSize,
      fontFamily: 'font-sans',
      bold: false,
      italic: false,
      underline: false,
      color: color,
      shadow: false,
      outline: false,
      width: elementWidth,
      height: elementHeight,
      locked: false,
      visible: true,
    };

    if (section === 'header') {
      setHeader(prev => ({
        ...prev,
        elements: [...prev.elements, newElement]
      }));
    } else if (section === 'footer') {
      setFooter(prev => ({
        ...prev,
        elements: [...prev.elements, newElement]
      }));
    } else {
      updateCurrentPage((page) => ({
        ...page,
        elements: [...page.elements, newElement],
      }));
    }
    
    setSelectedElementId(newElement.id);
  }, [currentPage, updateCurrentPage]);

  const addImage = useCallback((src: string, section: SectionType = 'page') => {
    const size = getPageDimensions(currentPage.size, currentPage.orientation);

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let maxWidth: number;
      let maxHeight: number;
      let sectionHeight: number;

      if (section === 'header') {
        maxWidth = 120;
        maxHeight = HEADER_HEIGHT - 20;
        sectionHeight = HEADER_HEIGHT;
      } else if (section === 'footer') {
        maxWidth = 100;
        maxHeight = FOOTER_HEIGHT - 20;
        sectionHeight = FOOTER_HEIGHT;
      } else {
        maxWidth = 300;
        maxHeight = size.height - HEADER_HEIGHT - FOOTER_HEIGHT - 40;
        sectionHeight = size.height - HEADER_HEIGHT - FOOTER_HEIGHT;
      }

      const aspectRatio = img.height / img.width;
      let elementWidth = Math.min(maxWidth, size.width - 40);
      let elementHeight = elementWidth * aspectRatio;
      
      if (elementHeight > maxHeight) {
        elementHeight = maxHeight;
        elementWidth = elementHeight / aspectRatio;
      }
      
      const centerX = Math.max(0, (size.width - elementWidth) / 2);
      const centerY = Math.max(0, (sectionHeight - elementHeight) / 2);

      const newElement: ImageElement = {
        id: generateId(),
        type: 'image',
        src,
        x: centerX,
        y: centerY,
        width: elementWidth,
        height: elementHeight,
        locked: false,
        visible: true,
      };
      
      if (section === 'header') {
        setHeader(prev => ({
          ...prev,
          elements: [...prev.elements, newElement]
        }));
      } else if (section === 'footer') {
        setFooter(prev => ({
          ...prev,
          elements: [...prev.elements, newElement]
        }));
      } else {
        updateCurrentPage((page) => ({
          ...page,
          elements: [...page.elements, newElement],
        }));
      }
      
      setSelectedElementId(newElement.id);
      setIsEditingElementId(null);
      toast.success('Image added');
    };
    img.src = src;
  }, [currentPage, updateCurrentPage]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    if ('fontFamily' in updates && updates.fontFamily) {
      loadGoogleFont(updates.fontFamily);
    }

    const isInHeader = header.elements.some(el => el.id === id);
    if (isInHeader) {
      setHeader(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (el.id !== id) return el;
          if (el.type === 'text') {
            return { ...el, ...updates } as TextElement;
          } else {
            return { ...el, ...updates } as ImageElement;
          }
        })
      }));
      return;
    }

    const isInFooter = footer.elements.some(el => el.id === id);
    if (isInFooter) {
      setFooter(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (el.id !== id) return el;
          if (el.type === 'text') {
            return { ...el, ...updates } as TextElement;
          } else {
            return { ...el, ...updates } as ImageElement;
          }
        })
      }));
      return;
    }

    updateCurrentPage((page) => ({
      ...page,
      elements: page.elements.map((el) => {
        if (el.id !== id) return el;
        if (el.type === 'text') {
          return { ...el, ...updates } as TextElement;
        } else {
          return { ...el, ...updates } as ImageElement;
        }
      }),
    }));
  }, [updateCurrentPage, header, footer]);

  const deleteElement = useCallback((id: string) => {
    const isInHeader = header.elements.some(el => el.id === id);
    if (isInHeader) {
      setHeader(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== id)
      }));
      setSelectedElementId(null);
      return;
    }

    const isInFooter = footer.elements.some(el => el.id === id);
    if (isInFooter) {
      setFooter(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== id)
      }));
      setSelectedElementId(null);
      return;
    }

    updateCurrentPage((page) => ({
      ...page,
      elements: page.elements.filter((el) => el.id !== id),
    }));
    setSelectedElementId(null);
  }, [updateCurrentPage, header, footer]);

  const reorderElements = useCallback((fromIndex: number, toIndex: number) => {
    updateCurrentPage((page) => {
      const newElements = [...page.elements];
      const [movedElement] = newElements.splice(fromIndex, 1);
      newElements.splice(toIndex, 0, movedElement);
      return { ...page, elements: newElements };
    });
  }, [updateCurrentPage]);

  const selectPage = useCallback((index: number) => {
    setCurrentPageIndex(index);
    setSelectedElementId(null);
    setIsEditingElementId(null);
  }, []);

  // Background color operations
  const updateHeaderBackground = useCallback((color: string) => {
    setHeader(prev => ({ ...prev, backgroundColor: color }));
  }, []);

  const updateFooterBackground = useCallback((color: string) => {
    setFooter(prev => ({ ...prev, backgroundColor: color }));
  }, []);

  const updatePageBackground = useCallback((color: string) => {
    updateCurrentPage((page) => ({ ...page, backgroundColor: color }));
  }, [updateCurrentPage]);

  return {
    pages,
    currentPageIndex,
    currentPage,
    selectedElementId,
    selectedElement,
    isEditingElementId,
    header,
    footer,
    setSelectedElementId,
    setIsEditingElementId,
    addPage,
    duplicatePage,
    deletePage,
    reorderPages,
    changePageSize,
    changeOrientation,
    goToPreviousPage,
    goToNextPage,
    selectPage,
    addText,
    addImage,
    updateElement,
    deleteElement,
    reorderElements,
    updateHeaderBackground,
    updateFooterBackground,
    updatePageBackground,
  };
};