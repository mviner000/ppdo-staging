// app/dashboard/particulars/_components/HierarchyHeader.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";

type SortOrder = "asc" | "desc";

interface HierarchyHeaderProps {
  sortOrder: SortOrder;
  onToggleSort: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  showSuggestions: boolean;
  searchSuggestions: Array<{
    type: string;
    label: string;
    secondary: string;
  }>;
  onSuggestionClick: (label: string) => void;
  isSearchActive?: boolean;
}

export function HierarchyHeader({
  sortOrder,
  onToggleSort,
  searchTerm,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  showSuggestions,
  searchSuggestions,
  onSuggestionClick,
  isSearchActive = false,
}: HierarchyHeaderProps) {
  return (
    <div className="py-2 px-2 md:px-4 border-b space-y-2">
      {/* Column Headers - Desktop */}
      <div className="hidden md:grid md:grid-cols-12 gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 pb-1 border-b">
        <div className="col-span-5 flex items-center gap-2">
          <span>Particular Name</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSort}
            className="h-5 w-5 p-0"
          >
            {sortOrder === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="col-span-3 text-center">Implementing Office</div>
        <div className="col-span-4 text-right">
          {isSearchActive ? "Budget" : "Totals"}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
          <span>Particulars</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSort}
            className="h-6 w-6 p-0"
          >
            {sortOrder === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Search with Suggestions */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search particulars, projects, or agencies..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          className="pl-9 h-9 text-sm"
        />

        {/* Search Suggestions Dropdown */}
        {showSuggestions &&
          searchTerm.length >= 2 &&
          searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b last:border-b-0"
                  onClick={() => onSuggestionClick(suggestion.label)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {suggestion.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {suggestion.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.secondary}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
      </div>

    </div>
  );
}