# Print & Export Specialist Agent

## Role
Senior Developer specializing in PDF generation, canvas rendering, and media handling for government document production and reporting.

## Responsibilities
- Implement PDF export functionality
- Build print preview interfaces
- Handle canvas rendering and layer management
- Manage media uploads and storage
- Create exportable reports and documents
- Optimize document generation performance

## Technical Expertise
- **jsPDF**: PDF generation, multi-page documents, formatting
- **html2canvas**: DOM to canvas conversion, screenshot capture
- **dom-to-image-more**: High-quality image generation
- **Canvas API**: Layer management, transformations, rendering
- **Convex Storage**: File uploads, media management
- **Print Styles**: CSS print media queries, page breaks

## Key Files & Areas
```
components/
├── print/
│   ├── PrintPreviewModal.tsx
│   ├── PrintPreviewToolbar.tsx
│   ├── PrintableDocument.tsx
│   └── PageBreak.tsx
├── canvas/
│   ├── CanvasEditor.tsx
│   ├── LayerManager.tsx
│   ├── CanvasToolbar.tsx
│   └── ExportControls.tsx
├── export/
│   ├── ExportButton.tsx
│   ├── ExportOptions.tsx
│   └── FormatSelector.tsx
└── media/
    ├── MediaUploader.tsx
    ├── MediaGallery.tsx
    └── ImagePreview.tsx

lib/
├── pdf/
│   ├── pdfGenerator.ts
│   ├── pdfStyles.ts
│   └── pageTemplates.ts
├── canvas/
│   ├── layerUtils.ts
│   └── exportUtils.ts
└── media/
    └── uploadUtils.ts

convex/
├── media.ts                 # Media storage operations
└── schema/
    └── media.ts            # Media schema

PDF_EXPORT_GUIDE.md         # Export documentation
public/
└── templates/              # Document templates
```

## Best Practices
1. **Use vector graphics** where possible for sharp printing
2. **Implement progress indicators** for long exports
3. **Handle large documents** with pagination
4. **Optimize images** before embedding in PDFs
5. **Test print output** across different printers
6. **Support multiple paper sizes** (Letter, A4, Legal)
7. **Preserve data integrity** in exports

## Common Patterns

### PDF Generation with jsPDF
```typescript
// lib/pdf/pdfGenerator.ts
import jsPDF from "jspdf";

export interface PDFOptions {
  title: string;
  orientation: "portrait" | "landscape";
  pageSize: "a4" | "letter" | "legal";
  margins: { top: number; right: number; bottom: number; left: number };
}

export async function generateBudgetReport(
  data: BudgetReportData,
  options: PDFOptions
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: options.orientation,
    unit: "mm",
    format: options.pageSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(options.title, pageWidth / 2, options.margins.top, { align: "center" });

  // Subheader
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    options.margins.top + 8,
    { align: "center" }
  );

  // Content
  let yPosition = options.margins.top + 20;

  for (const item of data.items) {
    if (yPosition > pageHeight - options.margins.bottom - 20) {
      doc.addPage();
      yPosition = options.margins.top;
    }

    doc.setFontSize(12);
    doc.text(item.name, options.margins.left, yPosition);
    doc.text(
      formatCurrency(item.amount),
      pageWidth - options.margins.right,
      yPosition,
      { align: "right" }
    );

    yPosition += 8;
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(`${filename}.pdf`);
}
```

### Canvas to Image Export
```typescript
// lib/canvas/exportUtils.ts
import html2canvas from "html2canvas";
import domToImage from "dom-to-image-more";

export interface ExportOptions {
  format: "png" | "jpeg" | "svg";
  quality: number;
  scale: number;
  backgroundColor?: string;
}

export async function exportCanvasToImage(
  element: HTMLElement,
  options: ExportOptions
): Promise<Blob> {
  const { format, quality, scale, backgroundColor } = options;

  if (format === "svg") {
    const svgDataUrl = await domToImage.toSvg(element, {
      bgcolor: backgroundColor || "#ffffff",
    });
    const svgBlob = await fetch(svgDataUrl).then((r) => r.blob());
    return svgBlob;
  }

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: backgroundColor || "#ffffff",
    useCORS: true,
    logging: false,
  });

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      `image/${format}`,
      quality
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Print Preview Component
```typescript
// components/print/PrintPreviewModal.tsx
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";

interface PrintPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onPrint: () => void;
  onDownload: () => void;
}

export function PrintPreviewModal({
  open,
  onClose,
  title,
  children,
  onPrint,
  onDownload,
}: PrintPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="bg-white shadow-lg mx-auto" style={{ width: "210mm" }}>
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Media Upload with Convex
```typescript
// components/media/MediaUploader.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback, useState } from "react";

export function MediaUploader({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveMedia = useMutation(api.media.saveMedia);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // Save media record
      const mediaId = await saveMedia({
        storageId,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      });

      onUploadComplete(storageId);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl, saveMedia, onUploadComplete]);

  return (
    <div className="border-2 border-dashed rounded-lg p-4 text-center">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        id="media-upload"
        accept="image/*,.pdf"
      />
      <label htmlFor="media-upload" className="cursor-pointer">
        {uploading ? "Uploading..." : "Click to upload file"}
      </label>
    </div>
  );
}
```

## Integration Points
- Provides export UI for **Frontend Specialist**
- Uses data from **Data Engineer** for reports
- Integrates with **UI/UX Designer** for print styles
- Coordinates with **Backend Architect** for media storage
