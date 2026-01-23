// lib/export-pdf.ts (Canvas-based alternative - requires jspdf@latest)

import { toast } from 'sonner';
import { Page, CanvasElement, HeaderFooter } from '@/app/dashboard/canvas/_components/editor/types';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from '@/app/dashboard/canvas/_components/editor/constants';

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  Short: { width: 612, height: 792 },
  Long: { width: 612, height: 936 },
};

const processDynamicText = (text: string, pageNumber: number, totalPages: number): string => {
  return text
    .replace(/\{\{pageNumber\}\}/g, pageNumber.toString())
    .replace(/\{\{totalPages\}\}/g, totalPages.toString());
};

const drawElementsOnCanvas = (
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  offsetY: number,
  pageNumber?: number,
  totalPages?: number
): Promise<void> => {
  const promises: Promise<void>[] = [];

  elements.forEach((element: CanvasElement) => {
    if (element.visible === false) return;

    if (element.type === 'text') {
      const displayText = pageNumber && totalPages 
        ? processDynamicText(element.text, pageNumber, totalPages)
        : element.text;

      ctx.save();
      ctx.font = `${element.italic ? 'italic ' : ''}${element.bold ? 'bold ' : ''}${element.fontSize}px ${element.fontFamily}`;
      ctx.fillStyle = element.color;
      ctx.textBaseline = 'top';

      if (element.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      if (element.outline) {
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 0.5;
        ctx.strokeText(displayText, element.x, element.y + offsetY);
      }

      ctx.fillText(displayText, element.x, element.y + offsetY);

      if (element.underline) {
        const metrics = ctx.measureText(displayText);
        ctx.beginPath();
        ctx.moveTo(element.x, element.y + offsetY + element.fontSize + 2);
        ctx.lineTo(element.x + metrics.width, element.y + offsetY + element.fontSize + 2);
        ctx.strokeStyle = element.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    } else if (element.type === 'image') {
      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, element.x, element.y + offsetY, element.width, element.height);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = element.src;
      });
      promises.push(promise);
    }
  });

  return Promise.all(promises).then(() => {});
};

export async function exportAsPDF(pages: Page[], header: HeaderFooter, footer: HeaderFooter) {
  toast.info('Generating PDF...');
  
  try {
    const { jsPDF } = await import('jspdf');
    
    const firstPageSize = PAGE_SIZES[pages[0]?.size] || PAGE_SIZES.A4;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [firstPageSize.width, firstPageSize.height],
      compress: true
    });

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      const pageSize = PAGE_SIZES[page.size] || PAGE_SIZES.A4;
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = pageSize.width;
      canvas.height = pageSize.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Fill page background
      ctx.fillStyle = page.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, pageSize.width, pageSize.height);

      // Draw header
      ctx.fillStyle = header.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, pageSize.width, HEADER_HEIGHT);
      await drawElementsOnCanvas(ctx, header.elements, 0, pageIndex + 1, pages.length);

      // Draw page body
      const bodyHeight = pageSize.height - HEADER_HEIGHT - FOOTER_HEIGHT;
      ctx.fillStyle = page.backgroundColor || '#ffffff';
      ctx.fillRect(0, HEADER_HEIGHT, pageSize.width, bodyHeight);
      await drawElementsOnCanvas(ctx, page.elements, HEADER_HEIGHT);

      // Draw footer
      ctx.fillStyle = footer.backgroundColor || '#ffffff';
      ctx.fillRect(0, HEADER_HEIGHT + bodyHeight, pageSize.width, FOOTER_HEIGHT);
      await drawElementsOnCanvas(ctx, footer.elements, HEADER_HEIGHT + bodyHeight, pageIndex + 1, pages.length);

      // Add page to PDF
      if (pageIndex > 0) {
        pdf.addPage([pageSize.width, pageSize.height]);
      }

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pageSize.width, pageSize.height);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    pdf.save(`canvas-export-${timestamp}.pdf`);
    
    toast.success('PDF exported successfully!');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast.error('Failed to export PDF. Please try again.');
  }
}