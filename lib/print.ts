// lib/print.ts

import { Page, CanvasElement, HeaderFooter } from '@/app/dashboard/canvas/_components/editor/types';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from '@/app/dashboard/canvas/_components/editor/constants';

const PAGE_SIZES: Record<string, { width: number; height: number; widthInch: number; heightInch: number }> = {
  A4: { width: 595, height: 842, widthInch: 8.27, heightInch: 11.69 },
  Short: { width: 612, height: 792, widthInch: 8.5, heightInch: 11 },
  Long: { width: 612, height: 936, widthInch: 8.5, heightInch: 13 },
};

const processDynamicText = (text: string, pageNumber: number, totalPages: number): string => {
  return text
    .replace(/\{\{pageNumber\}\}/g, pageNumber.toString())
    .replace(/\{\{totalPages\}\}/g, totalPages.toString());
};

const renderElements = (
  elements: CanvasElement[], 
  pageDiv: HTMLDivElement, 
  pageNumber?: number, 
  totalPages?: number
) => {
  elements.forEach((element: CanvasElement) => {
    if (element.visible === false) return;
    
    if (element.type === 'text') {
      const textDiv = document.createElement('div');
      textDiv.setAttribute('data-element-type', 'text');
      textDiv.setAttribute('data-element-id', element.id);
      
      textDiv.style.cssText = `
        position: absolute;
        left: ${element.x}px;
        top: ${element.y}px;
        width: ${element.width}px;
        min-height: ${element.height}px;
        font-size: ${element.fontSize}px;
        font-weight: ${element.bold ? '700' : '400'};
        font-style: ${element.italic ? 'italic' : 'normal'};
        text-decoration: ${element.underline ? 'underline' : 'none'};
        color: ${element.color};
        overflow: hidden;
        word-wrap: break-word;
        white-space: pre-wrap;
        text-shadow: ${element.shadow ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'};
        -webkit-text-stroke: ${element.outline ? '0.5px rgba(0,0,0,0.5)' : 'none'};
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        line-height: normal;
      `;

      const googleFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];
      if (googleFonts.includes(element.fontFamily)) {
        textDiv.style.fontFamily = `'${element.fontFamily}', sans-serif`;
      } else if (element.fontFamily === 'font-serif') {
        textDiv.style.fontFamily = 'Georgia, serif';
      } else if (element.fontFamily === 'font-mono') {
        textDiv.style.fontFamily = 'monospace';
      } else {
        textDiv.style.fontFamily = 'sans-serif';
      }

      const displayText = pageNumber && totalPages 
        ? processDynamicText(element.text, pageNumber, totalPages)
        : element.text;
      
      textDiv.textContent = displayText;
      pageDiv.appendChild(textDiv);
    } else if (element.type === 'image') {
      const imgDiv = document.createElement('img');
      imgDiv.src = element.src;
      imgDiv.alt = element.name || 'Image';
      imgDiv.setAttribute('data-element-type', 'image');
      imgDiv.setAttribute('data-element-id', element.id);
      
      imgDiv.style.cssText = `
        position: absolute;
        left: ${element.x}px;
        top: ${element.y}px;
        width: ${element.width}px;
        height: ${element.height}px;
        object-fit: contain;
        display: block;
        margin: 0;
        padding: 0;
      `;
      
      pageDiv.appendChild(imgDiv);
    }
  });
};

export function printAllPages(pages: Page[], header: HeaderFooter, footer: HeaderFooter) {
  let printStyleElement = document.getElementById('canvas-print-styles');
  if (!printStyleElement) {
    printStyleElement = document.createElement('style');
    printStyleElement.id = 'canvas-print-styles';
    printStyleElement.textContent = `
      @media print {
        body > *:not(#__print-container) {
          display: none !important;
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }
        
        #__print-container {
          display: block !important;
          position: static !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          visibility: visible !important;
        }
        
        #__print-container * {
          visibility: visible !important;
        }
        .print-page {
          page-break-after: always !important;
          page-break-inside: avoid !important;
          break-after: page !important;
          break-inside: avoid !important;
          margin: 0 auto !important;
          padding: 0 !important;
          display: block !important;
          position: relative !important;
          overflow: visible !important;
        }
        
        .print-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        
        .print-page img {
          display: block !important;
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid !important;
        }
        
        .print-page div[data-element-type="text"] {
          display: block !important;
        }
        
        @page {
          margin: 0;
          size: auto;
        }
      }
    `;
    document.head.appendChild(printStyleElement);
  }
  const existingContainer = document.getElementById('__print-container');
  if (existingContainer) {
    document.body.removeChild(existingContainer);
  }
  const printContainer = document.createElement('div');
  printContainer.id = '__print-container';
  printContainer.style.cssText = 'position: fixed; left: -99999px; top: 0; width: 100%; z-index: -1; pointer-events: none;';
  
  pages.forEach((page, pageIndex) => {
    const pageSize = PAGE_SIZES[page.size] || PAGE_SIZES.A4;
    const pageDiv = document.createElement('div');
    pageDiv.className = 'print-page';
    pageDiv.style.cssText = `
      width: ${pageSize.width}px;
      height: ${pageSize.height}px;
      position: relative;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      overflow: hidden;
    `;

    // Render header
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: ${pageSize.width}px;
      height: ${HEADER_HEIGHT}px;
      background-color: ${header.backgroundColor || '#ffffff'};
    `;
    renderElements(header.elements, headerDiv, pageIndex + 1, pages.length);
    pageDiv.appendChild(headerDiv);

    // Render page body
    const bodyDiv = document.createElement('div');
    const bodyHeight = pageSize.height - HEADER_HEIGHT - FOOTER_HEIGHT;
    bodyDiv.style.cssText = `
      position: absolute;
      left: 0;
      top: ${HEADER_HEIGHT}px;
      width: ${pageSize.width}px;
      height: ${bodyHeight}px;
      background-color: ${page.backgroundColor || '#ffffff'};
    `;
    renderElements(page.elements, bodyDiv);
    pageDiv.appendChild(bodyDiv);

    // Render footer
    const footerDiv = document.createElement('div');
    footerDiv.style.cssText = `
      position: absolute;
      left: 0;
      top: ${HEADER_HEIGHT + bodyHeight}px;
      width: ${pageSize.width}px;
      height: ${FOOTER_HEIGHT}px;
      background-color: ${footer.backgroundColor || '#ffffff'};
    `;
    renderElements(footer.elements, footerDiv, pageIndex + 1, pages.length);
    pageDiv.appendChild(footerDiv);
    
    printContainer.appendChild(pageDiv);
  });
  
  document.body.appendChild(printContainer);
  const images = printContainer.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve(true);
      } else {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 5000);
      }
    });
  });

  Promise.all(imagePromises).then(() => {
    setTimeout(() => {
      window.print();
      const cleanup = () => {
        const container = document.getElementById('__print-container');
        if (container && document.body.contains(container)) {
          document.body.removeChild(container);
        }
      };
      
      const afterPrintHandler = () => {
        cleanup();
        window.removeEventListener('afterprint', afterPrintHandler);
      };
      window.addEventListener('afterprint', afterPrintHandler);
      
      setTimeout(cleanup, 2000);
    }, 500);
  });
}