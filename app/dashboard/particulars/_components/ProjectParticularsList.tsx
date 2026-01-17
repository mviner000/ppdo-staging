// app/dashboard/particulars/_components/ProjectParticularsList.tsx

"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Edit,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { ParticularEditDialog } from "./ParticularEditDialog";
import { ParticularDeleteDialog } from "./ParticularDeleteDialog";
import { useParticularPermissions } from "../_hooks/useParticularPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";

type SortField = "fullName" | "year" | "usage";
type SortDirection = "asc" | "desc";

interface ProjectParticularsListProps {
  selectedYear: string;
}

export function ProjectParticularsList({ selectedYear }: ProjectParticularsListProps) {
  const { canEditParticular, canDeleteParticular } = useParticularPermissions();

  const projectParticulars = useQuery(api.projectParticulars.list, {
    includeInactive: true,
  });
  const projects = useQuery(api.projects.list, {});
  // Fetch all active breakdowns using the existing query
  const breakdowns = useQuery(api.govtProjects.getProjectBreakdowns, {});

  const [searchTerm, setSearchTerm] = useState("");
  const [editingParticular, setEditingParticular] = useState<Doc<"projectParticulars"> | null>(null);
  const [deletingParticular, setDeletingParticular] = useState<Doc<"projectParticulars"> | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [expandedFullNames, setExpandedFullNames] = useState<string[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("fullName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const isLoading =
    projectParticulars === undefined ||
    projects === undefined ||
    breakdowns === undefined;

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get children projects for a particular
  const getChildren = (particularCode: string) => {
    if (!projects) return [];
    return projects.filter(
      (project) => project.particulars === particularCode && !project.isDeleted
    );
  };

  // Get breakdowns for a project
  const getProjectBreakdowns = (projectId: string) => {
    if (!breakdowns) return [];
    return breakdowns.filter(
      (breakdown) => breakdown.projectId === projectId && !breakdown.isDeleted
    );
  };

  // Calculate usage count with year filter
  const getUsageCount = (particularCode: string) => {
    const children = getChildren(particularCode);
    if (selectedYear === "all") return children.length;
    return children.filter((child) => child.year?.toString() === selectedYear).length;
  };

  // Filter and sort particulars
  const filteredParticulars = useMemo(() => {
    if (!projectParticulars) return [];

    let filtered = projectParticulars.filter((particular) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        particular.code.toLowerCase().includes(searchLower) ||
        particular.fullName.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Year filter
      if (selectedYear === "all") return true;
      const children = getChildren(particular.code);
      return children.some((child) => child.year?.toString() === selectedYear);
    });

    // Sort
    filtered.sort((a, b) => {
      let compareResult = 0;

      if (sortField === "fullName") {
        compareResult = a.fullName.localeCompare(b.fullName);
      } else if (sortField === "year") {
        const aChildren = getChildren(a.code);
        const bChildren = getChildren(b.code);
        const aYear = Math.max(...aChildren.map((c) => c.year || 0));
        const bYear = Math.max(...bChildren.map((c) => c.year || 0));
        compareResult = aYear - bYear;
      } else if (sortField === "usage") {
        compareResult = getUsageCount(a.code) - getUsageCount(b.code);
      }

      return sortDirection === "asc" ? compareResult : -compareResult;
    });

    return filtered;
  }, [projectParticulars, searchTerm, selectedYear, sortField, sortDirection, projects]);

  const truncateText = (text: string, isExpanded: boolean) => {
    if (isExpanded || text.length <= 20) return text;
    return text.slice(0, 20) + "...";
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Particulars</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search particulars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!canEditParticular && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can view particulars but cannot edit or delete them. Only
                administrators can modify particulars.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredParticulars && filteredParticulars.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("fullName")}
                      className="hover:bg-transparent p-0 h-auto font-semibold"
                    >
                      Full Name
                      <SortIcon field="fullName" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("year")}
                      className="hover:bg-transparent p-0 h-auto font-semibold"
                    >
                      Year
                      <SortIcon field="year" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("usage")}
                      className="hover:bg-transparent p-0 h-auto font-semibold"
                    >
                      Usage
                      <SortIcon field="usage" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticulars.map((particular) => {
                  const children = getChildren(particular.code);
                  const usageCount = getUsageCount(particular.code);
                  const isExpanded = expandedItems.includes(particular._id);
                  const isFullNameExpanded = expandedFullNames.includes(particular._id);

                  return (
                    <ContextMenu key={particular._id}>
                      <ContextMenuTrigger asChild>
                        <>
                          <TableRow className="group">
                            <TableCell>
                              {usageCount > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setExpandedItems(
                                      isExpanded
                                        ? expandedItems.filter((id) => id !== particular._id)
                                        : [...expandedItems, particular._id]
                                    );
                                  }}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => {
                                        if (particular.fullName.length > 20) {
                                          setExpandedFullNames(
                                            isFullNameExpanded
                                              ? expandedFullNames.filter((id) => id !== particular._id)
                                              : [...expandedFullNames, particular._id]
                                          );
                                        }
                                      }}
                                      className="text-left hover:text-blue-600 transition-colors"
                                    >
                                      {truncateText(particular.fullName, isFullNameExpanded)}
                                    </button>
                                  </TooltipTrigger>
                                  {particular.fullName.length > 20 && (
                                    <TooltipContent>
                                      <p className="max-w-xs">{particular.fullName}</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{particular.code}</span>
                                {particular.isSystemDefault && (
                                  <Badge variant="outline" className="text-xs">
                                    System
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {children.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {Array.from(new Set(children.map((c) => c.year)))
                                    .filter(Boolean)
                                    .sort()
                                    .map((year) => (
                                      <Badge key={year} variant="secondary" className="text-xs">
                                        {year}
                                      </Badge>
                                    ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono">
                                {usageCount}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingParticular(particular)}
                                  disabled={!canEditParticular}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingParticular(particular)}
                                  disabled={!canDeleteParticular}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Children Projects */}
                          {isExpanded && children.length > 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-gray-50 dark:bg-gray-900/50 p-0">
                                <div className="px-12 py-3 space-y-2">
                                  {children.map((project) => {
                                    const projectBreakdowns = getProjectBreakdowns(project._id);
                                    const isProjectExpanded = expandedProjects.includes(project._id);

                                    return (
                                      <div key={project._id} className="space-y-2">
                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                          <div className="flex items-center gap-2 flex-1">
                                            {projectBreakdowns.length > 0 && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() => {
                                                  setExpandedProjects(
                                                    isProjectExpanded
                                                      ? expandedProjects.filter((id) => id !== project._id)
                                                      : [...expandedProjects, project._id]
                                                  );
                                                }}
                                              >
                                                {isProjectExpanded ? (
                                                  <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                  <ChevronRight className="h-4 w-4" />
                                                )}
                                              </Button>
                                            )}
                                            <div className="flex-1">
                                              <p className="font-medium text-sm">{project.particulars}</p>
                                              <p className="text-xs text-gray-500">
                                                {project.implementingOffice} • Year: {project.year || "N/A"}
                                              </p>
                                              {projectBreakdowns.length > 0 && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                  {projectBreakdowns.length} breakdown(s)
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm font-medium">
                                              {formatCurrency(project.totalBudgetAllocated)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {project.utilizationRate.toFixed(1)}% utilized
                                            </p>
                                          </div>
                                        </div>

                                        {/* Project Breakdowns */}
                                        {isProjectExpanded && projectBreakdowns.length > 0 && (
                                          <div className="ml-8 space-y-2">
                                            {projectBreakdowns.map((breakdown: Doc<"govtProjectBreakdowns">) => (
                                              <div
                                                key={breakdown._id}
                                                className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800"
                                              >
                                                <p className="text-xs font-medium">{breakdown.projectName}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                  {breakdown.municipality && `${breakdown.municipality} • `}
                                                  {breakdown.barangay && `${breakdown.barangay} • `}
                                                  {formatCurrency(breakdown.allocatedBudget || 0)}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={() => setEditingParticular(particular)}
                          disabled={!canEditParticular}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => setDeletingParticular(particular)}
                          disabled={!canDeleteParticular}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No particulars match your search"
                : "No project particulars found"}
            </div>
          )}
        </CardContent>
      </Card>

      {editingParticular && (
        <ParticularEditDialog
          type="project"
          particular={editingParticular}
          open={!!editingParticular}
          onOpenChange={(open) => !open && setEditingParticular(null)}
          onSuccess={() => setEditingParticular(null)}
        />
      )}

      {deletingParticular && (
        <ParticularDeleteDialog
          type="project"
          particular={deletingParticular}
          open={!!deletingParticular}
          onOpenChange={(open) => !open && setDeletingParticular(null)}
          onSuccess={() => setDeletingParticular(null)}
        />
      )}
    </>
  );
}