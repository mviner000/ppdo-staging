// app/(extra)/canvas/_components/editor/toolbar.tsx

'use client';

import { useState } from 'react';
import { loadGoogleFont } from '@/lib/fonts';
import { exportAsPDF } from '@/lib/export-pdf';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bold, Italic, Underline, Plus, Printer, FileDown, X } from 'lucide-react';
import { CanvasElement, Page, HeaderFooter } from './types';

type ActiveSection = 'header' | 'page' | 'footer';

interface ToolbarProps {
  selectedElement?: CanvasElement;
  onUpdateElement?: (updates: Partial<CanvasElement>) => void;
  onAddText: () => void;
  pageSize?: 'A4' | 'Short' | 'Long';
  orientation?: 'portrait' | 'landscape';
  onPageSizeChange?: (size: 'A4' | 'Short' | 'Long') => void;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  onPrint?: () => void;
  activeSection: ActiveSection;
  headerBackgroundColor: string;
  footerBackgroundColor: string;
  pageBackgroundColor: string;
  onHeaderBackgroundChange: (color: string) => void;
  onFooterBackgroundChange: (color: string) => void;
  onPageBackgroundChange: (color: string) => void;
  pages: Page[];
  header: HeaderFooter;
  footer: HeaderFooter;
  isEditorMode?: boolean;
}

const FONT_FAMILIES = [
  { value: 'font-sans', label: 'System Sans' },
  { value: 'font-serif', label: 'System Serif' },
  { value: 'font-mono', label: 'System Mono' },
  { value: 'Inter', label: 'Inter', fontFamily: 'Inter' },
  { value: 'Roboto', label: 'Roboto', fontFamily: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans', fontFamily: 'Open Sans' },
  { value: 'Lato', label: 'Lato', fontFamily: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat', fontFamily: 'Montserrat' },
];

const FONT_SIZES = [
  { value: '12', label: '12px' },
  { value: '14', label: '14px' },
  { value: '16', label: '16px' },
  { value: '18', label: '18px' },
  { value: '20', label: '20px' },
  { value: '24', label: '24px' },
  { value: '28', label: '28px' },
  { value: '32', label: '32px' },
  { value: '36', label: '36px' },
  { value: '48', label: '48px' },
];

export default function Toolbar({
  selectedElement,
  onUpdateElement,
  onAddText,
  pageSize = 'A4',
  orientation = 'portrait',
  onPageSizeChange,
  onOrientationChange,
  onPrint,
  activeSection,
  headerBackgroundColor,
  footerBackgroundColor,
  pageBackgroundColor,
  onHeaderBackgroundChange,
  onFooterBackgroundChange,
  onPageBackgroundChange,
  pages,
  header,
  footer,
  isEditorMode = true,
}: ToolbarProps) {
  const isDisabled = !selectedElement || !onUpdateElement;
  const isTextElement = selectedElement?.type === 'text';
  const [hexInput, setHexInput] = useState('');
  const [showHexInput, setShowHexInput] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFontFamilyChange = (value: string) => {
    loadGoogleFont(value);
    
    if (onUpdateElement) {
      onUpdateElement({ fontFamily: value });
    }
  };

  const handleFontSizeChange = (value: string) => {
    if (onUpdateElement) {
      onUpdateElement({ fontSize: parseInt(value) });
    }
  };

  const textElement = selectedElement?.type === 'text' ? selectedElement : null;

  const toggleBold = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ bold: !textElement.bold });
    }
  };

  const toggleItalic = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ italic: !textElement.italic });
    }
  };

  const toggleUnderline = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ underline: !textElement.underline });
    }
  };

  const toggleShadow = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ shadow: !textElement.shadow });
    }
  };

  const toggleOutline = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ outline: !textElement.outline });
    }
  };

  const getSectionLabel = () => {
    switch (activeSection) {
      case 'header': return 'Header';
      case 'footer': return 'Footer';
      default: return 'Page';
    }
  };

  const getSectionColor = () => {
    switch (activeSection) {
      case 'header': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'footer': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getCurrentBackgroundColor = () => {
    switch (activeSection) {
      case 'header': return headerBackgroundColor;
      case 'footer': return footerBackgroundColor;
      default: return pageBackgroundColor;
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    switch (activeSection) {
      case 'header': 
        onHeaderBackgroundChange(color);
        break;
      case 'footer': 
        onFooterBackgroundChange(color);
        break;
      default: 
        onPageBackgroundChange(color);
        break;
    }
  };

  const handleHexSubmit = () => {
    let color = hexInput.trim();
    if (!color.startsWith('#')) {
      color = '#' + color;
    }
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      handleBackgroundColorChange(color);
      setShowHexInput(false);
      setHexInput('');
    }
  };

  const handleHexKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHexSubmit();
    } else if (e.key === 'Escape') {
      setShowHexInput(false);
      setHexInput('');
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportAsPDF(pages, header, footer);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full bg-stone-100">
      <div className="flex items-center gap-2 px-4 py-2">
        {isEditorMode && (
          <>
            <div className={`px-2 py-1 rounded text-xs font-semibold border ${getSectionColor()}`}>
              Editing: {getSectionLabel()}
            </div>

            <Separator orientation="vertical" className="h-5" />

            <div className="flex items-center gap-2 bg-white rounded-md border border-stone-300 px-2.5 py-1.5 shadow-sm">
              <label className="text-xs text-stone-600 font-medium whitespace-nowrap">Background</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={getCurrentBackgroundColor()}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-8 h-8 border-2 border-stone-200 rounded-md cursor-pointer transition-all hover:border-stone-400"
                  title="Pick background color"
                />
                <Popover open={showHexInput} onOpenChange={setShowHexInput}>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 text-xs font-mono hover:bg-stone-100"
                      title="Enter hex code"
                    >
                      {getCurrentBackgroundColor().toUpperCase()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-3 z-50" align="start" side="bottom" sideOffset={4}>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-stone-700">Hex Color</label>
                        <Button
                          onClick={() => {
                            setShowHexInput(false);
                            setHexInput('');
                          }}
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 hover:bg-stone-100"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-stone-500 font-mono">#</span>
                        <input
                          type="text"
                          value={hexInput}
                          onChange={(e) => setHexInput(e.target.value)}
                          onKeyDown={handleHexKeyDown}
                          placeholder="FFFFFF"
                          maxLength={6}
                          className="w-2.5 flex-1 px-2 py-1.5 text-sm font-mono border border-stone-300 rounded-md uppercase focus:outline-none focus:ring-2 focus:ring-[#4FBA76]"
                          autoFocus
                        />
                      </div>
                      <Button
                        onClick={handleHexSubmit}
                        size="sm"
                        className="h-8 w-full text-xs bg-[#4FBA76] hover:bg-[#45a869] text-white"
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator orientation="vertical" className="h-5" />

            <Button
              onClick={onAddText}
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs bg-white"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Text
            </Button>

            <Separator orientation="vertical" className="h-5" />

            <Select value={pageSize} onValueChange={onPageSizeChange}>
              <SelectTrigger className="w-28 h-8 text-xs bg-white">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Short">Short (8.5 x 11")</SelectItem>
                <SelectItem value="Long">Long (8.5 x 13")</SelectItem>
              </SelectContent>
            </Select>

            <Select value={orientation} onValueChange={onOrientationChange}>
              <SelectTrigger className="w-28 h-8 text-xs bg-white">
                <SelectValue placeholder="Orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>

            {isTextElement && (
              <>
                <Separator orientation="vertical" className="h-5" />

                <Select value={textElement?.fontFamily || 'font-sans'} onValueChange={handleFontFamilyChange} disabled={isDisabled}>
                  <SelectTrigger className="w-28 h-8 text-xs bg-white">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedElement?.fontSize.toString() || '16'} onValueChange={handleFontSizeChange} disabled={isDisabled}>
                  <SelectTrigger className="w-24 h-8 text-xs bg-white">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Separator orientation="vertical" className="h-5" />

                <Button
                  onClick={toggleBold}
                  size="sm"
                  variant="outline"
                  disabled={isDisabled}
                  className={`w-8 h-8 p-0 ${selectedElement?.bold ? 'bg-stone-200' : 'bg-white'}`}
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </Button>

                <Button
                  onClick={toggleItalic}
                  size="sm"
                  variant="outline"
                  disabled={isDisabled}
                  className={`w-8 h-8 p-0 ${selectedElement?.italic ? 'bg-stone-200' : 'bg-white'}`}
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </Button>

                <Button
                  onClick={toggleUnderline}
                  size="sm"
                  variant="outline"
                  disabled={isDisabled}
                  className={`w-8 h-8 p-0 ${selectedElement?.underline ? 'bg-stone-200' : 'bg-white'}`}
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </Button>

                <Separator orientation="vertical" className="h-5" />

                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-stone-600">Color:</label>
                  <input
                    type="color"
                    value={selectedElement?.color || '#000000'}
                    onChange={(e) => onUpdateElement?.({ color: e.target.value })}
                    disabled={isDisabled}
                    className="w-7 h-7 border border-stone-300 rounded cursor-pointer bg-white"
                  />
                </div>

                <Separator orientation="vertical" className="h-5" />

                <Button
                  onClick={toggleShadow}
                  size="sm"
                  variant="outline"
                  disabled={isDisabled}
                  className={`text-xs h-8 px-2.5 ${selectedElement?.shadow ? 'bg-stone-200' : 'bg-white'}`}
                  title="Shadow"
                >
                  Shadow
                </Button>

                <Button
                  onClick={toggleOutline}
                  size="sm"
                  variant="outline"
                  disabled={isDisabled}
                  className={`text-xs h-8 px-2.5 ${selectedElement?.outline ? 'bg-stone-200' : 'bg-white'}`}
                  title="Outline"
                >
                  Outline
                </Button>
              </>
            )}

            <Separator orientation="vertical" className="h-5 ml-auto" />
          </>
        )}

        {!isEditorMode && (
          <>
            <span className="text-xs text-stone-600 font-medium">
              SIZE: <span className="text-stone-700">{pageSize === 'Short' ? 'Short (8.5×11")' : pageSize === 'Long' ? 'Long (8.5×13")' : pageSize}</span>
              {' '}<span className="text-stone-400">|</span>{' '}
              ORIENTATION: <span className="text-stone-700 capitalize">{orientation}</span>
            </span>

            <Separator orientation="vertical" className="h-5 ml-auto" />
          </>
        )}

        <Button
          onClick={handleExportPDF}
          size="sm"
          variant="outline"
          disabled={isExporting}
          className="gap-1.5 h-8 text-xs bg-white"
        >
          <FileDown className="w-3.5 h-3.5" />
          {isExporting ? 'Exporting...' : 'Export as PDF'}
        </Button>

        {isEditorMode && (
          <Button
            onClick={onPrint}
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs bg-white"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
        )}
      </div>
    </div>
  );
}