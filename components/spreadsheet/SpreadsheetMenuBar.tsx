// app/components/Spreadsheet/SpreadsheetMenuBar.tsx

"use client";

import { Button } from "@/components/ui/button";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  ChevronDown,
  Type
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SpreadsheetMenuBarProps } from "./types";

export function SpreadsheetMenuBar({ 
  onExport,
  selectedColumn,
  selectedColumnType,
  columnAlignment,
  onAlignmentChange,
  onTextTransform,
}: SpreadsheetMenuBarProps) {
  const AlignmentIcon = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
  }[columnAlignment || "left"];

  // Check if selected column is text type
  const isTextColumn = selectedColumnType === "text";

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4 py-1 text-sm">
      <Button variant="ghost" className="h-8 px-3 text-sm font-normal text-gray-700 hover:bg-gray-100">
        File
      </Button>
      
      {onExport && (
        <Button 
          variant="ghost" 
          className="h-8 px-3 text-sm font-normal text-gray-700 hover:bg-gray-100"
          onClick={onExport}
        >
          Export
        </Button>
      )}
      
      <Button variant="ghost" className="h-8 px-3 text-sm font-normal text-gray-700 hover:bg-gray-100">
        Insert
      </Button>

      {/* Toolbar - Right side of Insert */}
      <div className="flex items-center gap-1 ml-2 border-l border-gray-200 pl-2">
        <TooltipProvider delayDuration={300}>
          {/* Alignment Controls */}
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-2 text-gray-700 hover:bg-gray-100"
                  >
                    <AlignmentIcon className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>Text alignment</p>
                <p className="text-gray-400 mt-1">Ctrl+Shift+L/E/R</p>
              </TooltipContent>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => onAlignmentChange("left")}
                  className="gap-2"
                >
                  <AlignLeft className="h-4 w-4" />
                  <span>Align Left</span>
                  <span className="ml-auto text-xs text-gray-400">⌘⇧L</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onAlignmentChange("center")}
                  className="gap-2"
                >
                  <AlignCenter className="h-4 w-4" />
                  <span>Align Center</span>
                  <span className="ml-auto text-xs text-gray-400">⌘⇧E</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onAlignmentChange("right")}
                  className="gap-2"
                >
                  <AlignRight className="h-4 w-4" />
                  <span>Align Right</span>
                  <span className="ml-auto text-xs text-gray-400">⌘⇧R</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Tooltip>

          {/* Text Transform Controls - Only show for text columns */}
          {isTextColumn && (
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-2 text-gray-700 hover:bg-gray-100"
                    >
                      <Type className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>Text case</p>
                  <p className="text-gray-400 mt-1">Transform text</p>
                </TooltipContent>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onTextTransform("uppercase")}>
                    <span className="font-semibold">UPPERCASE</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTextTransform("lowercase")}>
                    <span>lowercase</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTextTransform("camelCase")}>
                    <span className="font-mono text-sm">camelCase</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onTextTransform("reset")}>
                    Reset to Original
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}