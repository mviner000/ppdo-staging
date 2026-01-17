// app/dashboard/particulars/_components/SearchResultsView.tsx

"use client";

import { useState, useMemo } from "react";
import { Search as SearchIcon, Filter, X, Eye, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SearchResultDetailModal } from "./SearchResultDetailModal";
import { SearchResultDeleteDialog } from "./SearchResultDeleteDialog";

type NodeType = "budget" | "project" | "breakdown";
type StatusType = "completed" | "delayed" | "ongoing";

interface SearchResult {
  type: NodeType;
  item: any;
  parent?: string;
  children?: SearchResult[];
}

interface SearchResultsViewProps {
  results: SearchResult[];
  onEdit?: (type: NodeType, item: any) => void;
  onDelete?: (type: NodeType, item: any) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "delayed":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    case "ongoing":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

const getTypeColor = (type: NodeType) => {
  switch (type) {
    case "budget":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "project":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "breakdown":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  }
};

export function SearchResultsView({ results, onEdit, onDelete }: SearchResultsViewProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | NodeType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusType>("all");
  const [yearFilter, setYearFilter] = useState<"all" | string>("all");
  const [officeFilter, setOfficeFilter] = useState<"all" | string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: NodeType; item: any } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: NodeType; item: any } | null>(null);

  // Extract unique values for filters
  const { years, offices } = useMemo(() => {
    const yearsSet = new Set<number>();
    const officesSet = new Set<string>();

    const extractValues = (result: SearchResult) => {
      if (result.item.year) yearsSet.add(result.item.year);
      if (result.item.implementingOffice) officesSet.add(result.item.implementingOffice);
      result.children?.forEach(extractValues);
    };

    results.forEach(extractValues);

    return {
      years: Array.from(yearsSet).sort((a, b) => b - a),
      offices: Array.from(officesSet).sort(),
    };
  }, [results]);

  // Filter results
  const filteredResults = useMemo(() => {
    const filterItem = (result: SearchResult): boolean => {
      // Type filter
      if (typeFilter !== "all" && result.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== "all" && result.item.status !== statusFilter) return false;

      // Year filter
      if (yearFilter !== "all" && result.item.year?.toString() !== yearFilter) return false;

      // Office filter
      if (officeFilter !== "all" && result.item.implementingOffice !== officeFilter) return false;

      return true;
    };

    const filterRecursive = (result: SearchResult): SearchResult | null => {
      const matchesCurrent = filterItem(result);
      const filteredChildren = result.children
        ?.map(filterRecursive)
        .filter((child): child is SearchResult => child !== null);

      if (matchesCurrent || (filteredChildren && filteredChildren.length > 0)) {
        return {
          ...result,
          children: filteredChildren,
        };
      }

      return null;
    };

    return results.map(filterRecursive).filter((r): r is SearchResult => r !== null);
  }, [results, typeFilter, statusFilter, yearFilter, officeFilter]);

  const activeFiltersCount = [
    typeFilter !== "all",
    statusFilter !== "all",
    yearFilter !== "all",
    officeFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setYearFilter("all");
    setOfficeFilter("all");
  };

  const handleItemClick = (type: NodeType, item: any) => {
    setSelectedItem({ type, item });
  };

  const handleDelete = (type: NodeType, item: any) => {
    setDeletingItem({ type, item });
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <SearchIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No results found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your search terms or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with total count and filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            Search Results
          </h3>
          <Badge variant="secondary" className="text-sm">
            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-8"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={typeFilter} 
                  onValueChange={(value) => setTypeFilter(value as "all" | NodeType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={statusFilter} 
                  onValueChange={(value) => setStatusFilter(value as "all" | StatusType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Office Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Office</label>
                <Select value={officeFilter} onValueChange={setOfficeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Offices</SelectItem>
                    {offices.map((office) => (
                      <SelectItem key={office} value={office}>
                        {office}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List - Grid Layout Matching TreeView */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No results match your filters</p>
          <Button variant="ghost" onClick={clearFilters} className="mt-2">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredResults.map((result, index) => (
            <SearchResultCard
              key={`${result.type}-${result.item._id || index}`}
              result={result}
              onItemClick={handleItemClick}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <SearchResultDetailModal
          type={selectedItem.type}
          item={selectedItem.item}
          open={!!selectedItem}
          onOpenChange={(open: boolean) => !open && setSelectedItem(null)}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Delete Dialog */}
      {deletingItem && (
        <SearchResultDeleteDialog
          type={deletingItem.type}
          item={deletingItem.item}
          open={!!deletingItem}
          onOpenChange={(open: boolean) => !open && setDeletingItem(null)}
          onSuccess={() => {
            setDeletingItem(null);
            if (onDelete) onDelete(deletingItem.type, deletingItem.item);
          }}
        />
      )}
    </div>
  );
}

// Search Result Card Component with Grid Layout
interface SearchResultCardProps {
  result: SearchResult;
  onItemClick: (type: NodeType, item: any) => void;
  onEdit?: (type: NodeType, item: any) => void;
  onDelete?: (type: NodeType, item: any) => void;
}

function SearchResultCard({ result, onItemClick, onEdit, onDelete }: SearchResultCardProps) {
  const hasChildren = result.children && result.children.length > 0;

  const CardHeader = () => (
    <div className="grid grid-cols-12 gap-2 items-center">
      {/* Column 1-5: Particular Name */}
      <div className="col-span-12 md:col-span-5 flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <Badge variant="outline" className={getTypeColor(result.type)}>
            {result.type}
          </Badge>
          {result.item.status && (
            <Badge variant="outline" className={getStatusColor(result.item.status)}>
              {result.item.status}
            </Badge>
          )}
          {result.type === "budget" && result.item.code && (
            <Badge variant="outline" className="font-mono text-xs">
              {result.item.code}
            </Badge>
          )}
        </div>
        <button
          onClick={() => onItemClick(result.type, result.item)}
          className="text-left group flex-1 min-w-0"
        >
          <h3 className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {result.type === "budget"
              ? result.item.fullName
              : result.type === "project"
              ? result.item.particulars
              : result.item.projectName}
          </h3>
          {result.parent && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Parent: {result.parent}
            </p>
          )}
        </button>
      </div>

      {/* Column 6-8: Implementing Office */}
      <div className="col-span-12 md:col-span-3 flex items-center justify-center">
        {(result.type === "project" || result.type === "breakdown") && result.item.implementingOffice && (
          <Badge variant="secondary" className="text-xs">
            {result.item.implementingOffice}
          </Badge>
        )}
      </div>

      {/* Column 9-12: Budget Info */}
      <div className="col-span-12 md:col-span-4 flex flex-col md:items-end gap-1">
        <p className="text-sm font-semibold">
          {formatCurrency(
            result.type === "breakdown"
              ? result.item.allocatedBudget || 0
              : result.item.totalBudgetAllocated || 0
          )}
        </p>
        <div className="flex items-center gap-2">
          {result.item.utilizationRate !== undefined && (
            <p className="text-xs text-gray-500">
              {result.item.utilizationRate.toFixed(1)}% utilized
            </p>
          )}
          {result.item.year && (
            <Badge variant="secondary" className="text-xs">
              {result.item.year}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex items-center gap-1 mt-3 pt-3 border-t">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onItemClick(result.type, result.item)}
        className="h-8"
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(result.type, result.item)}
          className="h-8"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
      {onDelete && (result.type === "budget" || result.type === "project") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(result.type, result.item)}
          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      )}
    </div>
  );

  if (!hasChildren) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <CardHeader />
          <ActionButtons />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="children" className="border-none">
            <div>
              <CardHeader />
              <div className="flex items-center justify-between mt-3">
                <Badge variant="secondary" className="text-xs">
                  {result.children!.length} {result.children!.length === 1 ? 'child' : 'children'}
                </Badge>
                <AccordionTrigger className="hover:no-underline p-0">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Show children
                  </span>
                </AccordionTrigger>
              </div>
              <ActionButtons />
            </div>

            <AccordionContent>
              <div className="space-y-2 mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                {result.children!.map((child, idx) => (
                  <SearchResultCard
                    key={`${child.type}-${child.item._id || idx}`}
                    result={child}
                    onItemClick={onItemClick}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}