// lib/print-canvas/textUtils.ts

/**
 * Text measurement and wrapping utilities for canvas-based print generation.
 * Uses an off-screen canvas to accurately measure text dimensions.
 */

// Cache for the measurement canvas context
let measurementContext: CanvasRenderingContext2D | null = null;

/**
 * Gets or creates a shared canvas context for text measurement.
 */
function getMeasurementContext(): CanvasRenderingContext2D {
    if (!measurementContext) {
        if (typeof document !== 'undefined') {
            const canvas = document.createElement('canvas');
            measurementContext = canvas.getContext('2d');
        }
    }
    return measurementContext!;
}

/**
 * Measures the width of a text string in pixels.
 * @param text - The text to measure
 * @param fontSize - Font size in pixels
 * @param fontFamily - Font family name
 * @param bold - Whether the font is bold
 * @returns Width in pixels
 */
export function measureTextWidth(
    text: string,
    fontSize: number,
    fontFamily: string,
    bold: boolean = false
): number {
    const ctx = getMeasurementContext();
    if (!ctx) {
        // Fallback estimation when canvas is not available (SSR)
        const avgCharWidth = fontSize * 0.6;
        return text.length * avgCharWidth;
    }

    ctx.font = `${bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
    return ctx.measureText(text).width;
}

/**
 * Wraps text to fit within a maximum width.
 * @param text - The text to wrap
 * @param maxWidth - Maximum width in pixels
 * @param fontSize - Font size in pixels
 * @param fontFamily - Font family name
 * @param bold - Whether the font is bold
 * @returns Array of wrapped lines
 */
export function wrapText(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: string,
    bold: boolean = false
): string[] {
    if (!text || maxWidth <= 0) {
        return [text || ''];
    }

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = measureTextWidth(testLine, fontSize, fontFamily, bold);

        if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
}

/**
 * Calculates the height needed for wrapped text.
 * @param text - The text to measure
 * @param maxWidth - Maximum width in pixels
 * @param fontSize - Font size in pixels
 * @param fontFamily - Font family name
 * @param lineHeight - Line height multiplier (default 1.2)
 * @param bold - Whether the font is bold
 * @returns Height in pixels
 */
export function calculateTextHeight(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: string,
    lineHeight: number = 1.2,
    bold: boolean = false
): number {
    const lines = wrapText(text, maxWidth, fontSize, fontFamily, bold);
    return lines.length * fontSize * lineHeight;
}

/**
 * Pre-calculated row data with wrapped text and height.
 */
export interface WrappedCellData {
    columnKey: string;
    lines: string[];
    lineCount: number;
}

export interface WrappedRowData {
    cells: WrappedCellData[];
    rowHeight: number;
}

/**
 * Calculates wrapped text and row height for a single row.
 * @param cellValues - Map of column key to cell value
 * @param columnWidths - Map of column key to column width
 * @param fontSize - Font size in pixels
 * @param fontFamily - Font family name
 * @param textPadding - Padding inside cells
 * @param minRowHeight - Minimum row height
 * @param lineHeight - Line height multiplier
 * @returns Wrapped row data with cells and computed height
 */
export function calculateWrappedRow(
    cellValues: Map<string, string>,
    columnWidths: Map<string, number>,
    fontSize: number,
    fontFamily: string,
    textPadding: number,
    minRowHeight: number,
    lineHeight: number = 1.2
): WrappedRowData {
    const cells: WrappedCellData[] = [];
    let maxLineCount = 1;

    for (const [columnKey, value] of cellValues) {
        const colWidth = columnWidths.get(columnKey) || 100;
        const availableWidth = colWidth - (textPadding * 2);
        const lines = wrapText(value, availableWidth, fontSize, fontFamily, false);

        cells.push({
            columnKey,
            lines,
            lineCount: lines.length,
        });

        maxLineCount = Math.max(maxLineCount, lines.length);
    }

    // Calculate row height based on max line count
    const contentHeight = maxLineCount * fontSize * lineHeight;
    const rowHeight = Math.max(contentHeight + (textPadding * 2), minRowHeight);

    return { cells, rowHeight };
}

/**
 * Calculates wrapped text and row height for header row.
 * Headers may be bold, so we account for that.
 */
export function calculateWrappedHeader(
    columnLabels: Map<string, string>,
    columnWidths: Map<string, number>,
    fontSize: number,
    fontFamily: string,
    textPadding: number,
    minRowHeight: number,
    lineHeight: number = 1.2
): WrappedRowData {
    const cells: WrappedCellData[] = [];
    let maxLineCount = 1;

    for (const [columnKey, label] of columnLabels) {
        const colWidth = columnWidths.get(columnKey) || 100;
        const availableWidth = colWidth - (textPadding * 2);
        const lines = wrapText(label, availableWidth, fontSize, fontFamily, true);

        cells.push({
            columnKey,
            lines,
            lineCount: lines.length,
        });

        maxLineCount = Math.max(maxLineCount, lines.length);
    }

    const contentHeight = maxLineCount * fontSize * lineHeight;
    const rowHeight = Math.max(contentHeight + (textPadding * 2), minRowHeight);

    return { cells, rowHeight };
}
